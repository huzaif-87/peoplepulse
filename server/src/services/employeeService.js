const mongoose = require("mongoose");
const Employee = require("../models/Employee");

// Whitelists and allowed values for strict query validation
const ALLOWED_DEPARTMENTS = [
  "Engineering",
  "Design",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
  "Operations"
];

const ALLOWED_LOCATIONS = [
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Delhi",
  "Remote"
];

const ALLOWED_EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Intern"
];

const ALLOWED_STATUSES = ["Active", "On Leave", "Inactive"];

const ALLOWED_SORT_FIELDS = [
  "firstName",
  "lastName",
  "joiningDate",
  "department",
  "status",
  "location",
  "createdAt"
];

const ALLOWED_SORT_ORDERS = ["asc", "desc"];

// Helper function to escape special regex characters for safe text search
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Helper function to create custom error objects with HTTP status codes
const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAllEmployees = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 20,
    search,
    designation,
    department,
    status,
    location,
    employmentType,
    joiningYear,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = queryParams;

  // 1. Validate pagination parameters
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1 || String(page).includes(".")) {
    throw createError(400, "Invalid page parameter. Must be a positive integer");
  }

  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100 || String(limit).includes(".")) {
    throw createError(
      400,
      "Invalid limit parameter. Must be a positive integer between 1 and 100"
    );
  }

  // 2. Validate enum filters
  if (department && !ALLOWED_DEPARTMENTS.includes(department)) {
    throw createError(
      400,
      `Invalid department filter. Allowed values are: ${ALLOWED_DEPARTMENTS.join(", ")}`
    );
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw createError(
      400,
      `Invalid status filter. Allowed values are: ${ALLOWED_STATUSES.join(", ")}`
    );
  }

  if (location && !ALLOWED_LOCATIONS.includes(location)) {
    throw createError(
      400,
      `Invalid location filter. Allowed values are: ${ALLOWED_LOCATIONS.join(", ")}`
    );
  }

  if (employmentType && !ALLOWED_EMPLOYMENT_TYPES.includes(employmentType)) {
    throw createError(
      400,
      `Invalid employmentType filter. Allowed values are: ${ALLOWED_EMPLOYMENT_TYPES.join(", ")}`
    );
  }

  // 3. Validate joiningYear
  if (joiningYear) {
    const yearNum = parseInt(joiningYear, 10);
    if (
      isNaN(yearNum) ||
      !/^\d{4}$/.test(String(joiningYear).trim()) ||
      yearNum < 1900 ||
      yearNum > 2100
    ) {
      throw createError(
        400,
        "Invalid joiningYear filter. Must be a valid 4-digit calendar year"
      );
    }
  }

  // 4. Validate sorting parameters
  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    throw createError(
      400,
      `Invalid sortBy parameter. Allowed fields: ${ALLOWED_SORT_FIELDS.join(", ")}`
    );
  }

  if (!ALLOWED_SORT_ORDERS.includes(String(sortOrder).toLowerCase())) {
    throw createError(
      400,
      `Invalid sortOrder parameter. Allowed values: ${ALLOWED_SORT_ORDERS.join(", ")}`
    );
  }

  // 5. Construct MongoDB filter query dynamically
  const query = {};
  const appliedFilters = {};

  if (department) {
    query.department = department;
    appliedFilters.department = department;
  }

  if (status) {
    query.status = status;
    appliedFilters.status = status;
  }

  if (location) {
    query.location = location;
    appliedFilters.location = location;
  }

  if (employmentType) {
    query.employmentType = employmentType;
    appliedFilters.employmentType = employmentType;
  }

  if (joiningYear) {
    const yearNum = parseInt(joiningYear, 10);
    const startOfYear = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(yearNum, 11, 31, 23, 59, 59, 999));
    query.joiningDate = { $gte: startOfYear, $lte: endOfYear };
    appliedFilters.joiningYear = yearNum;
  }

  if (designation && typeof designation === "string" && designation.trim() !== "") {
    const trimmedDesignation = designation.trim();
    const safeDesig = trimmedDesignation.replace(/[\$\{\}\[\]\<\>\\]/g, "");
    if (safeDesig) {
      query.designation = new RegExp(escapeRegex(safeDesig), "i");
      appliedFilters.designation = safeDesig;
    }
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const trimmedSearch = search.trim();
    const safeSearchRegex = new RegExp(escapeRegex(trimmedSearch), "i");
    query.$or = [
      { firstName: safeSearchRegex },
      { lastName: safeSearchRegex },
      { email: safeSearchRegex },
      { employeeId: safeSearchRegex },
      { designation: safeSearchRegex },
      { skills: safeSearchRegex }
    ];
    appliedFilters.search = trimmedSearch;
  }

  // 6. Construct Sort Options
  const sortOptions = {};
  sortOptions[sortBy] = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

  // 7. Execute Paginated Database Query
  const skip = (pageNum - 1) * limitNum;

  const [employees, total] = await Promise.all([
    Employee.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    Employee.countDocuments(query)
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum);

  return {
    employees,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    },
    filters: Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined
  };
};

const getEmployeeById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, "Invalid employee ID format");
  }

  const employee = await Employee.findById(id);
  if (!employee) {
    throw createError(404, "Employee not found");
  }

  return employee;
};

const createEmployee = async (employeeData) => {
  try {
    const newEmployee = await Employee.create(employeeData);
    return newEmployee;
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
      const message =
        field === "employeeId"
          ? "Employee ID already exists"
          : field === "email"
          ? "Email address already in use"
          : "Duplicate field value entered";
      throw createError(409, message);
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw createError(400, messages.join(", "));
    }
    throw error;
  }
};

const updateEmployee = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, "Invalid employee ID format");
  }

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      throw createError(404, "Employee not found");
    }

    return updatedEmployee;
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
      const message =
        field === "employeeId"
          ? "Employee ID already exists"
          : field === "email"
          ? "Email address already in use"
          : "Duplicate field value entered";
      throw createError(409, message);
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw createError(400, messages.join(", "));
    }
    throw error;
  }
};

const updateEmployeeStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, "Invalid employee ID format");
  }

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    throw createError(
      400,
      `Invalid status value. Allowed values are: ${ALLOWED_STATUSES.join(", ")}`
    );
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!updatedEmployee) {
    throw createError(404, "Employee not found");
  }

  return updatedEmployee;
};

const deactivateEmployee = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, "Invalid employee ID format");
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    id,
    { status: "Inactive" },
    { new: true, runValidators: true }
  );

  if (!updatedEmployee) {
    throw createError(404, "Employee not found");
  }

  return updatedEmployee;
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deactivateEmployee
};
