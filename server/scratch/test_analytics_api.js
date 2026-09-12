const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

const analyticsService = require("../src/services/analyticsService");
const analyticsRoutes = require("../src/routes/analyticsRoutes");
const employeeRoutes = require("../src/routes/employeeRoutes");
const Employee = require("../src/models/Employee");
const Attendance = require("../src/models/Attendance");
const LeaveRequest = require("../src/models/LeaveRequest");
const PerformanceReview = require("../src/models/PerformanceReview");
const Payroll = require("../src/models/Payroll");
const EmploymentHistory = require("../src/models/EmploymentHistory");

// Synthetic mock dataset setup for fast and deterministic unit/integration test execution
const mockEmployees = [
  {
    _id: "6aa3f7264eeeb531a35ecf00",
    employeeId: "EMP-1001",
    firstName: "Nikhil",
    lastName: "Das",
    email: "nikhil.das.1001@peoplepulse.demo",
    department: "HR",
    designation: "HR Manager",
    location: "Pune",
    status: "Active",
    joiningDate: new Date("2022-06-06"),
    createdAt: new Date("2026-01-01")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf01",
    employeeId: "EMP-1002",
    firstName: "Anjali",
    lastName: "Das",
    email: "anjali.das.1002@peoplepulse.demo",
    department: "Marketing",
    designation: "Content Strategist",
    location: "Chennai",
    status: "Active",
    joiningDate: new Date("2022-12-17"),
    createdAt: new Date("2026-01-02")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf02",
    employeeId: "EMP-1003",
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.sharma.1003@peoplepulse.demo",
    department: "Engineering",
    designation: "Frontend Developer",
    location: "Bangalore",
    status: "Active",
    joiningDate: new Date("2024-03-15"),
    createdAt: new Date("2026-01-03")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf03",
    employeeId: "EMP-1004",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel.1004@peoplepulse.demo",
    department: "Engineering",
    designation: "Backend Developer",
    location: "Chennai",
    status: "On Leave",
    joiningDate: new Date("2026-02-10"),
    createdAt: new Date("2026-01-04")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf04",
    employeeId: "EMP-1005",
    firstName: "Rohan",
    lastName: "Verma",
    email: "rohan.verma.1005@peoplepulse.demo",
    department: "Design",
    designation: "UI Designer",
    location: "Mumbai",
    status: "Inactive",
    joiningDate: new Date("2025-08-20"),
    createdAt: new Date("2026-01-05")
  }
];

const mockAttendance = [
  { employeeId: "EMP-1001", date: new Date("2026-02-01"), status: "Present", workingHours: 8.5 },
  { employeeId: "EMP-1002", date: new Date("2026-02-01"), status: "Present", workingHours: 8.5 },
  { employeeId: "EMP-1003", date: new Date("2026-02-01"), status: "Late", workingHours: 7.5 },
  { employeeId: "EMP-1004", date: new Date("2026-02-01"), status: "Absent", workingHours: 0 },
  { employeeId: "EMP-1005", date: new Date("2026-02-01"), status: "Half Day", workingHours: 4.0 }
];

const mockLeaveRequests = [
  { employeeId: "EMP-1001", leaveType: "Annual", startDate: new Date("2026-03-01"), endDate: new Date("2026-03-03"), status: "Approved" },
  { employeeId: "EMP-1004", leaveType: "Sick", startDate: new Date("2026-03-05"), endDate: new Date("2026-03-06"), status: "Pending" },
  { employeeId: "EMP-1002", leaveType: "Personal", startDate: new Date("2026-03-10"), endDate: new Date("2026-03-11"), status: "Rejected" }
];

const mockPerformanceReviews = [
  { employeeId: "EMP-1001", reviewPeriod: "2025-H2", overallScore: 4.5, productivityScore: 4.6, teamworkScore: 4.4, communicationScore: 4.5, goalsCompleted: 90, reviewDate: new Date("2025-12-31") },
  { employeeId: "EMP-1003", reviewPeriod: "2025-H2", overallScore: 4.2, productivityScore: 4.3, teamworkScore: 4.1, communicationScore: 4.0, goalsCompleted: 85, reviewDate: new Date("2025-12-31") },
  { employeeId: "EMP-1005", reviewPeriod: "2025-H2", overallScore: 3.5, productivityScore: 3.4, teamworkScore: 3.6, communicationScore: 3.5, goalsCompleted: 75, reviewDate: new Date("2025-12-31") }
];

