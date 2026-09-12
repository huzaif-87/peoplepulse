import api from "./api";

/**
 * Fetch paginated, filtered, searched, and sorted employees.
 */
export const getEmployees = async (params = {}) => {
  const response = await api.get("/employees", { params });
  return response.data;
};

/**
 * Fetch single employee by ID.
 */
export const getEmployee = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

/**
 * Create a new employee record.
 */
export const createEmployee = async (employeeData) => {
  const response = await api.post("/employees", employeeData);
  return response.data;
};

/**
 * Update an existing employee record by ID.
 */
export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

/**
 * Update employee status (Active, On Leave, Inactive).
 */
export const updateEmployeeStatus = async (id, status) => {
  const response = await api.patch(`/employees/${id}/status`, { status });
  return response.data;
};

/**
 * Soft delete / deactivate an employee.
 */
export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export default {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee
};
