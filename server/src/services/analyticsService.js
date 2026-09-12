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

// Development-only timer utility for tracking execution times
const logExecutionTime = (label, startTime) => {
  if (process.env.NODE_ENV !== "production") {
    const elapsed = (performance.now() - startTime).toFixed(2);
    console.log(`[Analytics Perf] ${label}: ${elapsed} ms`);
  }
};

// 1. Headcount & Demographics Analytics
const getHeadcountAnalytics = async () => {
  const start = performance.now();
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

  const [
    total,
    active,
    onLeave,
    inactive,
    newHires,
    departmentDistribution,
    locationDistribution,
    employmentTypeDistribution,
    joiningYearDistribution,
    hiringTrendAgg
  ] = await Promise.all([
    Employee.countDocuments({}),
    Employee.countDocuments({ status: "Active" }),
    Employee.countDocuments({ status: "On Leave" }),
    Employee.countDocuments({ status: "Inactive" }),
    EmploymentHistory.countDocuments({
      eventType: "Joined",
      eventDate: { $gte: startOfYear, $lte: endOfYear }
    }),
    Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { _id: 0, department: "$_id", count: 1 } },
      { $sort: { count: -1 } }
    ]),
    Employee.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $project: { _id: 0, location: "$_id", count: 1 } },
      { $sort: { count: -1 } }
    ]),
    Employee.aggregate([
      { $group: { _id: "$employmentType", count: { $sum: 1 } } },
      { $project: { _id: 0, employmentType: "$_id", count: 1 } },
      { $sort: { count: -1 } }
    ]),
    Employee.aggregate([
      {
        $group: {
          _id: { $year: "$joiningDate" },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, year: "$_id", count: 1 } },
      { $sort: { year: 1 } }
    ]),
    EmploymentHistory.aggregate([
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
    ])
  ]);

  const headcount = {
    total,
    active,
    onLeave,
    inactive,
    newHires
  };

  const hiringMap = {};
  (hiringTrendAgg || []).forEach((item) => {
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

  const result = {
    headcount,
    departmentDistribution: departmentDistribution || [],
    locationDistribution: locationDistribution || [],
    employmentTypeDistribution: employmentTypeDistribution || [],
    joiningYearDistribution: joiningYearDistribution || [],
    hiringTrend
  };

  logExecutionTime("getHeadcountAnalytics", start);
  return result;
};

// 2. Attendance & Leave Analytics
const getAttendanceAnalytics = async (totalEmployeesCount) => {
  const start = performance.now();

  const totalEmpPromise =
    typeof totalEmployeesCount === "number"
      ? Promise.resolve(totalEmployeesCount)
      : Employee.countDocuments({});

  const [
    attendanceAgg,
    attendanceTrend,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    approvedEmployees,
    total
  ] = await Promise.all([
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
    ]),
    LeaveRequest.countDocuments({ status: "Pending" }),
    LeaveRequest.countDocuments({ status: "Approved" }),
    LeaveRequest.countDocuments({ status: "Rejected" }),
    LeaveRequest.distinct("employeeId", { status: "Approved" }),
    totalEmpPromise
  ]);

  let attendance = {
    attendanceRate: 0,
    lateRate: 0,
    absenceRate: 0,
    averageWorkingHours: 0,
    statusBreakdown: { present: 0, late: 0, halfDay: 0, absent: 0 }
  };

  if (attendanceAgg && attendanceAgg.length > 0 && attendanceAgg[0].totalRecords > 0) {
    const a = attendanceAgg[0];
    attendance = {
      attendanceRate: roundOneDecimal((a.presentCount / a.totalRecords) * 100),
      lateRate: roundOneDecimal((a.lateCount / a.totalRecords) * 100),
      absenceRate: roundOneDecimal((a.absentCount / a.totalRecords) * 100),
      averageWorkingHours:
        a.workingHoursCount > 0 ? roundOneDecimal(a.totalWorkingHours / a.workingHoursCount) : 0,
      statusBreakdown: {
        present: a.presentOnlyCount || 0,
        late: a.lateCount || 0,
        halfDay: a.halfDayCount || 0,
        absent: a.absentCount || 0
      }
    };
  }

  const leaveRate =
    total > 0 ? roundOneDecimal(((approvedEmployees || []).length / total) * 100) : 0;

  const leave = {
    leaveRate,
    pendingRequests,
    approvedRequests,
    rejectedRequests
  };

  const result = {
    attendance,
    attendanceTrend: attendanceTrend || [],
    leave
  };

  logExecutionTime("getAttendanceAnalytics", start);
  return result;
};

