import api from "./api";

export const searchEmployeesWithAI = async (query) => {
  const response = await api.post("/ai/employee-search", { query });
  return response.data;
};

export default {
  searchEmployeesWithAI
};
