const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const user = await authService.getUserById(userId);
    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