// 3. Performance Analytics
const getPerformanceAnalytics = async () => {
  const start = performance.now();

  const [perfAgg, performanceRatingDistribution, performanceByDepartment] = await Promise.all([
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
    ]),
    PerformanceReview.aggregate([
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
    ])
  ]);

  let performanceMetrics = {
    averageOverallScore: 0,
    averageProductivityScore: 0,
    averageTeamworkScore: 0,
    averageCommunicationScore: 0,
    averageGoalsCompleted: 0
  };

  if (perfAgg && perfAgg.length > 0) {
    const p = perfAgg[0];
    performanceMetrics = {
      averageOverallScore: roundOneDecimal(p.averageOverallScore),
      averageProductivityScore: roundOneDecimal(p.averageProductivityScore),
      averageTeamworkScore: roundOneDecimal(p.averageTeamworkScore),
      averageCommunicationScore: roundOneDecimal(p.averageCommunicationScore),
      averageGoalsCompleted: roundOneDecimal(p.averageGoalsCompleted)
    };
  }

  const result = {
    performance: performanceMetrics,
    performanceRatingDistribution: performanceRatingDistribution || [],
    performanceByDepartment: performanceByDepartment || []
  };

  logExecutionTime("getPerformanceAnalytics", start);
  return result;
};

// 4. Financial & Payroll Analytics
const getFinancialAnalytics = async () => {
  const start = performance.now();

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
  let payrollTrend = [];

  if (latestPayrollMonth) {
    const [finAgg, deptAgg, trendAgg] = await Promise.all([
      Payroll.aggregate([
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
      ]),
      Payroll.aggregate([
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
      ]),
      Payroll.aggregate([
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
      ])
    ]);

    if (finAgg && finAgg.length > 0) {
      const f = finAgg[0];
      financial = {
        latestPayrollMonth,
        monthlyPayroll: Math.round(f.monthlyPayroll),
        benefitsCost: Math.round(f.benefitsCost),
        bonusCost: Math.round(f.bonusCost),
        averageBaseSalary: Math.round(f.averageBaseSalary)
      };
    }

    payrollByDepartment = deptAgg || [];
    payrollTrend = trendAgg || [];
  }

  const result = {
    financial,
    payrollByDepartment,
    payrollTrend
  };

  logExecutionTime("getFinancialAnalytics", start);
  return result;
};

// 5. Retention & Turnover Analytics
const getRetentionAnalytics = async (totalEmployeesCount) => {
  const start = performance.now();
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

  const totalEmpPromise =
    typeof totalEmployeesCount === "number"
      ? Promise.resolve(totalEmployeesCount)
      : Employee.countDocuments({});

  const [
    resignations,
    newJoiners,
    turnoverByDepartment,
    turnoverTrend,
    recentEmploymentEvents,
    total
  ] = await Promise.all([
    EmploymentHistory.countDocuments({
      eventType: "Resigned",
      eventDate: { $gte: startOfYear, $lte: endOfYear }
    }),
    EmploymentHistory.countDocuments({
      eventType: "Joined",
      eventDate: { $gte: startOfYear, $lte: endOfYear }
    }),
    EmploymentHistory.aggregate([
      { $match: { eventType: "Resigned" } },
      { $group: { _id: "$department", resignations: { $sum: 1 } } },
      { $project: { _id: 0, department: "$_id", resignations: 1 } },
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
      { $project: { _id: 0, month: "$_id", resignations: 1, newHires: 1 } },
      { $sort: { month: 1 } }
    ]),
    EmploymentHistory.aggregate([
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
    ]),
    totalEmpPromise
  ]);

  const turnoverRate = total > 0 ? roundOneDecimal((resignations / total) * 100) : 0;

  const retention = {
    turnoverRate,
    resignations,
    newJoiners
  };

  const result = {
    retention,
    turnoverByDepartment: turnoverByDepartment || [],
    turnoverTrend: turnoverTrend || [],
    recentEmploymentEvents: recentEmploymentEvents || []
  };

  logExecutionTime("getRetentionAnalytics", start);
  return result;
};

