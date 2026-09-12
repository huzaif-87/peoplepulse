const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const PerformanceReview = require("../models/PerformanceReview");
const Payroll = require("../models/Payroll");
const EmploymentHistory = require("../models/EmploymentHistory");

/**
 * Exact Definitions for HR Metrics:
 * - attendanceRate: (Present + Late + Half Day records) / totalAttendanceRecords * 100
 * - lateRate: Late records / totalAttendanceRecords * 100
 * - absenceRate: Absent records / totalAttendanceRecords * 100
 * - leaveRate: distinct employees with approved leave / total employees * 100
 * - turnoverRate: resignations in current calendar year / total employees * 100
 * - newHires: joined events in current calendar year
 */

const roundOneDecimal = (num) =>
  typeof num === "number" && !isNaN(num) ? Math.round(num * 10) / 10 : 0;

const getDashboardAnalytics = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

  // 1. Headcount & Demographics
  const [total, active, onLeave, inactive, newHires] = await Promise.all([
    Employee.countDocuments({}),
    Employee.countDocuments({ status: "Active" }),
    Employee.countDocuments({ status: "On Leave" }),
    Employee.countDocuments({ status: "Inactive" }),
    EmploymentHistory.countDocuments({
      eventType: "Joined",
      eventDate: { $gte: startOfYear, $lte: endOfYear }
    })
  ]);

  const headcount = {
    total,
    active,
    onLeave,
    inactive,
    newHires
  };

  // 2. Department Distribution
  const departmentDistribution = await Employee.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $project: { _id: 0, department: "$_id", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  // 3. Location Distribution
  const locationDistribution = await Employee.aggregate([
    { $group: { _id: "$location", count: { $sum: 1 } } },
    { $project: { _id: 0, location: "$_id", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  // 3b. Employment Type Distribution
  const employmentTypeDistribution = await Employee.aggregate([
    { $group: { _id: "$employmentType", count: { $sum: 1 } } },
    { $project: { _id: 0, employmentType: "$_id", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  // 3c. Joining Year Distribution
  const joiningYearDistribution = await Employee.aggregate([
    {
      $group: {
        _id: { $year: "$joiningDate" },
        count: { $sum: 1 }
      }
    },
    { $project: { _id: 0, year: "$_id", count: 1 } },
    { $sort: { year: 1 } }
  ]);

  // 4. Hiring Trend (All 12 months for current calendar year)
  const hiringTrendAgg = await EmploymentHistory.aggregate([
    {
      $match: {
        eventType: "Joined",
        eventDate: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$eventDate" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const hiringMap = {};
  hiringTrendAgg.forEach((item) => {
    hiringMap[item._id] = item.count;
  });

  const hiringTrend = [];
  for (let m = 1; m <= 12; m++) {
    const monthStr = `${currentYear}-${String(m).padStart(2, "0")}`;
    hiringTrend.push({
      period: monthStr,
      count: hiringMap[monthStr] || 0
    });
  }

  // 5. Attendance Analytics & Status Breakdown & Trend
  const [attendanceAgg, attendanceTrend] = await Promise.all([
    Attendance.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [{ $in: ["$status", ["Present", "Late", "Half Day"]] }, 1, 0]
            }
          },
          presentOnlyCount: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] }
          },
          halfDayCount: {
            $sum: { $cond: [{ $eq: ["$status", "Half Day"] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] }
          },
          totalWorkingHours: {
            $sum: { $cond: [{ $gt: ["$workingHours", 0] }, "$workingHours", 0] }
          },
          workingHoursCount: {
            $sum: { $cond: [{ $gt: ["$workingHours", 0] }, 1, 0] }
          }
        }
      }
    ]),
    Attendance.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalRecords: { $sum: 1 },
          presentRecords: {
            $sum: { $cond: [{ $in: ["$status", ["Present", "Late", "Half Day"]] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          attendanceRate: {
            $round: [{ $multiply: [{ $divide: ["$presentRecords", "$totalRecords"] }, 100] }, 1]
          }
        }
      },
      { $sort: { month: 1 } }
    ])
  ]);

  let attendance = {
    attendanceRate: 0,
    lateRate: 0,
    absenceRate: 0,
    averageWorkingHours: 0,
    statusBreakdown: { present: 0, late: 0, halfDay: 0, absent: 0 }
  };

  if (attendanceAgg.length > 0 && attendanceAgg[0].totalRecords > 0) {
    const a = attendanceAgg[0];
    attendance = {
      attendanceRate: roundOneDecimal((a.presentCount / a.totalRecords) * 100),
      lateRate: roundOneDecimal((a.lateCount / a.totalRecords) * 100),
      absenceRate: roundOneDecimal((a.absentCount / a.totalRecords) * 100),
      averageWorkingHours:
        a.workingHoursCount > 0
          ? roundOneDecimal(a.totalWorkingHours / a.workingHoursCount)
          : 0,
      statusBreakdown: {
        present: a.presentOnlyCount || 0,
        late: a.lateCount || 0,
        halfDay: a.halfDayCount || 0,
        absent: a.absentCount || 0
      }
    };
  }

  // 6. Leave Analytics
  const [pendingRequests, approvedRequests, rejectedRequests, approvedEmployees] =
    await Promise.all([
      LeaveRequest.countDocuments({ status: "Pending" }),
      LeaveRequest.countDocuments({ status: "Approved" }),
      LeaveRequest.countDocuments({ status: "Rejected" }),
      LeaveRequest.distinct("employeeId", { status: "Approved" })
    ]);

  const leaveRate =
    total > 0 ? roundOneDecimal((approvedEmployees.length / total) * 100) : 0;

  const leave = {
    leaveRate,
    pendingRequests,
    approvedRequests,
    rejectedRequests
  };

  // 7. Performance Analytics & Distribution
  const [perfAgg, performanceRatingDistribution] = await Promise.all([
    PerformanceReview.aggregate([
      {
        $group: {
          _id: null,
          averageOverallScore: { $avg: "$overallScore" },
          averageProductivityScore: { $avg: "$productivityScore" },
          averageTeamworkScore: { $avg: "$teamworkScore" },
          averageCommunicationScore: { $avg: "$communicationScore" },
          averageGoalsCompleted: { $avg: "$goalsCompleted" }
        }
      }
    ]),
    PerformanceReview.aggregate([
      {
        $project: {
          category: {
            $switch: {
              branches: [
                { case: { $gte: ["$overallScore", 4.5] }, then: "Outstanding" },
                { case: { $gte: ["$overallScore", 4.0] }, then: "Strong" },
                { case: { $gte: ["$overallScore", 3.0] }, then: "Developing" }
              ],
              default: "Needs Improvement"
            }
          }
        }
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } }
    ])
  ]);

  let performance = {
    averageOverallScore: 0,
    averageProductivityScore: 0,
    averageTeamworkScore: 0,
    averageCommunicationScore: 0,
    averageGoalsCompleted: 0
  };

  if (perfAgg.length > 0) {
    const p = perfAgg[0];
    performance = {
      averageOverallScore: roundOneDecimal(p.averageOverallScore),
      averageProductivityScore: roundOneDecimal(p.averageProductivityScore),
      averageTeamworkScore: roundOneDecimal(p.averageTeamworkScore),
      averageCommunicationScore: roundOneDecimal(p.averageCommunicationScore),
      averageGoalsCompleted: roundOneDecimal(p.averageGoalsCompleted)
    };
  }

  // 8. Performance By Department
  const performanceByDepartment = await PerformanceReview.aggregate([
    {
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "employeeId",
        as: "employee"
      }
    },
    { $unwind: "$employee" },
    {
      $group: {
        _id: "$employee.department",
        averageScore: { $avg: "$overallScore" }
      }
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        averageScore: { $round: ["$averageScore", 1] }
      }
    },
    { $sort: { averageScore: -1 } }
  ]);

  // 9. Financial Analytics (Latest Payroll Month)
  const latestPayrollDoc = await Payroll.findOne().sort({ month: -1 }).select("month").lean();
  const latestPayrollMonth = latestPayrollDoc ? latestPayrollDoc.month : null;

  let financial = {
    latestPayrollMonth,
    monthlyPayroll: 0,
    benefitsCost: 0,
    bonusCost: 0,
    averageBaseSalary: 0
  };

  let payrollByDepartment = [];

  if (latestPayrollMonth) {
    const finAgg = await Payroll.aggregate([
      { $match: { month: latestPayrollMonth } },
      {
        $group: {
          _id: null,
          monthlyPayroll: { $sum: "$totalCost" },
          benefitsCost: { $sum: "$benefits" },
          bonusCost: { $sum: "$bonus" },
          averageBaseSalary: { $avg: "$baseSalary" }
        }
      }
    ]);

    if (finAgg.length > 0) {
      const f = finAgg[0];
      financial = {
        latestPayrollMonth,
        monthlyPayroll: Math.round(f.monthlyPayroll),
        benefitsCost: Math.round(f.benefitsCost),
        bonusCost: Math.round(f.bonusCost),
        averageBaseSalary: Math.round(f.averageBaseSalary)
      };
    }

    // 10. Payroll By Department
    payrollByDepartment = await Payroll.aggregate([
      { $match: { month: latestPayrollMonth } },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "employeeId",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $group: {
          _id: "$employee.department",
          payrollCost: { $sum: "$totalCost" }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          payrollCost: { $round: ["$payrollCost", 0] }
        }
      },
      { $sort: { payrollCost: -1 } }
    ]);
  }

  // 10b. Historical Payroll Trend
  const payrollTrend = await Payroll.aggregate([
    {
      $group: {
        _id: "$month",
        totalPayroll: { $sum: "$totalCost" },
        benefitsCost: { $sum: "$benefits" },
        bonusCost: { $sum: "$bonus" }
      }
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        totalPayroll: { $round: ["$totalPayroll", 0] },
        benefitsCost: { $round: ["$benefitsCost", 0] },
        bonusCost: { $round: ["$bonusCost", 0] }
      }
    },
    { $sort: { month: 1 } }
  ]);

  // 11. Retention & Turnover
  const [resignations, newJoiners] = await Promise.all([
    EmploymentHistory.countDocuments({
      eventType: "Resigned",
      eventDate: { $gte: startOfYear, $lte: endOfYear }
    }),
    EmploymentHistory.countDocuments({
      eventType: "Joined",
      eventDate: { $gte: startOfYear, $lte: endOfYear }
    })
  ]);

  const turnoverRate = total > 0 ? roundOneDecimal((resignations / total) * 100) : 0;

  const retention = {
    turnoverRate,
    resignations,
    newJoiners
  };

  // 12. Turnover By Department & Turnover Trend
  const [turnoverByDepartment, turnoverTrend] = await Promise.all([
    EmploymentHistory.aggregate([
      {
        $match: {
          eventType: "Resigned"
        }
      },
      {
        $group: {
          _id: "$department",
          resignations: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          resignations: 1
        }
      },
      { $sort: { resignations: -1 } }
    ]),
    EmploymentHistory.aggregate([
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$eventDate" } },
            eventType: "$eventType"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.month",
          resignations: {
            $sum: { $cond: [{ $eq: ["$_id.eventType", "Resigned"] }, "$count", 0] }
          },
          newHires: {
            $sum: { $cond: [{ $eq: ["$_id.eventType", "Joined"] }, "$count", 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          resignations: 1,
          newHires: 1
        }
      },
      { $sort: { month: 1 } }
    ])
  ]);

  // 13. Recent Employment Events (Latest 8 events)
  const recentEmploymentEvents = await EmploymentHistory.aggregate([
    { $sort: { eventDate: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "employeeId",
        as: "employee"
      }
    },
    {
      $project: {
        _id: 0,
        employeeId: 1,
        firstName: { $arrayElemAt: ["$employee.firstName", 0] },
        lastName: { $arrayElemAt: ["$employee.lastName", 0] },
        eventType: 1,
        eventDate: 1,
        department: 1,
        reason: 1
      }
    }
  ]);

  // 14. Actionable Insights Engine (Deterministic JS)
  const insights = [];

  if (leave.pendingRequests > 5) {
    insights.push({
      type: "warning",
      title: "Pending Leave Requests",
      message: `There are ${leave.pendingRequests} leave requests awaiting administrative review.`
    });
  }

  if (turnoverByDepartment.length > 0 && turnoverByDepartment[0].resignations > 0) {
    const topTurnover = turnoverByDepartment[0];
    insights.push({
      type: "warning",
      title: "Turnover Hotspot",
      message: `${topTurnover.department} department recorded the highest number of resignations (${topTurnover.resignations}).`
    });
  }

  if (performance.averageOverallScore >= 4.0) {
    insights.push({
      type: "positive",
      title: "Strong Performance",
      message: `Overall organization performance rating is strong at ${performance.averageOverallScore} / 5.0.`
    });
  } else if (performance.averageOverallScore > 0) {
    insights.push({
      type: "info",
      title: "Performance Tracking",
      message: `Overall organization performance rating is currently at ${performance.averageOverallScore} / 5.0.`
    });
  }

  if (attendance.attendanceRate >= 90.0) {
    insights.push({
      type: "positive",
      title: "Healthy Attendance",
      message: `Workforce attendance remains healthy at ${attendance.attendanceRate}%.`
    });
  }

  return {
    headcount,
    departmentDistribution,
    locationDistribution,
    employmentTypeDistribution,
    joiningYearDistribution,
    hiringTrend,
    attendance,
    attendanceTrend,
    leave,
    performance,
    performanceRatingDistribution,
    performanceByDepartment,
    financial,
    payrollByDepartment,
    payrollTrend,
    retention,
    turnoverByDepartment,
    turnoverTrend,
    recentEmploymentEvents,
    insights: insights.slice(0, 5)
  };
};

module.exports = {
  getDashboardAnalytics
};
