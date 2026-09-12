const analyticsService = require("../services/analyticsService");

const getDashboardAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getDashboardAnalytics();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Analytics Dashboard Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load HR analytics"
    });
  }
};

const getHeadcountAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getHeadcountAnalytics();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Headcount Analytics Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load headcount analytics"
    });
  }
};

const getAttendanceAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getAttendanceAnalytics();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Attendance Analytics Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load attendance analytics"
    });
  }
};

const getPerformanceAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getPerformanceAnalytics();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Performance Analytics Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load performance analytics"
    });
  }
};

const getFinancialAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getFinancialAnalytics();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Financial Analytics Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load financial analytics"
    });
  }
};

const getRetentionAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getRetentionAnalytics();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Retention Analytics Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load retention analytics"
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getHeadcountAnalytics,
  getAttendanceAnalytics,
  getPerformanceAnalytics,
  getFinancialAnalytics,
  getRetentionAnalytics
};