// Consolidated Executive Dashboard Analytics
const getDashboardAnalytics = async () => {
  const start = performance.now();

  const [headcountData, performanceData, financialData] = await Promise.all([
    getHeadcountAnalytics(),
    getPerformanceAnalytics(),
    getFinancialAnalytics()
  ]);

  const totalEmployees = headcountData.headcount.total;

  const [attendanceData, retentionData] = await Promise.all([
    getAttendanceAnalytics(totalEmployees),
    getRetentionAnalytics(totalEmployees)
  ]);

  // Actionable Insights Engine (Deterministic JS)
  const insights = [];

  if (attendanceData.leave.pendingRequests > 5) {
    insights.push({
      type: "warning",
      title: "Pending Leave Requests",
      message: `There are ${attendanceData.leave.pendingRequests} leave requests awaiting administrative review.`
    });
  }

  if (
    retentionData.turnoverByDepartment.length > 0 &&
    retentionData.turnoverByDepartment[0].resignations > 0
  ) {
    const topTurnover = retentionData.turnoverByDepartment[0];
    insights.push({
      type: "warning",
      title: "Turnover Hotspot",
      message: `${topTurnover.department} department recorded the highest number of resignations (${topTurnover.resignations}).`
    });
  }

  if (performanceData.performance.averageOverallScore >= 4.0) {
    insights.push({
      type: "positive",
      title: "Strong Performance",
      message: `Overall organization performance rating is strong at ${performanceData.performance.averageOverallScore} / 5.0.`
    });
  } else if (performanceData.performance.averageOverallScore > 0) {
    insights.push({
      type: "info",
      title: "Performance Tracking",
      message: `Overall organization performance rating is currently at ${performanceData.performance.averageOverallScore} / 5.0.`
    });
  }

  if (attendanceData.attendance.attendanceRate >= 90.0) {
    insights.push({
      type: "positive",
      title: "Healthy Attendance",
      message: `Workforce attendance remains healthy at ${attendanceData.attendance.attendanceRate}%.`
    });
  }

  const result = {
    headcount: headcountData.headcount,
    departmentDistribution: headcountData.departmentDistribution,
    locationDistribution: headcountData.locationDistribution,
    employmentTypeDistribution: headcountData.employmentTypeDistribution,
    joiningYearDistribution: headcountData.joiningYearDistribution,
    hiringTrend: headcountData.hiringTrend,
    attendance: attendanceData.attendance,
    attendanceTrend: attendanceData.attendanceTrend,
    leave: attendanceData.leave,
    performance: performanceData.performance,
    performanceRatingDistribution: performanceData.performanceRatingDistribution,
    performanceByDepartment: performanceData.performanceByDepartment,
    financial: financialData.financial,
    payrollByDepartment: financialData.payrollByDepartment,
    payrollTrend: financialData.payrollTrend,
    retention: retentionData.retention,
    turnoverByDepartment: retentionData.turnoverByDepartment,
    turnoverTrend: retentionData.turnoverTrend,
    recentEmploymentEvents: retentionData.recentEmploymentEvents,
    insights: insights.slice(0, 5)
  };

  logExecutionTime("TOTAL getDashboardAnalytics", start);
  return result;
};

module.exports = {
  getDashboardAnalytics,
  getHeadcountAnalytics,
  getAttendanceAnalytics,
  getPerformanceAnalytics,
  getFinancialAnalytics,
  getRetentionAnalytics
};
