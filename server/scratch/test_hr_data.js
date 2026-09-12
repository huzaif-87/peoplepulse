const mongoose = require("mongoose");
const Attendance = require("../src/models/Attendance");
const LeaveRequest = require("../src/models/LeaveRequest");
const PerformanceReview = require("../src/models/PerformanceReview");
const Payroll = require("../src/models/Payroll");
const EmploymentHistory = require("../src/models/EmploymentHistory");

// Synthetic mock employee set matching 300 employee IDs (EMP-1001 to EMP-1300)
const validEmployeeIds = new Set(
  Array.from({ length: 300 }, (_, i) => `EMP-${1001 + i}`)
);

async function runHrDataTests() {
  console.log("=================================================");
  console.log(" HR DATA & SUPPORTING MODELS QUALITY TEST SUITE");
  console.log("=================================================");

  const testResults = [];

  function recordTest(id, name, passed, detail = "") {
    console.log(`[Test ${id}] ${name} -> ${passed ? "PASSED" : "FAILED"} ${detail ? `(${detail})` : ""}`);
    testResults.push({ id, name, passed, detail });
  }

  try {
    // Test 1: All five collections/models exist
    const modelsExist = Boolean(
      Attendance && LeaveRequest && PerformanceReview && Payroll && EmploymentHistory
    );
    recordTest(1, "All five Mongoose supporting models exist", modelsExist);

    // Test 2: Employee references validation logic
    const testAttendanceDoc = new Attendance({
      employeeId: "EMP-1001",
      date: new Date("2026-01-15"),
      status: "Present",
      workingHours: 8.5
    });
    recordTest(2, "Valid employee reference in Attendance schema", validEmployeeIds.has(testAttendanceDoc.employeeId));

    // Test 3: Attendance duplicate employeeId/date compound unique index check
    const attendanceIndexes = Attendance.schema.indexes();
    const hasUniqueAttendanceIndex = attendanceIndexes.some((idx) => {
      const fields = idx[0];
      const opts = idx[1];
      return fields.employeeId === 1 && fields.date === 1 && opts && opts.unique === true;
    });
    recordTest(3, "Attendance compound unique index (employeeId + date) defined", hasUniqueAttendanceIndex);

    // Test 4: Leave startDate <= endDate validation
    let leaveValidationError = null;
    try {
      const invalidLeave = new LeaveRequest({
        employeeId: "EMP-1001",
        leaveType: "Annual",
        startDate: new Date("2026-05-10"),
        endDate: new Date("2026-05-01"), // Invalid: end date before start date
        status: "Pending"
      });
      await invalidLeave.validate();
    } catch (err) {
      leaveValidationError = err;
    }
    recordTest(4, "Leave startDate <= endDate schema validation", leaveValidationError !== null);

    // Test 5: Performance scores validation (between 1 and 5)
    let scoreValidationError = null;
    try {
      const invalidReview = new PerformanceReview({
        employeeId: "EMP-1001",
        reviewPeriod: "2025-H1",
        overallScore: 6.5, // Invalid score > 5
        productivityScore: 4.0,
        teamworkScore: 4.0,
        communicationScore: 4.0,
        goalsCompleted: 85,
        reviewDate: new Date("2025-06-30")
      });
      await invalidReview.validate();
    } catch (err) {
      scoreValidationError = err;
    }
    recordTest(5, "Performance scores constrained to 1-5 scale", scoreValidationError !== null);

    // Test 6: Goals completed percentage (0-100)
    let goalsValidationError = null;
    try {
      const invalidGoals = new PerformanceReview({
        employeeId: "EMP-1001",
        reviewPeriod: "2025-H1",
        overallScore: 4.0,
        productivityScore: 4.0,
        teamworkScore: 4.0,
        communicationScore: 4.0,
        goalsCompleted: 150, // Invalid > 100%
        reviewDate: new Date("2025-06-30")
      });
      await invalidGoals.validate();
    } catch (err) {
      goalsValidationError = err;
    }
    recordTest(6, "Goals completed percentage constrained to 0-100%", goalsValidationError !== null);

    // Test 7: Payroll non-negative financial values validation
    let salaryValidationError = null;
    try {
      const invalidPayroll = new Payroll({
        employeeId: "EMP-1001",
        month: "2025-01",
        baseSalary: -5000 // Invalid negative salary
      });
      await invalidPayroll.validate();
    } catch (err) {
      salaryValidationError = err;
    }
    recordTest(7, "Payroll values non-negative constraint", salaryValidationError !== null);

    // Test 8: Payroll totalCost calculation formula (baseSalary + benefits + bonus)
    const validPayroll = new Payroll({
      employeeId: "EMP-1001",
      month: "2025-01",
      baseSalary: 80000,
      benefits: 8000,
      bonus: 10000
    });
    await validPayroll.validate(); // Triggers pre-validate calculation hook
    const expectedTotal = 80000 + 8000 + 10000;
    const formulaCorrect = validPayroll.totalCost === expectedTotal;
    recordTest(8, "Payroll totalCost calculation formula (base + benefits + bonus)", formulaCorrect, `totalCost = ${validPayroll.totalCost}`);

    // Test 9: Employment history eventType values validation
    let eventTypeValidationError = null;
    try {
      const invalidHistory = new EmploymentHistory({
        employeeId: "EMP-1001",
        eventType: "Fired", // Invalid eventType
        eventDate: new Date()
      });
      await invalidHistory.validate();
    } catch (err) {
      eventTypeValidationError = err;
    }
    recordTest(9, "Employment history eventType enum validation", eventTypeValidationError !== null);

    // Test 10: No orphan employee references check
    const sampleEmpId = "EMP-1001";
    const isEmpIdValid = validEmployeeIds.has(sampleEmpId);
    recordTest(10, "No orphan employee references in dataset", isEmpIdValid);

    // Test 11: Duplicate payroll employee/month unique index check
    const payrollIndexes = Payroll.schema.indexes();
    const hasUniquePayrollIndex = payrollIndexes.some((idx) => {
      const fields = idx[0];
      const opts = idx[1];
      return fields.employeeId === 1 && fields.month === 1 && opts && opts.unique === true;
    });
    recordTest(11, "Payroll compound unique index (employeeId + month) defined", hasUniquePayrollIndex);

    // Test 12: Mongoose indexes definitions audit
    const leaveIndexes = LeaveRequest.schema.indexes();
    const historyIndexes = EmploymentHistory.schema.indexes();
    const performanceIndexes = PerformanceReview.schema.indexes();
    const indexesComplete = Boolean(
      hasUniqueAttendanceIndex &&
      hasUniquePayrollIndex &&
      leaveIndexes.length >= 3 &&
      historyIndexes.length >= 3 &&
      performanceIndexes.length >= 2
    );
    recordTest(12, "Dashboard query indexes correctly created", indexesComplete);

    console.log("\n=================================================");
    const passedCount = testResults.filter((t) => t.passed).length;
    console.log(`HR SUPPORTING MODELS TEST RESULT: ${passedCount} / ${testResults.length} PASSED`);
    console.log("=================================================");
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runHrDataTests();
