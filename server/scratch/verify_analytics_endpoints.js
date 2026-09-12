const express = require("express");
const http = require("http");
const analyticsRoutes = require("../src/routes/analyticsRoutes");
const employeeRoutes = require("../src/routes/employeeRoutes");
const Employee = require("../src/models/Employee");
const Attendance = require("../src/models/Attendance");
const LeaveRequest = require("../src/models/LeaveRequest");
const PerformanceReview = require("../src/models/PerformanceReview");
const Payroll = require("../src/models/Payroll");
const EmploymentHistory = require("../src/models/EmploymentHistory");

// Synthetic mock dataset setup for fast and deterministic integration test execution
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
  }
];

Employee.countDocuments = async function (filter = {}) {
  if (filter.status) return mockEmployees.filter((e) => e.status === filter.status).length;
  return mockEmployees.length;
};

Employee.aggregate = async function (pipeline) {
  const groupStage = pipeline.find((p) => p.$group);
  if (groupStage && groupStage.$group._id === "$department") {
    return [{ department: "HR", count: 1 }, { department: "Marketing", count: 1 }];
  }
  if (groupStage && groupStage.$group._id === "$location") {
    return [{ location: "Pune", count: 1 }, { location: "Chennai", count: 1 }];
  }
  return [];
};

Employee.find = function () {
  return {
    sort: () => ({ skip: () => ({ limit: () => Promise.resolve(mockEmployees) }) })
  };
};

Attendance.aggregate = async function () {
  return [{
    totalRecords: 5,
    presentCount: 3,
    lateCount: 1,
    absentCount: 1,
    totalWorkingHours: 28.5,
    workingHoursCount: 4
  }];
};

LeaveRequest.countDocuments = async function (filter = {}) {
  if (filter.status) return 1;
  return 3;
};

LeaveRequest.distinct = async function () {
  return ["EMP-1001"];
};

PerformanceReview.aggregate = async function () {
  return [{
    averageOverallScore: 4.2,
    averageProductivityScore: 4.3,
    averageTeamworkScore: 4.1,
    averageCommunicationScore: 4.0,
    averageGoalsCompleted: 85
  }];
};

Payroll.findOne = function () {
  return {
    sort: () => ({ select: () => ({ lean: () => Promise.resolve({ month: "2026-02" }) }) })
  };
};

Payroll.aggregate = async function () {
  return [{
    monthlyPayroll: 200000,
    benefitsCost: 20000,
    bonusCost: 10000,
    averageBaseSalary: 85000
  }];
};

EmploymentHistory.countDocuments = async function () {
  return 1;
};

EmploymentHistory.aggregate = async function () {
  return [{ _id: "2026-02", count: 1 }];
};

const app = express();
app.use(express.json());
app.use("/api/analytics", analyticsRoutes);
app.use("/api/employees", employeeRoutes);

function measureHttpRequest(port, path) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const options = {
      hostname: "127.0.0.1",
      port: port,
      path: path,
      method: "GET",
      headers: { "Content-Type": "application/json" }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        const endTime = performance.now();
        const rttMs = (endTime - startTime).toFixed(2);
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed, rttMs });
        } catch (e) {
          resolve({ status: res.statusCode, body: body, rttMs });
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function verifyAllEndpoints() {
  console.log("=================================================");
  console.log(" VERIFYING ANALYTICS HTTP ENDPOINTS & STRUCTURES ");
  console.log("=================================================");

  const server = app.listen(5009);
  const port = 5009;

  const endpoints = [
    { path: "/api/employees", expectedKeys: ["success", "data", "pagination"] },
    { path: "/api/analytics/dashboard", expectedKeys: ["headcount", "attendance", "performance", "financial", "retention", "insights"] },
    { path: "/api/analytics/headcount", expectedKeys: ["headcount", "departmentDistribution", "locationDistribution", "employmentTypeDistribution", "joiningYearDistribution", "hiringTrend"] },
    { path: "/api/analytics/attendance", expectedKeys: ["attendance", "attendanceTrend", "leave"] },
    { path: "/api/analytics/performance", expectedKeys: ["performance", "performanceRatingDistribution", "performanceByDepartment"] },
    { path: "/api/analytics/financial", expectedKeys: ["financial", "payrollByDepartment", "payrollTrend"] },
    { path: "/api/analytics/retention", expectedKeys: ["retention", "turnoverByDepartment", "turnoverTrend", "recentEmploymentEvents"] }
  ];

  try {
    for (const ep of endpoints) {
      const res = await measureHttpRequest(port, ep.path);
      const is200 = res.status === 200;
      const isSuccess = res.body && res.body.success === true;
      const dataObj = ep.path === "/api/employees" ? res.body : res.body.data;
      
      const missingKeys = ep.expectedKeys.filter((k) => !(k in (dataObj || {})));
      const structureValid = missingKeys.length === 0;

      console.log(`\nEndpoint: ${ep.path}`);
      console.log(`  HTTP Status : ${res.status} (${is200 ? "OK" : "FAIL"})`);
      console.log(`  Success Prop: ${res.body?.success}`);
      console.log(`  Structure   : ${structureValid ? "VALID" : `MISSING (${missingKeys.join(", ")})`}`);
      console.log(`  HTTP RTT    : ${res.rttMs} ms`);
    }
    console.log("\n=================================================");
  } finally {
    server.close();
  }
}

verifyAllEndpoints().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
