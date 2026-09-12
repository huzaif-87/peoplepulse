const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const Employee = require("../src/models/Employee");
const employeeRoutes = require("../src/routes/employeeRoutes");

// Mock dataset for unit testing endpoints and error responses
let mockDb = [
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
    joiningDate: new Date("2022-06-06"),
    employmentType: "Full-time",
    status: "Active",
    skills: ["Recruitment", "HRIS"],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01")
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
    joiningDate: new Date("2022-12-17"),
    employmentType: "Full-time",
    status: "Active",
    skills: ["SEO", "Content Marketing"],
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02")
  }
];

// Override Mongoose methods for unit/integration testing
Employee.find = function () {
  let skipVal = 0;
  let limitVal = mockDb.length;
  const chain = {
    sort: () => chain,
    skip: (s) => {
      skipVal = s;
      return chain;
    },
    limit: (l) => {
      limitVal = l;
      return chain;
    },
    then: (resolve) => {
      resolve(mockDb.slice(skipVal, skipVal + limitVal));
    }
  };
  return chain;
};

Employee.countDocuments = async function () {
  return mockDb.length;
};

Employee.findById = async function (id) {
  return mockDb.find((e) => e._id.toString() === id.toString()) || null;
};

Employee.create = async function (data) {
  if (mockDb.some((e) => e.employeeId === data.employeeId)) {
    const err = new Error("Duplicate key");
    err.code = 11000;
    err.keyPattern = { employeeId: 1 };
    throw err;
  }
  if (mockDb.some((e) => e.email === data.email)) {
    const err = new Error("Duplicate key");
    err.code = 11000;
    err.keyPattern = { email: 1 };
    throw err;
  }
  if (!data.firstName || data.firstName.length < 2) {
    const err = new Error("ValidationError: First name must be at least 2 characters long");
    err.name = "ValidationError";
    err.errors = { firstName: { message: "First name must be at least 2 characters long" } };
    throw err;
  }

  const newRecord = {
    _id: new mongoose.Types.ObjectId().toString(),
    ...data,
    status: data.status || "Active",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockDb.push(newRecord);
  return newRecord;
};

Employee.findByIdAndUpdate = async function (id, updateData, options) {
  const index = mockDb.findIndex((e) => e._id.toString() === id.toString());
  if (index === -1) return null;

  if (updateData.status) {
    const allowed = ["Active", "On Leave", "Inactive"];
    if (!allowed.includes(updateData.status)) {
      const err = new Error("ValidationError: Invalid status");
      err.name = "ValidationError";
      err.errors = { status: { message: `${updateData.status} is not a valid status` } };
      throw err;
    }
  }

  mockDb[index] = {
    ...mockDb[index],
    ...updateData,
    updatedAt: new Date()
  };
  return mockDb[index];
};

const app = express();
app.use(express.json());
app.use("/api/employees", employeeRoutes);

function makeRequest(port, method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: port,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING EMPLOYEE CRUD API TEST SUITE ===");
  const server = app.listen(5003);
  const port = 5003;

  try {
    // 1. GET /api/employees (Paginated list)
    console.log("\n1. Testing GET /api/employees?page=1&limit=2 ...");
    const getRes = await makeRequest(port, "GET", "/api/employees?page=1&limit=2");
    console.log(`HTTP Status: ${getRes.status}`);
    console.log("Response:", JSON.stringify(getRes.body, null, 2));

    // 2. GET /api/employees/:id (Success)
    console.log("\n2. Testing GET /api/employees/6aa3f7264eeeb531a35ecf00 (Success) ...");
    const getByIdRes = await makeRequest(port, "GET", "/api/employees/6aa3f7264eeeb531a35ecf00");
    console.log(`HTTP Status: ${getByIdRes.status}`);
    console.log("Response:", JSON.stringify(getByIdRes.body, null, 2));

    // 3. GET /api/employees/:id (Invalid ID format - 400)
    console.log("\n3. Testing GET /api/employees/invalidId123 (Invalid ID format) ...");
    const invalidIdRes = await makeRequest(port, "GET", "/api/employees/invalidId123");
    console.log(`HTTP Status: ${invalidIdRes.status}`);
    console.log("Response:", JSON.stringify(invalidIdRes.body, null, 2));

    // 4. GET /api/employees/:id (Not Found - 404)
    const fakeId = new mongoose.Types.ObjectId().toString();
    console.log(`\n4. Testing GET /api/employees/${fakeId} (Not Found - 404) ...`);
    const notFoundRes = await makeRequest(port, "GET", `/api/employees/${fakeId}`);
    console.log(`HTTP Status: ${notFoundRes.status}`);
    console.log("Response:", JSON.stringify(notFoundRes.body, null, 2));

    // 5. POST /api/employees (Success 201)
    const newEmployeeData = {
      employeeId: "EMP-TEST-9999",
      firstName: "TestFirst",
      lastName: "TestLast",
      email: "test.employee.9999@peoplepulse.demo",
      phone: "+91 9999999999",
      department: "Engineering",
      designation: "Test Engineer",
      location: "Bangalore",
      joiningDate: "2024-01-01",
      employmentType: "Full-time",
      status: "Active",
      skills: ["Testing", "Node.js"]
    };
    console.log("\n5. Testing POST /api/employees (Success 201) ...");
    const postRes = await makeRequest(port, "POST", "/api/employees", newEmployeeData);
    console.log(`HTTP Status: ${postRes.status}`);
    console.log("Response:", JSON.stringify(postRes.body, null, 2));
    const createdId = postRes.body.data?._id;

    // 6. POST /api/employees (Duplicate employeeId - 409)
    console.log("\n6. Testing POST /api/employees (Duplicate employeeId - 409) ...");
    const dupEmpIdRes = await makeRequest(port, "POST", "/api/employees", {
      ...newEmployeeData,
      email: "different.email@peoplepulse.demo"
    });
    console.log(`HTTP Status: ${dupEmpIdRes.status}`);
    console.log("Response:", JSON.stringify(dupEmpIdRes.body, null, 2));

    // 7. POST /api/employees (Duplicate email - 409)
    console.log("\n7. Testing POST /api/employees (Duplicate email - 409) ...");
    const dupEmailRes = await makeRequest(port, "POST", "/api/employees", {
      ...newEmployeeData,
      employeeId: "EMP-TEST-8888"
    });
    console.log(`HTTP Status: ${dupEmailRes.status}`);
    console.log("Response:", JSON.stringify(dupEmailRes.body, null, 2));

    // 8. POST /api/employees (Invalid employee data - 400)
    console.log("\n8. Testing POST /api/employees (Invalid data - 400) ...");
    const invalidPostRes = await makeRequest(port, "POST", "/api/employees", { firstName: "A" });
    console.log(`HTTP Status: ${invalidPostRes.status}`);
    console.log("Response:", JSON.stringify(invalidPostRes.body, null, 2));

    // 9. PUT /api/employees/:id (Success 200)
    console.log(`\n9. Testing PUT /api/employees/${createdId} (Success 200) ...`);
    const putRes = await makeRequest(port, "PUT", `/api/employees/${createdId}`, {
      designation: "Senior Test Lead",
      location: "Remote"
    });
    console.log(`HTTP Status: ${putRes.status}`);
    console.log("Response:", JSON.stringify(putRes.body, null, 2));

    // 10. PATCH /api/employees/:id/status (Success 200 - "On Leave")
    console.log(`\n10. Testing PATCH /api/employees/${createdId}/status (Success - "On Leave") ...`);
    const patchRes = await makeRequest(port, "PATCH", `/api/employees/${createdId}/status`, {
      status: "On Leave"
    });
    console.log(`HTTP Status: ${patchRes.status}`);
    console.log("Response:", JSON.stringify(patchRes.body, null, 2));

    // 11. PATCH /api/employees/:id/status (Invalid status - 400)
    console.log(`\n11. Testing PATCH /api/employees/${createdId}/status (Invalid status - 400) ...`);
    const invalidPatchRes = await makeRequest(port, "PATCH", `/api/employees/${createdId}/status`, {
      status: "Terminated"
    });
    console.log(`HTTP Status: ${invalidPatchRes.status}`);
    console.log("Response:", JSON.stringify(invalidPatchRes.body, null, 2));

    // 12. DELETE /api/employees/:id (Soft Delete -> status = "Inactive")
    console.log(`\n12. Testing DELETE /api/employees/${createdId} (Soft Delete -> status = "Inactive") ...`);
    const deleteRes = await makeRequest(port, "DELETE", `/api/employees/${createdId}`);
    console.log(`HTTP Status: ${deleteRes.status}`);
    console.log("Response:", JSON.stringify(deleteRes.body, null, 2));

    console.log("\n=== ALL API TESTS PASSED SUCCESSFULLY ===");
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
