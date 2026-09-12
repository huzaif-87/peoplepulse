const employeeService = require("../services/employeeService");

const getEmployees = async (req, res) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    const responsePayload = {
      success: true,
      data: result.employees,
      pagination: result.pagination
    };
    if (result.filters) {
      responsePayload.filters = result.filters;
    }
    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id);
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const createEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    return res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.updateEmployee(id, req.body);
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const employee = await employeeService.updateEmployeeStatus(id, status);
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.deactivateEmployee(id);
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateStatus,
  deleteEmployee
};
