const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/dashboard", analyticsController.getDashboardAnalytics);
router.get("/headcount", analyticsController.getHeadcountAnalytics);
router.get("/attendance", analyticsController.getAttendanceAnalytics);
router.get("/performance", analyticsController.getPerformanceAnalytics);
router.get("/financial", analyticsController.getFinancialAnalytics);
router.get("/retention", analyticsController.getRetentionAnalytics);

module.exports = router;
