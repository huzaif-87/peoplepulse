const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Employee = require("../src/models/Employee");
const employeeService = require("../src/services/employeeService");

async function runCheck() {
  console.log("Connecting to database for quality check...");
  await connectDB();

  // 1. Inspect for EMP-TEST-9999 and clean up if exists
  const testEmp = await Employee.findOne({ employeeId: "EMP-TEST-9999" });
  let empTestRemoved = false;
  if (testEmp) {
    await Employee.deleteOne({ employeeId: "EMP-TEST-9999" });
    empTestRemoved = true;
    console.log("Removed EMP-TEST-9999 record.");
  } else {
    console.log("EMP-TEST-9999 was not found in the database.");
  }

  // 2. Count final employees
  const totalCount = await Employee.countDocuments();
  console.log(`Final employee count in database: ${totalCount}`);

  // 3. Test GET /api/employees?page=1&limit=2 logic
  const page1Limit2 = await employeeService.getAllEmployees(1, 2);
  console.log("\n--- GET /api/employees?page=1&limit=2 Response Summary ---");
  console.log(`Returned data length: ${page1Limit2.employees.length}`);
  console.log("Pagination metadata:", JSON.stringify(page1Limit2.pagination, null, 2));

  // 4. Test edge cases (invalid inputs, negative numbers, non-numeric strings)
  const invalidTest = await employeeService.getAllEmployees(-3, "abc");
  console.log("\n--- Edge Case Test (page = -3, limit = 'abc') ---");
  console.log("Fallback Pagination metadata:", JSON.stringify(invalidTest.pagination, null, 2));

  // 5. Test max limit cap / safety check
  const maxLimitTest = await employeeService.getAllEmployees(1, 1000);
  console.log("\n--- Max Limit Test (limit = 1000) ---");
  console.log(`Returned count with limit 1000: ${maxLimitTest.employees.length}`);

  await mongoose.connection.close();
}

runCheck().catch((err) => {
  console.error("Quality check error:", err);
  process.exit(1);
});
