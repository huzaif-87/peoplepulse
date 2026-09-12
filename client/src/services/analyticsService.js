import api from "./api";

/**
 * Fetch consolidated executive HR intelligence analytics.
 * @returns {Promise<Object>} API response payload containing all dashboard analytics sections
 */
export const getDashboardAnalytics = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};

export default {
  getDashboardAnalytics
};
