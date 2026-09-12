const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config();

const connectDB = require("../config/db");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const PerformanceReview = require("../models/PerformanceReview");
const Payroll = require("../models/Payroll");
const EmploymentHistory = require("../models/EmploymentHistory");

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max, decimals = 1) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const LEAVE_REASONS = [
  "Annual family vacation",
  "Medical checkup and rest",
  "Personal commitments",
  "Family emergency",
  "Attending relative wedding",
  "Home renovation work",
  "Wellness and recharge",
  "Travel and relocation work"
];

const RESIGNATION_REASONS = [
  "Career Growth",
  "Relocation",
  "Better Opportunity",
  "Personal Reasons",
  "Higher Studies",
  "Entrepreneurial Pursuit"
];

const seedHrData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Fetching existing employees...");
    const employees = await Employee.find().lean();
    if (!employees || employees.length === 0) {
      console.error("No employees found in database! Please run npm run seed:employees first.");
      process.exit(1);
    }
    console.log(`Found ${employees.length} existing employees.`);

    console.log("Clearing existing HR supporting collections...");
    await Promise.all([
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      PerformanceReview.deleteMany({}),
      Payroll.deleteMany({}),
      EmploymentHistory.deleteMany({})
    ]);

    const now = new Date();
    const currentYear = now.getFullYear();

    // -------------------------------------------------------------
    // 1. Generate Attendance Data (~45 recent working days in 2026)
    // -------------------------------------------------------------
    console.log("Generating Attendance records...");
    const attendanceRecords = [];

    const pastDates = [];
    for (let d = 1; d <= 65; d++) {
      const date = new Date(now);
      date.setDate(now.getDate() - d);
      date.setHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        pastDates.push(date);
      }
    }
    const workingDates = pastDates.slice(0, 45);

    for (const emp of employees) {
      const empJoining = new Date(emp.joiningDate);
      empJoining.setHours(0, 0, 0, 0);

      for (const date of workingDates) {
        if (date < empJoining) continue;

        let status = "Present";
        let checkIn = "09:00";
        let checkOut = "17:30";
        let workingHours = 8.5;

        if (emp.status === "On Leave" && Math.random() < 0.6) {
          status = "Absent";
          checkIn = undefined;
          checkOut = undefined;
          workingHours = 0;
        } else {
          const roll = Math.random();
          if (roll < 0.83) {
            status = "Present";
            const minStr = String(getRandomInt(0, 15)).padStart(2, "0");
            checkIn = `08:${minStr}`;
            checkOut = "17:30";
            workingHours = 8.5;
          } else if (roll < 0.91) {
            status = "Late";
            const minStr = String(getRandomInt(30, 55)).padStart(2, "0");
            checkIn = `09:${minStr}`;
            checkOut = "17:30";
            workingHours = 7.5;
          } else if (roll < 0.95) {
            status = "Half Day";
            checkIn = "09:00";
            checkOut = "13:00";
            workingHours = 4.0;
          } else {
            status = "Absent";
            checkIn = undefined;
            checkOut = undefined;
            workingHours = 0;
          }
        }

        attendanceRecords.push({
          employeeId: emp.employeeId,
          date: date,
          status: status,
          checkIn: checkIn,
          checkOut: checkOut,
          workingHours: workingHours
        });
      }
    }

    // -------------------------------------------------------------
    // 2. Generate Leave Requests (~100-140 records, 14+ pending)
    // -------------------------------------------------------------
    console.log("Generating Leave Request records...");
    const leaveRequests = [];
    const leaveTypes = ["Annual", "Sick", "Personal", "Emergency"];

    // Select ~110 employees for leave requests
    const leaveSub = employees.filter(() => Math.random() < 0.40);
    let pendingCount = 0;

    for (const emp of leaveSub) {
      const empJoining = new Date(emp.joiningDate);
      const daysAgo = getRandomInt(2, 120);
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      if (startDate < empJoining) continue;

      const duration = getRandomInt(1, 4);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration);

      // Force ~14 pending requests for actionable HR metrics
      let status = "Approved";
      if (pendingCount < 14 && Math.random() < 0.35) {
        status = "Pending";
        pendingCount++;
      } else if (Math.random() < 0.15) {
        status = "Rejected";
      }

      leaveRequests.push({
        employeeId: emp.employeeId,
        leaveType: getRandomItem(leaveTypes),
        startDate: startDate,
        endDate: endDate,
        reason: getRandomItem(LEAVE_REASONS),
        status: status,
        requestedAt: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000)
      });
    }

    // Ensure we have at least 14 pending requests
    while (pendingCount < 14) {
      const emp = getRandomItem(employees);
      const startDate = new Date(now.getTime() - getRandomInt(1, 15) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 2);

      leaveRequests.push({
        employeeId: emp.employeeId,
        leaveType: getRandomItem(leaveTypes),
        startDate: startDate,
        endDate: endDate,
        reason: getRandomItem(LEAVE_REASONS),
        status: "Pending",
        requestedAt: new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
      });
      pendingCount++;
    }

    // -------------------------------------------------------------
    // 3. Generate Performance Reviews (including recent 2025/2026 periods)
    // -------------------------------------------------------------
    console.log("Generating Performance Review records...");
    const performanceReviews = [];
    const periods = [
      { period: "2024-H2", date: new Date("2024-12-31") },
      { period: "2025-H1", date: new Date("2025-06-30") },
      { period: "2025-H2", date: new Date("2025-12-31") }
    ];

    for (const emp of employees) {
      const empJoining = new Date(emp.joiningDate);
      for (const p of periods) {
        if (p.date < empJoining) continue;

        const overall = getRandomNumber(3.4, 4.9, 1);
        const prod = getRandomNumber(3.5, 5.0, 1);
        const team = getRandomNumber(3.5, 5.0, 1);
        const comm = getRandomNumber(3.5, 5.0, 1);
        const goals = getRandomInt(75, 98);

        performanceReviews.push({
          employeeId: emp.employeeId,
          reviewPeriod: p.period,
          overallScore: overall,
          productivityScore: prod,
          teamworkScore: team,
          communicationScore: comm,
          goalsCompleted: goals,
          reviewDate: p.date
        });
      }
    }

    // -------------------------------------------------------------
    // 4. Generate Payroll Records (up to 2026-02 / 2026-03)
    // -------------------------------------------------------------
    console.log("Generating Payroll records...");
    const payrollRecords = [];
    const payrollMonths = [
      "2025-09",
      "2025-10",
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02"
    ];

    for (const emp of employees) {
      let baseMonthlySalary = 75000;
      if (emp.employmentType === "Intern") {
        baseMonthlySalary = 22000;
      } else if (emp.employmentType === "Contract" || emp.employmentType === "Part-time") {
        baseMonthlySalary = 48000;
      } else if (emp.designation.includes("Manager") || emp.designation.includes("Lead")) {
        baseMonthlySalary = 140000;
      } else if (emp.department === "Engineering") {
        baseMonthlySalary = 95000;
      }

      for (const monthStr of payrollMonths) {
        const benefits = Math.round(baseMonthlySalary * 0.12);
        const isYearEnd = monthStr === "2025-12";
        const bonus = isYearEnd ? Math.round(baseMonthlySalary * 0.15) : Math.round(baseMonthlySalary * 0.05);
        const totalCost = baseMonthlySalary + benefits + bonus;

        payrollRecords.push({
          employeeId: emp.employeeId,
          month: monthStr,
          baseSalary: baseMonthlySalary,
          benefits: benefits,
          bonus: bonus,
          totalCost: totalCost
        });
      }
    }

    // -------------------------------------------------------------
    // 5. Generate Employment History Records (including 2026 new hires)
    // -------------------------------------------------------------
    console.log("Generating Employment History records...");
    const historyRecords = [];

    for (const emp of employees) {
      const joiningDate = new Date(emp.joiningDate);

      // 1. All employees have a Joined event
      historyRecords.push({
        employeeId: emp.employeeId,
        eventType: "Joined",
        eventDate: joiningDate,
        department: emp.department,
        reason: "New Hire"
      });

      // 2. Promotions & Transfers in 2025 / 2026
      const tenureMs = now.getTime() - joiningDate.getTime();
      const tenureYears = tenureMs / (1000 * 60 * 60 * 24 * 365);

      if (tenureYears > 1.0 && Math.random() < 0.30) {
        const promoDate = new Date(joiningDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        historyRecords.push({
          employeeId: emp.employeeId,
          eventType: Math.random() < 0.8 ? "Promoted" : "Transferred",
          eventDate: promoDate,
          department: emp.department,
          reason: "Performance Excellence & Career Progression"
        });
      }

      // 3. Inactive employees have a Resigned event in 2026
      if (emp.status === "Inactive") {
        const resignDate = new Date(now.getTime() - getRandomInt(5, 75) * 24 * 60 * 60 * 1000);
        historyRecords.push({
          employeeId: emp.employeeId,
          eventType: "Resigned",
          eventDate: resignDate,
          department: emp.department,
          reason: getRandomItem(RESIGNATION_REASONS)
        });
      }
    }

    // Add explicit 2026 joined events across months 2026-01, 2026-02, 2026-03 for hiring trend
    const recentHires = employees.slice(0, 35);
    const months2026 = [0, 1, 2]; // Jan, Feb, Mar 2026
    recentHires.forEach((emp, index) => {
      const monthIdx = months2026[index % months2026.length];
      const hireDate = new Date(currentYear, monthIdx, getRandomInt(2, 25));
      historyRecords.push({
        employeeId: emp.employeeId,
        eventType: "Joined",
        eventDate: hireDate,
        department: emp.department,
        reason: "Strategic Expansion & Talent Acquisition"
      });
    });

    // -------------------------------------------------------------
    // Batch Insert into Database
    // -------------------------------------------------------------
    console.log("Inserting HR records into database...");
    await Promise.all([
      Attendance.insertMany(attendanceRecords),
      LeaveRequest.insertMany(leaveRequests),
      PerformanceReview.insertMany(performanceReviews),
      Payroll.insertMany(payrollRecords),
      EmploymentHistory.insertMany(historyRecords)
    ]);

    console.log("\n=============================================");
    console.log(" HR INTELLIGENCE DATA SEED COMPLETED");
    console.log("=============================================");
    console.log(`Employees: ${employees.length}`);
    console.log(`Attendance records: ${attendanceRecords.length}`);
    console.log(`Leave requests: ${leaveRequests.length}`);
    console.log(`Performance reviews: ${performanceReviews.length}`);
    console.log(`Payroll records: ${payrollRecords.length}`);
    console.log(`Employment history records: ${historyRecords.length}`);
    console.log("=============================================\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding HR data:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedHrData();
