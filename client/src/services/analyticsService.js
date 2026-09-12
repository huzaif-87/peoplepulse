import api from "./api";

/**
 * Fetch consolidated executive HR intelligence analytics.
 * @returns {Promise<Object>} API response payload containing all dashboard analytics sections
 */
export const getDashboardAnalytics = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};

export const getHeadcountAnalytics = async () => {
  const response = await api.get("/analytics/headcount");
  return response.data;
};

export const getAttendanceAnalytics = async () => {
  const response = await api.get("/analytics/attendance");
  return response.data;
};

export const getPerformanceAnalytics = async () => {
  const response = await api.get("/analytics/performance");
  return response.data;
};

export const getFinancialAnalytics = async () => {
  const response = await api.get("/analytics/financial");
  return response.data;
};

export const getRetentionAnalytics = async () => {
  const response = await api.get("/analytics/retention");
  return response.data;
};

export default {
  getDashboardAnalytics,
  getHeadcountAnalytics,
  getAttendanceAnalytics,
  getPerformanceAnalytics,
  getFinancialAnalytics,
  getRetentionAnalytics
};