const mockPayrolls = [
  { employeeId: "EMP-1001", month: "2026-02", baseSalary: 110000, benefits: 11000, bonus: 5500, totalCost: 126500 },
  { employeeId: "EMP-1002", month: "2026-02", baseSalary: 75000, benefits: 7500, bonus: 3750, totalCost: 86250 },
  { employeeId: "EMP-1003", month: "2026-02", baseSalary: 90000, benefits: 9000, bonus: 4500, totalCost: 103500 },
  { employeeId: "EMP-1004", month: "2026-02", baseSalary: 90000, benefits: 9000, bonus: 4500, totalCost: 103500 },
  { employeeId: "EMP-1005", month: "2026-02", baseSalary: 60000, benefits: 6000, bonus: 3000, totalCost: 69000 }
];

const mockEmploymentHistory = [
  { employeeId: "EMP-1001", eventType: "Joined", eventDate: new Date("2022-06-06"), department: "HR", reason: "New Hire" },
  { employeeId: "EMP-1002", eventType: "Joined", eventDate: new Date("2022-12-17"), department: "Marketing", reason: "New Hire" },
  { employeeId: "EMP-1003", eventType: "Joined", eventDate: new Date("2024-03-15"), department: "Engineering", reason: "New Hire" },
  { employeeId: "EMP-1004", eventType: "Joined", eventDate: new Date("2026-02-10"), department: "Engineering", reason: "New Hire" },
  { employeeId: "EMP-1005", eventType: "Resigned", eventDate: new Date("2026-01-15"), department: "Design", reason: "Career Growth" }
];

// Helper to mock Mongoose countDocuments, aggregate, distinct, find
Employee.countDocuments = async function (filter = {}) {
  if (filter.status) return mockEmployees.filter((e) => e.status === filter.status).length;
  return mockEmployees.length;
};

Employee.aggregate = async function (pipeline) {
  const groupStage = pipeline.find((p) => p.$group);
  if (groupStage && groupStage.$group._id === "$department") {
    const counts = {};
    mockEmployees.forEach((e) => { counts[e.department] = (counts[e.department] || 0) + 1; });
    return Object.keys(counts).map((dept) => ({ department: dept, count: counts[dept] })).sort((a, b) => b.count - a.count);
  }
  if (groupStage && groupStage.$group._id === "$location") {
    const counts = {};
    mockEmployees.forEach((e) => { counts[e.location] = (counts[e.location] || 0) + 1; });
    return Object.keys(counts).map((loc) => ({ location: loc, count: counts[loc] })).sort((a, b) => b.count - a.count);
  }
  return [];
};

Employee.find = function () {
  return {
    sort: () => ({ skip: () => ({ limit: () => Promise.resolve(mockEmployees) }) })
  };
};

Attendance.aggregate = async function () {
  const totalRecords = mockAttendance.length;
  const presentCount = mockAttendance.filter((a) => ["Present", "Late", "Half Day"].includes(a.status)).length;
  const lateCount = mockAttendance.filter((a) => a.status === "Late").length;
  const absentCount = mockAttendance.filter((a) => a.status === "Absent").length;
  const totalWorkingHours = mockAttendance.reduce((acc, curr) => acc + curr.workingHours, 0);
  const workingHoursCount = mockAttendance.filter((a) => a.workingHours > 0).length;

  return [{
    totalRecords,
    presentCount,
    lateCount,
    absentCount,
    totalWorkingHours,
    workingHoursCount
  }];
};

LeaveRequest.countDocuments = async function (filter = {}) {
  if (filter.status) return mockLeaveRequests.filter((l) => l.status === filter.status).length;
  return mockLeaveRequests.length;
};

