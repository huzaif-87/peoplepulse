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

module.exports = {
  getDashboardAnalytics
};
