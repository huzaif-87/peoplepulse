const express = require("express");
const router = express.Router();
const { searchEmployeesWithAI } = require("../controllers/aiSearchController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/ai/employee-search (JWT Protected)
router.post("/employee-search", protect, searchEmployeesWithAI);

module.exports = router;