LeaveRequest.distinct = async function (field, filter = {}) {
  if (field === "employeeId" && filter.status === "Approved") {
    return Array.from(new Set(mockLeaveRequests.filter((l) => l.status === "Approved").map((l) => l.employeeId)));
  }
  return [];
};

PerformanceReview.aggregate = async function (pipeline) {
  const isDeptLookup = pipeline.some((p) => p.$lookup);
  if (isDeptLookup) {
    const deptScores = {};
    mockPerformanceReviews.forEach((p) => {
      const emp = mockEmployees.find((e) => e.employeeId === p.employeeId);
      if (emp) {
        if (!deptScores[emp.department]) deptScores[emp.department] = [];
        deptScores[emp.department].push(p.overallScore);
      }
    });
    return Object.keys(deptScores).map((dept) => {
      const avg = deptScores[dept].reduce((a, b) => a + b, 0) / deptScores[dept].length;
      return { department: dept, averageScore: Math.round(avg * 10) / 10 };
    }).sort((a, b) => b.averageScore - a.averageScore);
  }

  const avgOverall = mockPerformanceReviews.reduce((a, b) => a + b.overallScore, 0) / mockPerformanceReviews.length;
  const avgProd = mockPerformanceReviews.reduce((a, b) => a + b.productivityScore, 0) / mockPerformanceReviews.length;
  const avgTeam = mockPerformanceReviews.reduce((a, b) => a + b.teamworkScore, 0) / mockPerformanceReviews.length;
  const avgComm = mockPerformanceReviews.reduce((a, b) => a + b.communicationScore, 0) / mockPerformanceReviews.length;
  const avgGoals = mockPerformanceReviews.reduce((a, b) => a + b.goalsCompleted, 0) / mockPerformanceReviews.length;

  return [{
    averageOverallScore: avgOverall,
    averageProductivityScore: avgProd,
    averageTeamworkScore: avgTeam,
    averageCommunicationScore: avgComm,
    averageGoalsCompleted: avgGoals
  }];
};

Payroll.findOne = function () {
  return {
    sort: () => ({
      select: () => ({
        lean: () => Promise.resolve({ month: "2026-02" })
      })
    })
  };
};

Payroll.aggregate = async function (pipeline) {
  const isDeptLookup = pipeline.some((p) => p.$lookup);
  if (isDeptLookup) {
    const deptPayroll = {};
    mockPayrolls.forEach((p) => {
      const emp = mockEmployees.find((e) => e.employeeId === p.employeeId);
      if (emp) {
        deptPayroll[emp.department] = (deptPayroll[emp.department] || 0) + p.totalCost;
      }
    });
    return Object.keys(deptPayroll).map((dept) => ({ department: dept, payrollCost: deptPayroll[dept] })).sort((a, b) => b.payrollCost - a.payrollCost);
  }

  const monthlyPayroll = mockPayrolls.reduce((a, b) => a + b.totalCost, 0);
  const benefitsCost = mockPayrolls.reduce((a, b) => a + b.benefits, 0);
  const bonusCost = mockPayrolls.reduce((a, b) => a + b.bonus, 0);
  const averageBaseSalary = mockPayrolls.reduce((a, b) => a + b.baseSalary, 0) / mockPayrolls.length;

  return [{
    monthlyPayroll,
    benefitsCost,
    bonusCost,
    averageBaseSalary
  }];
};

EmploymentHistory.countDocuments = async function (filter = {}) {
  if (filter.eventType) {
    return mockEmploymentHistory.filter((h) => h.eventType === filter.eventType).length;
  }
  return mockEmploymentHistory.length;
};

