const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");
const Employee = require("../src/models/Employee");
const Attendance = require("../src/models/Attendance");
const LeaveRequest = require("../src/models/LeaveRequest");
const PerformanceReview = require("../src/models/PerformanceReview");
const Payroll = require("../src/models/Payroll");
const EmploymentHistory = require("../src/models/EmploymentHistory");

const authRoutes = require("../src/routes/authRoutes");
const employeeRoutes = require("../src/routes/employeeRoutes");
const analyticsRoutes = require("../src/routes/analyticsRoutes");

const { protect } = require("../src/middleware/authMiddleware");
const { requireRole } = require("../src/middleware/roleMiddleware");

// In-memory mock user database for test environment execution
let mockUsers = [];

User.findOne = function (filter = {}) {
  let user = null;
  if (filter.email) {
    user = mockUsers.find((u) => u.email === filter.email.toLowerCase()) || null;
  } else if (filter._id) {
    user = mockUsers.find((u) => u._id.toString() === filter._id.toString()) || null;
  }

  const chain = {
    select: (sel) => {
      chain._select = sel;
      return chain;
    },
    lean: () => {
      return Promise.resolve(user ? { ...user } : null);
    },
    then: (resolve) => {
      resolve(user ? { ...user } : null);
    }
  };
  return chain;
};

User.findById = function (id) {
  const user = mockUsers.find((u) => u._id.toString() === id.toString()) || null;
  const chain = {
    select: (sel) => {
      chain._select = sel;
      return chain;
    },
    lean: () => {
      return Promise.resolve(user ? { ...user } : null);
    },
    then: (resolve) => {
      resolve(user ? { ...user } : null);
    }
  };
  return chain;
};

User.create = async function (userData) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const newUser = {
    _id: "user_" + Math.random().toString(36).substr(2, 9),
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    role: userData.role || "HR",
    createdAt: new Date(),
    updatedAt: new Date(),
    matchPassword: async function (entered) {
      return await bcrypt.compare(entered, this.password);
    }
  };

  mockUsers.push(newUser);
  return newUser;
};

// Mock Employee & Analytics for regression verification
const sampleEmp = [
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
    createdAt: new Date()
  }
];

Employee.countDocuments = async function () { return sampleEmp.length; };
Employee.find = function () {
  return { sort: () => ({ skip: () => ({ limit: () => Promise.resolve(sampleEmp) }) }) };
};
Employee.aggregate = async function () { return [{ department: "HR", count: 1 }]; };
Attendance.aggregate = async function () { return [{ totalRecords: 10, presentCount: 9, lateCount: 1, absentCount: 0, totalWorkingHours: 80, workingHoursCount: 10 }]; };
LeaveRequest.countDocuments = async function () { return 0; };
LeaveRequest.distinct = async function () { return []; };
PerformanceReview.aggregate = async function () { return [{ averageOverallScore: 4.1, averageProductivityScore: 4.0, averageTeamworkScore: 4.2, averageCommunicationScore: 4.1, averageGoalsCompleted: 85 }]; };
Payroll.findOne = function () { return { sort: () => ({ select: () => ({ lean: () => Promise.resolve({ month: "2026-02" }) }) }) }; };
Payroll.aggregate = async function () { return [{ monthlyPayroll: 100000, benefitsCost: 10000, bonusCost: 5000, averageBaseSalary: 85000 }]; };
EmploymentHistory.countDocuments = async function () { return 1; };
EmploymentHistory.aggregate = async function () { return [{ _id: "2026-02", count: 1 }]; };

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/analytics", analyticsRoutes);

// Test endpoint for role middleware verification
app.get("/api/test-admin-only", protect, requireRole("ADMIN"), (req, res) => {
  res.json({ success: true, message: "Welcome Admin" });
});

