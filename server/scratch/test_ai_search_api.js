const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const authRoutes = require("../src/routes/authRoutes");
const employeeRoutes = require("../src/routes/employeeRoutes");
const aiSearchRoutes = require("../src/routes/aiSearchRoutes");
const { validateAndSanitizeFilters } = require("../src/services/aiSearchService");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/ai", aiSearchRoutes);

let server;
const TEST_PORT = 5099;

function makeRequest(method, reqPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: TEST_PORT,
      path: reqPath,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log(" MILESTONE 21: AI SMART SEARCH TEST SUITE");
  console.log("=================================================");

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    } catch (err) {
      console.log("Mongo connection skipped/failed in test runner, running offline suite.");
    }
  }

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      resolve();
    });
  });

  let passed = 0;
  let total = 36;

  // Create a valid JWT token string for authenticated tests
  const jwtSecret = process.env.JWT_SECRET || "194857925348ecafa9e58b00e8294c582235363d475d9760450b25b78eaf74970906136ca34691fa76661016fbfc4ad48fd8e07884e3d83810c406f7f3a4ddff";
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const token = jwt.sign({ id: mockUserId, role: "ADMIN" }, jwtSecret, { expiresIn: "1h" });
  const authHeaders = { Authorization: `Bearer ${token}` };

  try {
    // [Test 1] Valid authenticated AI search
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Show active developers in Chennai"
      });
      if (res.status === 200 && res.body.success && res.body.data?.filters) {
        console.log("[Test 1] Valid authenticated AI search -> PASSED");
        passed++;
      } else {
        console.log(`[Test 1] FAILED: status ${res.status}, body: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 1] ERROR: ${e.message}`);
    }

    // [Test 2] Missing authentication -> 401
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", {}, {
        query: "Show active developers"
      });
      if (res.status === 401) {
        console.log("[Test 2] Missing authentication returns 401 -> PASSED");
        passed++;
      } else {
        console.log(`[Test 2] FAILED: status ${res.status}`);
      }
    } catch (e) {
      console.log(`[Test 2] ERROR: ${e.message}`);
    }

    // [Test 3] Invalid authentication -> 401
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", { Authorization: "Bearer invalidtoken123" }, {
        query: "Show active developers"
      });
      if (res.status === 401) {
        console.log("[Test 3] Invalid token returns 401 -> PASSED");
        passed++;
      } else {
        console.log(`[Test 3] FAILED: status ${res.status}`);
      }
    } catch (e) {
      console.log(`[Test 3] ERROR: ${e.message}`);
    }

    // [Test 4] Empty query -> 400
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: ""
      });
      if (res.status === 400) {
        console.log("[Test 4] Empty query returns 400 Bad Request -> PASSED");
        passed++;
      } else {
        console.log(`[Test 4] FAILED: status ${res.status}`);
      }
    } catch (e) {
      console.log(`[Test 4] ERROR: ${e.message}`);
    }

    // [Test 5] Active employee query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Show active employees"
      });
      if (res.status === 200 && res.body.data?.filters?.status === "Active") {
        console.log("[Test 5] Active status filter extracted -> PASSED");
        passed++;
      } else {
        console.log(`[Test 5] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 5] ERROR: ${e.message}`);
    }

    // [Test 6] Department query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Engineering team members"
      });
      if (res.status === 200 && res.body.data?.filters?.department === "Engineering") {
        console.log("[Test 6] Engineering department filter extracted -> PASSED");
        passed++;
      } else {
        console.log(`[Test 6] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 6] ERROR: ${e.message}`);
    }

    // [Test 7] Location query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Employees in Bangalore"
      });
      if (res.status === 200 && res.body.data?.filters?.location === "Bangalore") {
        console.log("[Test 7] Location filter extracted -> PASSED");
        passed++;
      } else {
        console.log(`[Test 7] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 7] ERROR: ${e.message}`);
    }

    // [Test 8] Employment type query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Contract employees in Mumbai"
      });
      if (res.status === 200 && res.body.data?.filters?.employmentType === "Contract") {
        console.log("[Test 8] EmploymentType filter extracted -> PASSED");
        passed++;
      } else {
        console.log(`[Test 8] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 8] ERROR: ${e.message}`);
    }

    // [Test 9] Joining year query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Who joined in 2025?"
      });
      if (res.status === 200 && res.body.data?.filters?.joiningYear === 2025) {
        console.log("[Test 9] Joining year 2025 filter extracted -> PASSED");
        passed++;
      } else {
        console.log(`[Test 9] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 9] ERROR: ${e.message}`);
    }

    // [Test 10] Combined query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Show active developers in Chennai who joined in 2024"
      });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.status === "Active" && f?.location === "Chennai" && f?.joiningYear === 2024) {
        console.log("[Test 10] Combined multi-criteria search extracted -> PASSED");
        passed++;
      } else {
        console.log(`[Test 10] FAILED: ${JSON.stringify(f)}`);
      }
    } catch (e) {
      console.log(`[Test 10] ERROR: ${e.message}`);
    }

    // [Test 11] Skill/designation query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Find React developers"
      });
      if (res.status === 200 && res.body.data?.filters?.search?.toLowerCase().includes("react")) {
        console.log("[Test 11] Skill/designation keyword extracted -> PASSED");
        passed++;
      } else {
        console.log(`[Test 11] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 11] ERROR: ${e.message}`);
    }

    // [Test 12] Case variations
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "shOW aCTive EngINeeRS iN chENNaI"
      });
      if (res.status === 200 && res.body.data?.filters?.status === "Active" && res.body.data?.filters?.location === "Chennai") {
        console.log("[Test 12] Case-insensitive extraction -> PASSED");
        passed++;
      } else {
        console.log(`[Test 12] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 12] ERROR: ${e.message}`);
    }

    // [Test 13] "this year" handling
    try {
      const currentYear = new Date().getFullYear();
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Employees who joined this year"
      });
      if (res.status === 200 && res.body.data?.filters?.joiningYear === currentYear) {
        console.log(`[Test 13] 'this year' dynamically resolved to ${currentYear} -> PASSED`);
        passed++;
      } else {
        console.log(`[Test 13] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 13] ERROR: ${e.message}`);
    }

    // [Test 14] Invalid Gemini output validation
    try {
      const sanitized = validateAndSanitizeFilters(null);
      if (sanitized.filters.status === "" && sanitized.filters.sortBy === "createdAt") {
        console.log("[Test 14] Null/invalid raw AI object handled safely -> PASSED");
        passed++;
      } else {
        console.log("[Test 14] FAILED");
      }
    } catch (e) {
      console.log(`[Test 14] ERROR: ${e.message}`);
    }

    // [Test 15] Unexpected filter fields stripping
    try {
      const sanitized = validateAndSanitizeFilters({
        status: "Active",
        unexpectedField: "secret",
        adminRights: true
      });
      if (sanitized.filters.status === "Active" && !("unexpectedField" in sanitized.filters)) {
        console.log("[Test 15] Unexpected fields stripped from filters -> PASSED");
        passed++;
      } else {
        console.log("[Test 15] FAILED");
      }
    } catch (e) {
      console.log(`[Test 15] ERROR: ${e.message}`);
    }

    // [Test 16] Invalid department filtering
    try {
      const sanitized = validateAndSanitizeFilters({ department: "HackingDepartment" });
      if (sanitized.filters.department === "") {
        console.log("[Test 16] Invalid department stripped -> PASSED");
        passed++;
      } else {
        console.log("[Test 16] FAILED");
      }
    } catch (e) {
      console.log(`[Test 16] ERROR: ${e.message}`);
    }

    // [Test 17] Invalid location filtering
    try {
      const sanitized = validateAndSanitizeFilters({ location: "Atlantis" });
      if (sanitized.filters.location === "") {
        console.log("[Test 17] Invalid location stripped -> PASSED");
        passed++;
      } else {
        console.log("[Test 17] FAILED");
      }
    } catch (e) {
      console.log(`[Test 17] ERROR: ${e.message}`);
    }

    // [Test 18] Invalid status filtering
    try {
      const sanitized = validateAndSanitizeFilters({ status: "Fired" });
      if (sanitized.filters.status === "") {
        console.log("[Test 18] Invalid status stripped -> PASSED");
        passed++;
      } else {
        console.log("[Test 18] FAILED");
      }
    } catch (e) {
      console.log(`[Test 18] ERROR: ${e.message}`);
    }

    // [Test 19] Invalid employment type filtering
    try {
      const sanitized = validateAndSanitizeFilters({ employmentType: "Freelance" });
      if (sanitized.filters.employmentType === "") {
        console.log("[Test 19] Invalid employmentType stripped -> PASSED");
        passed++;
      } else {
        console.log("[Test 19] FAILED");
      }
    } catch (e) {
      console.log(`[Test 19] ERROR: ${e.message}`);
    }

    // [Test 20] Invalid sort field validation
    try {
      const sanitized = validateAndSanitizeFilters({ sortBy: "password" });
      if (sanitized.filters.sortBy === "createdAt") {
        console.log("[Test 20] Invalid sortBy defaulted to createdAt -> PASSED");
        passed++;
      } else {
        console.log("[Test 20] FAILED");
      }
    } catch (e) {
      console.log(`[Test 20] ERROR: ${e.message}`);
    }

    // [Test 21] Invalid sort order validation
    try {
      const sanitized = validateAndSanitizeFilters({ sortOrder: "random" });
      if (sanitized.filters.sortOrder === "desc") {
        console.log("[Test 21] Invalid sortOrder defaulted to desc -> PASSED");
        passed++;
      } else {
        console.log("[Test 21] FAILED");
      }
    } catch (e) {
      console.log(`[Test 21] ERROR: ${e.message}`);
    }

    // [Test 22] MongoDB operator injection attempt
    try {
      const sanitized = validateAndSanitizeFilters({ search: "$where: 'this.salary > 0'" });
      if (!sanitized.filters.search.startsWith("$") && !sanitized.filters.search.includes("$where")) {
        console.log("[Test 22] MongoDB operator injection sanitized -> PASSED");
        passed++;
      } else {
        console.log("[Test 22] FAILED");
      }
    } catch (e) {
      console.log(`[Test 22] ERROR: ${e.message}`);
    }

    // [Test 23] Non-employee question rejection
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "What is the weather today?"
      });
      if (res.status === 400 && res.body.message?.includes("designed for employee")) {
        console.log("[Test 23] Non-employee question rejected with helpful message -> PASSED");
        passed++;
      } else {
        console.log(`[Test 23] FAILED: status ${res.status}, msg: ${res.body.message}`);
      }
    } catch (e) {
      console.log(`[Test 23] ERROR: ${e.message}`);
    }

    // [Test 24] Gemini failure handling
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Find engineers in Remote"
      });
      if (res.status === 200 && res.body.data?.filters) {
        console.log("[Test 24] AI search endpoint returns structured response -> PASSED");
        passed++;
      } else {
        console.log(`[Test 24] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 24] ERROR: ${e.message}`);
    }

    // [Test 25] No-results query execution against employee API
    try {
      const aiRes = await makeRequest("POST", "/api/ai/employee-search", authHeaders, {
        query: "Show contract employees in Remote who joined in 1980"
      });
      if (aiRes.status === 200 && aiRes.body.data?.filters) {
        const filters = aiRes.body.data.filters;
        const empRes = await makeRequest("GET", `/api/employees?location=${filters.location}&joiningYear=${filters.joiningYear}`, authHeaders);
        if (empRes.status === 200 && Array.isArray(empRes.body.data)) {
          console.log("[Test 25] Extracted filters safely executed against employee API -> PASSED");
          passed++;
        } else {
          console.log("[Test 25] FAILED employee API execution");
        }
      } else {
        console.log("[Test 25] FAILED AI extraction");
      }
    } catch (e) {
      console.log(`[Test 25] ERROR: ${e.message}`);
    }

    // [Test 26] Query: "react" -> search: "react"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "react" });
      if (res.status === 200 && res.body.data?.filters?.search?.toLowerCase() === "react") {
        console.log("[Test 26] Query 'react' extracted search='react' -> PASSED");
        passed++;
      } else {
        console.log(`[Test 26] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 26] ERROR: ${e.message}`);
    }

    // [Test 27] Query: "react developers" -> search: "react", designation: "Developer"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "react developers" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.search?.toLowerCase() === "react" && f?.designation === "Developer") {
        console.log("[Test 27] Query 'react developers' extracted search='react', designation='Developer' -> PASSED");
        passed++;
      } else {
        console.log(`[Test 27] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 27] ERROR: ${e.message}`);
    }

    // [Test 28] Query: "python developers" -> search: "python", designation: "Developer"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "python developers" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.search?.toLowerCase() === "python" && f?.designation === "Developer") {
        console.log("[Test 28] Query 'python developers' extracted search='python', designation='Developer' -> PASSED");
        passed++;
      } else {
        console.log(`[Test 28] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 28] ERROR: ${e.message}`);
    }

    // [Test 29] Query: "javascript developers" -> search: "javascript", designation: "Developer"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "javascript developers" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.search?.toLowerCase() === "javascript" && f?.designation === "Developer") {
        console.log("[Test 29] Query 'javascript developers' extracted search='javascript', designation='Developer' -> PASSED");
        passed++;
      } else {
        console.log(`[Test 29] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 29] ERROR: ${e.message}`);
    }

    // [Test 30] Query: "developers" -> designation: "Developer"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "developers" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.designation === "Developer") {
        console.log("[Test 30] Query 'developers' extracted designation='Developer' -> PASSED");
        passed++;
      } else {
        console.log(`[Test 30] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 30] ERROR: ${e.message}`);
    }

    // [Test 31] Query: "react developers in Chennai" -> search: "react", designation: "Developer", location: "Chennai"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "react developers in Chennai" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.search?.toLowerCase() === "react" && f?.designation === "Developer" && f?.location === "Chennai") {
        console.log("[Test 31] Query 'react developers in Chennai' extracted all 3 filters -> PASSED");
        passed++;
      } else {
        console.log(`[Test 31] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 31] ERROR: ${e.message}`);
    }

    // [Test 32] Query: "active react developers in Chennai" -> status: "Active", search: "react", designation: "Developer", location: "Chennai"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "active react developers in Chennai" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.status === "Active" && f?.search?.toLowerCase() === "react" && f?.designation === "Developer" && f?.location === "Chennai") {
        console.log("[Test 32] Query 'active react developers in Chennai' extracted all 4 filters -> PASSED");
        passed++;
      } else {
        console.log(`[Test 32] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 32] ERROR: ${e.message}`);
    }

    // [Test 33] Query: "python developers in Bangalore" -> search: "python", designation: "Developer", location: "Bangalore"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "python developers in Bangalore" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.search?.toLowerCase() === "python" && f?.designation === "Developer" && f?.location === "Bangalore") {
        console.log("[Test 33] Query 'python developers in Bangalore' extracted filters -> PASSED");
        passed++;
      } else {
        console.log(`[Test 33] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 33] ERROR: ${e.message}`);
    }

    // [Test 34] Query: "contract developers in Mumbai" -> employmentType: "Contract", designation: "Developer", location: "Mumbai"
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "contract developers in Mumbai" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.employmentType === "Contract" && f?.designation === "Developer" && f?.location === "Mumbai") {
        console.log("[Test 34] Query 'contract developers in Mumbai' extracted filters -> PASSED");
        passed++;
      } else {
        console.log(`[Test 34] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 34] ERROR: ${e.message}`);
    }

    // [Test 35] Query: "react developers who joined in 2025" -> search: "react", designation: "Developer", joiningYear: 2025
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "react developers who joined in 2025" });
      const f = res.body.data?.filters;
      if (res.status === 200 && f?.search?.toLowerCase() === "react" && f?.designation === "Developer" && f?.joiningYear === 2025) {
        console.log("[Test 35] Query 'react developers who joined in 2025' extracted filters -> PASSED");
        passed++;
      } else {
        console.log(`[Test 35] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 35] ERROR: ${e.message}`);
    }

    // [Test 36] Query: "how to make pasta" -> rejected non-employee query
    try {
      const res = await makeRequest("POST", "/api/ai/employee-search", authHeaders, { query: "how to make pasta" });
      if (res.status === 400 && res.body.message?.includes("designed for employee")) {
        console.log("[Test 36] Query 'how to make pasta' correctly rejected -> PASSED");
        passed++;
      } else {
        console.log(`[Test 36] FAILED: ${JSON.stringify(res.body)}`);
      }
    } catch (e) {
      console.log(`[Test 36] ERROR: ${e.message}`);
    }
  } finally {
    if (server) {
      server.close();
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  console.log("\n=================================================");
  console.log(` AI SMART SEARCH TEST RESULT: ${passed} / ${total} PASSED`);
  console.log("=================================================\n");

  if (passed !== total) {
    process.exitCode = 1;
  }
}

runTests();
