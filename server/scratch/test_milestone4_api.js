const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const Employee = require("../src/models/Employee");
const employeeRoutes = require("../src/routes/employeeRoutes");

// Synthetic mock DB dataset for fast and reliable milestone 4 test suite
const mockDb = [
  {
    _id: "6aa3f7264eeeb531a35ecf00",
    employeeId: "EMP-1001",
    firstName: "Nikhil",
    lastName: "Das",
    email: "nikhil.das.1001@peoplepulse.demo",
    phone: "+91 6273829517",
    avatar: "https://ui-avatars.com/api/?name=Nikhil%2BDas",
    department: "HR",
    designation: "HR Manager",
    location: "Pune",
    joiningDate: new Date("2022-06-06T00:00:00.000Z"),
    employmentType: "Full-time",
    status: "Active",
    skills: ["Recruitment", "HRIS"],
    createdAt: new Date("2026-01-01T00:00:00.000Z")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf01",
    employeeId: "EMP-1002",
    firstName: "Anjali",
    lastName: "Das",
    email: "anjali.das.1002@peoplepulse.demo",
    phone: "+91 7272505644",
    avatar: "https://ui-avatars.com/api/?name=Anjali%2BDas",
    department: "Marketing",
    designation: "Content Strategist",
    location: "Chennai",
    joiningDate: new Date("2022-12-17T00:00:00.000Z"),
    employmentType: "Full-time",
    status: "Active",
    skills: ["SEO", "Content Marketing"],
    createdAt: new Date("2026-01-02T00:00:00.000Z")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf02",
    employeeId: "EMP-1003",
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.sharma.1003@peoplepulse.demo",
    phone: "+91 9876543210",
    avatar: "https://ui-avatars.com/api/?name=Aarav%2BSharma",
    department: "Engineering",
    designation: "Frontend Developer",
    location: "Bangalore",
    joiningDate: new Date("2024-03-15T00:00:00.000Z"),
    employmentType: "Full-time",
    status: "Active",
    skills: ["React", "TypeScript", "JavaScript"],
    createdAt: new Date("2026-01-03T00:00:00.000Z")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf03",
    employeeId: "EMP-1004",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel.1004@peoplepulse.demo",
    phone: "+91 9123456789",
    avatar: "https://ui-avatars.com/api/?name=Priya%2BPatel",
    department: "Engineering",
    designation: "Backend Developer",
    location: "Chennai",
    joiningDate: new Date("2026-02-10T00:00:00.000Z"),
    employmentType: "Contract",
    status: "Active",
    skills: ["Node.js", "MongoDB", "Python"],
    createdAt: new Date("2026-01-04T00:00:00.000Z")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf04",
    employeeId: "EMP-1005",
    firstName: "Rohan",
    lastName: "Verma",
    email: "rohan.verma.1005@peoplepulse.demo",
    phone: "+91 9988776655",
    avatar: "https://ui-avatars.com/api/?name=Rohan%2BVerma",
    department: "Design",
    designation: "UI Designer",
    location: "Mumbai",
    joiningDate: new Date("2025-08-20T00:00:00.000Z"),
    employmentType: "Part-time",
    status: "On Leave",
    skills: ["Figma", "UI Design"],
    createdAt: new Date("2026-01-05T00:00:00.000Z")
  },
  {
    _id: "6aa3f7264eeeb531a35ecf05",
    employeeId: "EMP-1006",
    firstName: "Vikram",
    lastName: "Reddy",
    email: "vikram.reddy.1006@peoplepulse.demo",
    phone: "+91 9765432109",
    avatar: "https://ui-avatars.com/api/?name=Vikram%2BReddy",
    department: "Engineering",
    designation: "DevOps Engineer",
    location: "Chennai",
    joiningDate: new Date("2026-05-01T00:00:00.000Z"),
    employmentType: "Full-time",
    status: "Active",
    skills: ["Docker", "AWS", "Git"],
    createdAt: new Date("2026-01-06T00:00:00.000Z")
  }
];

// Helper to filter items in-memory matching Mongoose query structure
function matchesMongoQuery(item, query) {
  for (let key in query) {
    if (key === "$or") {
      const orClauses = query.$or;
      const anyMatch = orClauses.some((clause) => {
        const field = Object.keys(clause)[0];
        const regex = clause[field];
        const val = item[field];
        if (Array.isArray(val)) {
          return val.some((v) => regex.test(v));
        }
        return val ? regex.test(String(val)) : false;
      });
      if (!anyMatch) return false;
    } else if (key === "joiningDate") {
      const { $gte, $lte } = query.joiningDate;
      const itemDate = new Date(item.joiningDate);
      if (itemDate < $gte || itemDate > $lte) return false;
    } else {
      if (item[key] !== query[key]) return false;
    }
  }
  return true;
}

// Override Mongoose methods for unit testing
Employee.find = function (query = {}) {
  const filtered = mockDb.filter((item) => matchesMongoQuery(item, query));
  let sortField = "createdAt";
  let sortDir = -1;
  let skipVal = 0;
  let limitVal = filtered.length;

  const chain = {
    sort: (sortObj) => {
      sortField = Object.keys(sortObj)[0];
      sortDir = sortObj[sortField];
      return chain;
    },
    skip: (s) => {
      skipVal = s;
      return chain;
    },
    limit: (l) => {
      limitVal = l;
      return chain;
    },
    then: (resolve) => {
      const sorted = [...filtered].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();
        if (valA < valB) return -1 * sortDir;
        if (valA > valB) return 1 * sortDir;
        return 0;
      });
      resolve(sorted.slice(skipVal, skipVal + limitVal));
    }
  };
  return chain;
};

