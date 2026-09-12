const aiSearchService = require("../services/aiSearchService");

/**
 * @desc    Process natural language employee search using Gemini AI
 * @route   POST /api/ai/employee-search
 * @access  Private (JWT Protected)
 */
const searchEmployeesWithAI = async (req, res) => {
  try {
    const { query } = req.body;

    if (query === undefined || query === null || (typeof query === "string" && !query.trim())) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    if (typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query must be a string"
      });
    }

    const result = await aiSearchService.parseNaturalLanguageQuery(query);

    if (result.isEmployeeQuery === false) {
      return res.status(400).json({
        success: false,
        message: result.message || "This search is designed for employee and workforce queries."
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        filters: result.filters,
        interpretation: result.interpretation
      }
    });
  } catch (error) {
    console.error("AI Employee Search Error:", error);
    return res.status(500).json({
      success: false,
      message: "Smart Search is temporarily unavailable. You can continue using standard search."
    });
  }
};

module.exports = {
  searchEmployeesWithAI
};
