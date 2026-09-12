import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getEmployees } from "../services/employeeService";
import EmployeeGrid from "../components/employees/EmployeeGrid";
import EmployeeFilters from "../components/employees/EmployeeFilters";
import ActiveFilterChips from "../components/employees/ActiveFilterChips";
import EmployeeSort from "../components/employees/EmployeeSort";
import EmployeePagination from "../components/employees/EmployeePagination";
import { Skeleton } from "../components/common/Skeleton";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { Plus, Users, AlertCircle, CheckCircle2 } from "lucide-react";

import SmartEmployeeSearch from "../components/employees/SmartEmployeeSearch";

export const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query values from URL with sensible defaults
  const search = searchParams.get("search") || "";
  const designation = searchParams.get("designation") || "";
  const department = searchParams.get("department") || "";
  const status = searchParams.get("status") || "";
  const location = searchParams.get("location") || "";
  const employmentType = searchParams.get("employmentType") || "";
  const joiningYear = searchParams.get("joiningYear") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [smartInterpretation, setSmartInterpretation] = useState("");
  const [smartQueryText, setSmartQueryText] = useState("");

  // Ref to track latest request ID for race condition prevention
  const latestRequestId = useRef(0);

  const fetchDirectory = useCallback(async () => {
    const requestId = ++latestRequestId.current;

    if (employees.length === 0) {
      setLoading(true);
    } else {
      setUpdating(true);
    }
    setError(null);

    const queryParams = {
      page,
      limit,
      sortBy,
      sortOrder
    };

    if (search) queryParams.search = search;
    if (designation) queryParams.designation = designation;
    if (department) queryParams.department = department;
    if (status) queryParams.status = status;
    if (location) queryParams.location = location;
    if (employmentType) queryParams.employmentType = employmentType;
    if (joiningYear) queryParams.joiningYear = joiningYear;

    try {
      const response = await getEmployees(queryParams);

      // Only apply response if it belongs to the latest triggered request
      if (requestId === latestRequestId.current) {
        if (response && response.success) {
          setEmployees(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      }
    } catch (err) {
      if (requestId === latestRequestId.current) {
        console.error("Failed to fetch employee directory:", err);
        setError("We couldn't retrieve the employee directory. Please try again.");
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
        setUpdating(false);
      }
    }
  }, [
    search,
    designation,
    department,
    status,
    location,
    employmentType,
    joiningYear,
    sortBy,
    sortOrder,
    page
  ]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  // Helper to update URL search parameters safely
  const updateUrlParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newParams };

    // Clean up empty params from URL
    Object.keys(updated).forEach((key) => {
      if (!updated[key]) {
        delete updated[key];
      }
    });

    setSearchParams(updated, { replace: true });
  };

  const handleFilterChange = (key, value) => {
    updateUrlParams({
      [key]: value,
      page: 1 // Reset page on filter/search change
    });
  };

  const handleRemoveFilter = (key) => {
    updateUrlParams({
      [key]: "",
      page: 1
    });
  };

  const handleClearAllFilters = () => {
    setSmartInterpretation("");
    setSmartQueryText("");
    setSearchParams({}, { replace: true });
  };

  const handleApplySmartFilters = (aiFilters, interpretation, rawQuery) => {
    setSmartInterpretation(interpretation || "");
    setSmartQueryText(rawQuery || "");

    const newParams = {
      page: 1,
      search: aiFilters.search || "",
      designation: aiFilters.designation || "",
      department: aiFilters.department || "",
      status: aiFilters.status || "",
      location: aiFilters.location || "",
      employmentType: aiFilters.employmentType || "",
      joiningYear: aiFilters.joiningYear || "",
      sortBy: aiFilters.sortBy || "createdAt",
      sortOrder: aiFilters.sortOrder || "desc"
    };

    updateUrlParams(newParams);
  };

  const handleClearSmartSearch = () => {
    setSmartInterpretation("");
    setSmartQueryText("");
    setSearchParams({}, { replace: true });
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    updateUrlParams({
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({
      page: newPage
    });
  };

  const activeFilters = {
    search,
    designation,
    department,
    status,
    location,
    employmentType,
    joiningYear
  };

  const hasActiveFilters = Boolean(
    search || designation || department || status || location || employmentType || joiningYear
  );

  return (
    <AppLayout title="Employee Directory">
      <div className="space-y-6">
        {/* Header Action Notice Banner if Add Employee clicked */}
        {showAddNotice && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900 text-sm shadow-xs transition-all">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                <strong>Add Employee:</strong> The new employee onboarding form will be enabled in the upcoming release.
              </span>
            </div>
            <button
              onClick={() => setShowAddNotice(false)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* First Viewport Heading & Header Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Employee Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your workforce, search employees, and quickly view employee information.
            </p>
          </div>

          <Link
            to="/employees/new"
            className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </Link>
        </div>

        {/* AI Smart Employee Search Assistant */}
        <SmartEmployeeSearch
          onApplyFilters={handleApplySmartFilters}
          onClearSmartSearch={handleClearSmartSearch}
          activeInterpretation={smartInterpretation}
          activeQuery={smartQueryText}
        />

        {/* Standard Search & Filters Toolbar */}
        <EmployeeFilters
          filters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearAllFilters}
        />

        {/* Active Filter Chips */}
        <ActiveFilterChips
          filters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Results Bar: Total Count & Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              {hasActiveFilters
                ? `${pagination.total} employees found`
                : `${pagination.total} employees`}
            </span>
            {updating && (
              <span className="text-xs text-blue-600 font-normal animate-pulse">
                Updating...
              </span>
            )}
          </div>

          <EmployeeSort
            sortBy={sortBy}
            sortOrder={sortOrder}
            onChangeSort={handleSortChange}
          />
        </div>

        {/* Content Views: Loading, Error, Empty, or Grid */}
        {loading ? (
          /* Initial Load Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton variant="avatar" className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" className="w-3/4 h-4" />
                    <Skeleton variant="text" className="w-1/2 h-3" />
                  </div>
                </div>
                <Skeleton variant="text" className="w-full h-3" />
                <Skeleton variant="text" className="w-2/3 h-3" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <ErrorState
            title="Unable to load employees"
            message={error}
            onRetry={fetchDirectory}
          />
        ) : employees.length === 0 ? (
          /* Empty State */
          <EmptyState
            title="No employees found"
            message="Try adjusting your search or filters to find what you are looking for."
            actionText={hasActiveFilters ? "Clear filters" : undefined}
            onAction={hasActiveFilters ? handleClearAllFilters : undefined}
          />
        ) : (
          /* Main Employee Grid & Pagination */
          <div className={`transition-opacity duration-200 ${updating ? "opacity-60" : "opacity-100"}`}>
            <EmployeeGrid employees={employees} />

            <EmployeePagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default EmployeesPage;