function makeRequest(port, method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers
    };

    const options = {
      hostname: "127.0.0.1",
      port: port,
      path: path,
      method: method,
      headers: reqHeaders
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runAuthTests() {
  console.log("=================================================");
  console.log(" MILESTONE 9: JWT AUTHENTICATION TEST SUITE");
  console.log("=================================================");

  const server = app.listen(5009);
  const port = 5009;

  const testResults = [];
  function recordTest(id, name, passed, detail = "") {
    console.log(`[Test ${id}] ${name} -> ${passed ? "PASSED" : "FAILED"} ${detail ? `(${detail})` : ""}`);
    testResults.push({ id, name, passed, detail });
  }

  try {
    let hrToken = "";
    let adminToken = "";
    let registeredEmail = "hr.test@peoplepulse.demo";

    // 1. Register valid user -> 201
    const regRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "HR User",
      email: registeredEmail,
      password: "StrongPassword123",
      role: "HR"
    });
    recordTest(1, "Register valid user returns HTTP 201 Created", regRes.status === 201 && regRes.body.success === true);
    hrToken = regRes.body.data?.token;

    // 2. Register duplicate email -> 409
    const dupRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "Duplicate User",
      email: registeredEmail,
      password: "StrongPassword123"
    });
    recordTest(2, "Register duplicate email returns HTTP 409 Conflict", dupRes.status === 409 && dupRes.body.message === "Email is already registered");

    // 3. Register invalid email -> 400
    const invEmailRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "Invalid Email",
      email: "invalid-email-format",
      password: "StrongPassword123"
    });
    recordTest(3, "Register invalid email format returns HTTP 400 Bad Request", invEmailRes.status === 400);

    // 4. Register short password -> 400
    const shortPassRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "Short Pass",
      email: "short@peoplepulse.demo",
      password: "123"
    });
    recordTest(4, "Register short password (< 8 chars) returns HTTP 400 Bad Request", shortPassRes.status === 400);

    // 5. Password stored hashed, not plaintext
    const storedUser = mockUsers.find((u) => u.email === registeredEmail);
    const isHashed = storedUser && storedUser.password !== "StrongPassword123" && storedUser.password.startsWith("$2");
    recordTest(5, "Password stored hashed with bcrypt in database", Boolean(isHashed));

    // 6. Login valid credentials -> 200
    const loginRes = await makeRequest(port, "POST", "/api/auth/login", {
      email: registeredEmail,
      password: "StrongPassword123"
    });
    recordTest(6, "Login valid credentials returns HTTP 200 OK", loginRes.status === 200 && loginRes.body.success === true);

    // 7. Login wrong password -> 401
    const wrongPassRes = await makeRequest(port, "POST", "/api/auth/login", {
      email: registeredEmail,
      password: "WrongPassword999"
    });
    recordTest(7, "Login wrong password returns HTTP 401 Unauthorized", wrongPassRes.status === 401 && wrongPassRes.body.message === "Invalid email or password");

    // 8. Login unknown email -> 401
    const unknownEmailRes = await makeRequest(port, "POST", "/api/auth/login", {
      email: "unknown.user@peoplepulse.demo",
      password: "StrongPassword123"
    });
    recordTest(8, "Login unknown email returns generic HTTP 401 Unauthorized", unknownEmailRes.status === 401 && unknownEmailRes.body.message === "Invalid email or password");

    // 9. Login response does not contain password
    const loginDataStr = JSON.stringify(loginRes.body);
    recordTest(9, "Login response payload excludes password field", loginDataStr.includes("password") === false);

    // 10. Login response contains JWT
    recordTest(10, "Login response contains valid JWT token string", typeof loginRes.body.data?.token === "string" && loginRes.body.data?.token.length > 20);

    // 11. GET /auth/me with valid token -> 200
    const meRes = await makeRequest(port, "GET", "/api/auth/me", null, {
      Authorization: `Bearer ${hrToken}`
    });
    recordTest(11, "GET /api/auth/me with valid token returns HTTP 200 OK", meRes.status === 200 && meRes.body.data?.user?.email === registeredEmail);

    // 12. GET /auth/me without token -> 401
    const noTokenRes = await makeRequest(port, "GET", "/api/auth/me");
    recordTest(12, "GET /api/auth/me without Authorization header returns HTTP 401", noTokenRes.status === 401 && noTokenRes.body.message === "Authentication required");

    // 13. GET /auth/me with invalid token -> 401
    const badTokenRes = await makeRequest(port, "GET", "/api/auth/me", null, {
      Authorization: "Bearer invalid.jwt.token"
    });
    recordTest(13, "GET /api/auth/me with malformed token returns HTTP 401", badTokenRes.status === 401 && badTokenRes.body.message === "Invalid or expired token");

    // 14. GET /auth/me with expired/invalid JWT -> 401
    const fakeSecretToken = jwt.sign({ userId: "123", role: "HR" }, "WRONG_SECRET_KEY");
    const wrongSecretRes = await makeRequest(port, "GET", "/api/auth/me", null, {
      Authorization: `Bearer ${fakeSecretToken}`
    });
    recordTest(14, "GET /api/auth/me with invalid secret signature returns HTTP 401", wrongSecretRes.status === 401 && wrongSecretRes.body.message === "Invalid or expired token");

    // 15. User role included in JWT payload
    const decodedPayload = jwt.decode(hrToken);
    recordTest(15, "User role is included in JWT token payload", decodedPayload && decodedPayload.role === "HR");

    // 16. Register Admin user & verify role middleware accepts ADMIN
    const adminRegRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "Admin User",
      email: "admin.test@peoplepulse.demo",
      password: "StrongPassword123",
      role: "ADMIN"
    });
    adminToken = adminRegRes.body.data?.token;

    const adminAccessRes = await makeRequest(port, "GET", "/api/test-admin-only", null, {
      Authorization: `Bearer ${adminToken}`
    });
    recordTest(16, "Role middleware allows access for user with required role (ADMIN)", adminAccessRes.status === 200 && adminAccessRes.body.message === "Welcome Admin");

    // 17. Role middleware rejects HR user on ADMIN endpoint -> 403
    const hrAccessAdminRes = await makeRequest(port, "GET", "/api/test-admin-only", null, {
      Authorization: `Bearer ${hrToken}`
    });
    recordTest(17, "Role middleware rejects unauthorized role with HTTP 403 Forbidden", hrAccessAdminRes.status === 403 && hrAccessAdminRes.body.message === "Insufficient permissions");

    // 18. Existing Employee CRUD regression test
    const crudRes = await makeRequest(port, "GET", "/api/employees?page=1&limit=2");
    recordTest(18, "Existing Employee CRUD API regression test", crudRes.status === 200 && crudRes.body.success === true);

    // 19. Existing Advanced Search regression test
    const searchRes = await makeRequest(port, "GET", "/api/employees?department=Engineering&status=Active");
    recordTest(19, "Existing Advanced Search API regression test", searchRes.status === 200 && searchRes.body.success === true);

    // 20. Analytics endpoint regression test
    const analyticsRes = await makeRequest(port, "GET", "/api/analytics/dashboard");
    recordTest(20, "Existing Analytics Dashboard API regression test", analyticsRes.status === 200 && analyticsRes.body.success === true);

    // Clean up test users after test completion
    mockUsers = [];
    console.log("\nCleaned up all test user accounts from memory.");

    console.log("\n=================================================");
    const passedCount = testResults.filter((t) => t.passed).length;
    console.log(`MILESTONE 9 TEST RESULT: ${passedCount} / ${testResults.length} PASSED`);
    console.log("=================================================");
  } finally {
    server.close();
  }
}

runAuthTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