EmploymentHistory.aggregate = async function (pipeline) {
  const matchStage = pipeline.find((p) => p.$match);
  if (matchStage && matchStage.$match.eventType === "Joined") {
    return [{ _id: "2026-02", count: 1 }];
  }
  if (matchStage && matchStage.$match.eventType === "Resigned") {
    const counts = {};
    mockEmploymentHistory.filter((h) => h.eventType === "Resigned").forEach((h) => {
      counts[h.department] = (counts[h.department] || 0) + 1;
    });
    return Object.keys(counts).map((dept) => ({ department: dept, resignations: counts[dept] }));
  }
  // Default recent events
  return mockEmploymentHistory.map((h) => {
    const emp = mockEmployees.find((e) => e.employeeId === h.employeeId) || {};
    return {
      employeeId: h.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      eventType: h.eventType,
      eventDate: h.eventDate,
      department: h.department,
      reason: h.reason
    };
  });
};

const app = express();
app.use(express.json());
app.use("/api/analytics", analyticsRoutes);
app.use("/api/employees", employeeRoutes);

function makeRequest(port, method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: port,
      path: path,
      method: method,
      headers: { "Content-Type": "application/json" }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function runAnalyticsTests() {
  console.log("=================================================");
  console.log(" MILESTONE 8: CONSOLIDATED HR ANALYTICS TEST SUITE");
  console.log("=================================================");

  const server = app.listen(5008);
  const port = 5008;

  const testResults = [];
  function recordTest(id, name, passed, detail = "") {
    console.log(`[Test ${id}] ${name} -> ${passed ? "PASSED" : "FAILED"} ${detail ? `(${detail})` : ""}`);
    testResults.push({ id, name, passed, detail });
  }

  try {
    const res = await makeRequest(port, "GET", "/api/analytics/dashboard");
    const d = res.body.data || {};

    // 1. HTTP 200
    recordTest(1, "HTTP 200 OK status code", res.status === 200);
    // 2. success === true
    recordTest(2, "Response success property is true", res.body.success === true);
    // 3. headcount exists
    recordTest(3, "Headcount metrics section exists", Boolean(d.headcount));
    // 4. headcount values are numbers
    const hcValid = typeof d.headcount?.total === "number" && typeof d.headcount?.active === "number" && typeof d.headcount?.onLeave === "number" && typeof d.headcount?.inactive === "number" && typeof d.headcount?.newHires === "number";
    recordTest(4, "Headcount fields are valid numbers", hcValid);
    // 5. departmentDistribution is array
    recordTest(5, "departmentDistribution is an Array", Array.isArray(d.departmentDistribution));
    // 6. locationDistribution is array
    recordTest(6, "locationDistribution is an Array", Array.isArray(d.locationDistribution));
    // 7. hiringTrend contains 12 months
    recordTest(7, "hiringTrend contains all 12 calendar months", Array.isArray(d.hiringTrend) && d.hiringTrend.length === 12);
    // 8. attendance metrics are numbers
    const attValid = typeof d.attendance?.attendanceRate === "number" && typeof d.attendance?.lateRate === "number" && typeof d.attendance?.absenceRate === "number" && typeof d.attendance?.averageWorkingHours === "number";
    recordTest(8, "Attendance metrics are valid numbers", attValid);
    // 9. leave metrics are numbers
    const leaveValid = typeof d.leave?.leaveRate === "number" && typeof d.leave?.pendingRequests === "number" && typeof d.leave?.approvedRequests === "number" && typeof d.leave?.rejectedRequests === "number";
    recordTest(9, "Leave metrics are valid numbers", leaveValid);
    // 10. performance metrics are numbers
    const perfValid = typeof d.performance?.averageOverallScore === "number" && typeof d.performance?.averageProductivityScore === "number" && typeof d.performance?.averageTeamworkScore === "number" && typeof d.performance?.averageCommunicationScore === "number" && typeof d.performance?.averageGoalsCompleted === "number";
    recordTest(10, "Performance metrics are valid numbers", perfValid);
    // 11. performanceByDepartment is array
    recordTest(11, "performanceByDepartment is an Array", Array.isArray(d.performanceByDepartment));
    // 12. financial metrics exist
    const finValid = typeof d.financial?.monthlyPayroll === "number" && typeof d.financial?.benefitsCost === "number" && typeof d.financial?.bonusCost === "number" && typeof d.financial?.averageBaseSalary === "number";
    recordTest(12, "Financial metrics exist and are numbers", finValid);
    // 13. latestPayrollMonth is valid YYYY-MM
    recordTest(13, "latestPayrollMonth is a valid YYYY-MM string", /^\d{4}-\d{2}$/.test(d.financial?.latestPayrollMonth));
    // 14. payrollByDepartment is array
    recordTest(14, "payrollByDepartment is an Array", Array.isArray(d.payrollByDepartment));
    // 15. retention metrics exist
    const retValid = typeof d.retention?.turnoverRate === "number" && typeof d.retention?.resignations === "number" && typeof d.retention?.newJoiners === "number";
    recordTest(15, "Retention & turnover metrics exist", retValid);
    // 16. turnoverByDepartment is array
    recordTest(16, "turnoverByDepartment is an Array", Array.isArray(d.turnoverByDepartment));
    // 17. recentEmploymentEvents is array
    recordTest(17, "recentEmploymentEvents is an Array", Array.isArray(d.recentEmploymentEvents));
    // 18. insights is array
    recordTest(18, "Actionable insights is an Array (3-5 items)", Array.isArray(d.insights) && d.insights.length >= 1 && d.insights.length <= 5);
    // 19. percentages are within sensible ranges (0-100)
    const pctValid = d.attendance?.attendanceRate >= 0 && d.attendance?.attendanceRate <= 100 && d.leave?.leaveRate >= 0 && d.leave?.leaveRate <= 100 && d.retention?.turnoverRate >= 0 && d.retention?.turnoverRate <= 100 && d.performance?.averageGoalsCompleted >= 0 && d.performance?.averageGoalsCompleted <= 100;
    recordTest(19, "All percentage metrics are within 0-100% range", pctValid);
    // 20. performance scores remain between 1 and 5
    const scoresValid = d.performance?.averageOverallScore >= 1.0 && d.performance?.averageOverallScore <= 5.0 && d.performance?.averageProductivityScore >= 1.0 && d.performance?.averageProductivityScore <= 5.0;
    recordTest(20, "Performance scores remain between 1.0 and 5.0", scoresValid);
    // 21. no password/sensitive fields returned
    const noSensitive = JSON.stringify(res.body).includes("password") === false && JSON.stringify(res.body).includes("JWT_SECRET") === false;
    recordTest(21, "No password or sensitive credentials fields returned", noSensitive);
    // 22. latest payroll month matches database
    recordTest(22, "latestPayrollMonth matches latest month in database ('2026-02')", d.financial?.latestPayrollMonth === "2026-02");
    // 23. total payroll equals aggregation result sum of department payrolls
    const deptSum = d.payrollByDepartment.reduce((acc, curr) => acc + curr.payrollCost, 0);
    recordTest(23, "Total monthly payroll matches sum of department costs", d.financial?.monthlyPayroll === deptSum, `monthlyPayroll: ${d.financial?.monthlyPayroll}, deptSum: ${deptSum}`);
    // 24. department headcount totals match Employee collection
    const deptHeadcountSum = d.departmentDistribution.reduce((acc, curr) => acc + curr.count, 0);
    recordTest(24, "Department distribution total matches total headcount", deptHeadcountSum === d.headcount?.total, `deptHeadcountSum: ${deptHeadcountSum}, headcount.total: ${d.headcount?.total}`);

    // 25. Existing CRUD API regression
    const crudRes = await makeRequest(port, "GET", "/api/employees");
    recordTest(25, "Existing Employee CRUD API regression test", crudRes.status === 200 && crudRes.body.success === true);

    // 26. Existing Advanced Search API regression
    const searchRes = await makeRequest(port, "GET", "/api/employees?department=Engineering&status=Active");
    recordTest(26, "Existing Advanced Search API regression test", searchRes.status === 200 && searchRes.body.success === true);

    console.log("\n=================================================");
    const passedCount = testResults.filter((t) => t.passed).length;
    console.log(`MILESTONE 8 TEST RESULT: ${passedCount} / ${testResults.length} PASSED`);
    console.log("=================================================");
  } finally {
    server.close();
  }
}

runAnalyticsTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
