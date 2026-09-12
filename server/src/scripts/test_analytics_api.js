const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { getDashboardAnalytics } = require("../services/analyticsService");

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log("Connecting to MongoDB:", mongoUri ? "URI present" : "URI MISSING");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    console.log("\n==========================================");
    console.log("RUNNING ANALYTICS SERVICE TESTS");
    console.log("==========================================\n");

    const data = await getDashboardAnalytics();

    // 1b. Employment Type & Joining Year Distribution
    console.log("1b. Employment Type Distribution:", data.employmentTypeDistribution);
    if (!data.employmentTypeDistribution || data.employmentTypeDistribution.length === 0) throw new Error("Employment type distribution empty");
    console.log("1c. Joining Year Distribution:", data.joiningYearDistribution);
    if (!data.joiningYearDistribution || data.joiningYearDistribution.length === 0) throw new Error("Joining year distribution empty");

    // 2. Hiring Trend
    console.log("2. Hiring Trend length:", data.hiringTrend.length);
    const nonZeroHiring = data.hiringTrend.filter(h => h.count > 0);
    console.log("   Months with hires:", nonZeroHiring.length);
    if (nonZeroHiring.length === 0) throw new Error("Hiring trend has all zero months!");

    // 3. Attendance
    console.log("3. Attendance Metrics:", data.attendance);
    if (data.attendance.attendanceRate <= 0) throw new Error("Attendance rate should be > 0");
    if (data.attendance.averageWorkingHours <= 0) throw new Error("Average working hours should be > 0");

    // 3b. Attendance Trend & Status Breakdown
    console.log("3b. Attendance Status Breakdown:", data.attendance.statusBreakdown);
    console.log("3c. Attendance Trend length:", data.attendanceTrend.length);
    if (!data.attendanceTrend || data.attendanceTrend.length === 0) throw new Error("Attendance trend empty");

    // 5b. Performance Rating Distribution
    console.log("5b. Performance Rating Distribution:", data.performanceRatingDistribution);
    if (!data.performanceRatingDistribution || data.performanceRatingDistribution.length === 0) throw new Error("Performance rating distribution empty");

    // 6b. Payroll Trend
    console.log("6b. Payroll Trend length:", data.payrollTrend.length);
    if (!data.payrollTrend || data.payrollTrend.length === 0) throw new Error("Payroll trend empty");

    // 7b. Turnover Trend
    console.log("7b. Turnover Trend length:", data.turnoverTrend.length);
    if (!data.turnoverTrend || data.turnoverTrend.length === 0) throw new Error("Turnover trend empty");

    console.log("\n✅ ALL BACKEND ANALYTICS TESTS PASSED SUCCESSFULLY!\n");
  } catch (err) {
    console.error("❌ TEST FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