Employee.countDocuments = async function (query = {}) {
  return mockDb.filter((item) => matchesMongoQuery(item, query)).length;
};

Employee.findById = async function (id) {
  return mockDb.find((e) => e._id.toString() === id.toString()) || null;
};

const app = express();
app.use(express.json());
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

async function runAllTests() {
  console.log("=================================================");
  console.log(" MILESTONE 4: SEARCH, FILTER & SORT TEST SUITE");
  console.log("=================================================");

  const server = app.listen(5004);
  const port = 5004;

  const results = [];

  const testCases = [
    { id: 1, name: "Get all employees (default)", path: "/api/employees" },
    { id: 2, name: "Search by first name", path: "/api/employees?search=Aarav" },
    { id: 3, name: "Search by last name", path: "/api/employees?search=Sharma" },
    { id: 4, name: "Search by email", path: "/api/employees?search=priya.patel" },
    { id: 5, name: "Search by employee ID", path: "/api/employees?search=EMP-1001" },
    { id: 6, name: "Search by designation", path: "/api/employees?search=Developer" },
    { id: 7, name: "Search by skill", path: "/api/employees?search=React" },
    { id: 8, name: "Department filter", path: "/api/employees?department=Engineering" },
    { id: 9, name: "Status filter", path: "/api/employees?status=Active" },
    { id: 10, name: "Location filter", path: "/api/employees?location=Chennai" },
    { id: 11, name: "Employment type filter", path: "/api/employees?employmentType=Full-time" },
    { id: 12, name: "Joining year filter", path: "/api/employees?joiningYear=2026" },
    { id: 13, name: "Multiple filters", path: "/api/employees?department=Engineering&status=Active&location=Chennai" },
    { id: 14, name: "Ascending sort", path: "/api/employees?sortBy=firstName&sortOrder=asc" },
    { id: 15, name: "Descending sort", path: "/api/employees?sortBy=joiningDate&sortOrder=desc" },
    { id: 16, name: "Pagination", path: "/api/employees?page=2&limit=2" },
    { id: 17, name: "Page boundary", path: "/api/employees?page=1&limit=2" },
    { id: 18, name: "Invalid department", path: "/api/employees?department=Unknown", expectedStatus: 400 },
    { id: 19, name: "Invalid status", path: "/api/employees?status=Something", expectedStatus: 400 },
    { id: 20, name: "Invalid location", path: "/api/employees?location=Atlantis", expectedStatus: 400 },
    { id: 21, name: "Invalid employment type", path: "/api/employees?employmentType=Freelance", expectedStatus: 400 },
    { id: 22, name: "Invalid joining year", path: "/api/employees?joiningYear=hello", expectedStatus: 400 },
    { id: 23, name: "Invalid sortBy", path: "/api/employees?sortBy=password", expectedStatus: 400 },
    { id: 24, name: "Invalid sortOrder", path: "/api/employees?sortOrder=random", expectedStatus: 400 },
    { id: 25, name: "Invalid page", path: "/api/employees?page=abc", expectedStatus: 400 },
    { id: 26, name: "Invalid limit", path: "/api/employees?limit=-10", expectedStatus: 400 },
    { id: 27, name: "Maximum limit enforcement", path: "/api/employees?limit=1000", expectedStatus: 400 },
    { id: 28, name: "Search with zero results", path: "/api/employees?search=nonexistentxyz123" },
    // Specific requested combination tests
    { id: 29, name: "Combination 1: dept + status", path: "/api/employees?department=Engineering&status=Active" },
    { id: 30, name: "Combination 2: search + dept", path: "/api/employees?search=developer&department=Engineering" },
    { id: 31, name: "Combination 3: location + status + joiningYear", path: "/api/employees?location=Chennai&status=Active&joiningYear=2026" },
    { id: 32, name: "Combination 4: search + sortBy + sortOrder + pagination", path: "/api/employees?search=react&sortBy=joiningDate&sortOrder=desc&page=1&limit=10" }
  ];

  try {
    for (const tc of testCases) {
      const res = await makeRequest(port, "GET", tc.path);
      const expectedStatus = tc.expectedStatus || 200;
      const passed = res.status === expectedStatus;
      console.log(`[Test ${tc.id}] ${tc.name}`);
      console.log(`  Path: ${tc.path}`);
      console.log(`  Status: ${res.status} (Expected: ${expectedStatus}) -> ${passed ? "PASSED" : "FAILED"}`);
      if (passed && res.body.pagination) {
        console.log(`  Results Count: ${res.body.data.length}, Total: ${res.body.pagination.total}`);
      } else if (!passed || expectedStatus >= 400) {
        console.log(`  Message: ${res.body.message}`);
      }
      console.log("-------------------------------------------------");
      results.push({ id: tc.id, name: tc.name, passed });
    }

    const totalPassed = results.filter((r) => r.passed).length;
    console.log(`\nTEST SUMMARY: ${totalPassed} / ${results.length} PASSED`);
  } finally {
    server.close();
  }
}

runAllTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
