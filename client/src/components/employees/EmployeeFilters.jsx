import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";

export const EmployeeFilters = ({
  filters = {},
  onFilterChange,
  onClearFilters
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync internal search input if external search filter changes (e.g., URL navigation or clear filters)
  useEffect(() => {
    const externalSearch = filters.search || "";
    if (externalSearch !== searchInput.trim()) {
      setSearchInput(externalSearch);
    }
  }, [filters.search]);

  // Debounce search input changes by ~350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const externalSearch = (filters.search || "").trim();
      const internalSearch = searchInput.trim();

      if (externalSearch !== internalSearch) {
        onFilterChange("search", internalSearch);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const departments = [
    "Engineering",
    "Design",
    "Sales",
    "Marketing",
    "HR",
    "Finance",
    "Operations"
  ];

  const statuses = ["Active", "On Leave", "Inactive"];

  const locations = [
    "Chennai",
    "Bangalore",
    "Hyderabad",
    "Mumbai",
    "Pune",
    "Delhi",
    "Remote"
  ];

  const employmentTypes = ["Full-time", "Part-time", "Contract", "Intern"];

  const joiningYears = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.department ||
      filters.status ||
      filters.location ||
      filters.employmentType ||
      filters.joiningYear
  );

  return (
    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
      {/* Top Bar: Search Input + Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, employee ID, role or skill..."
            aria-label="Search employees"
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                onFilterChange("search", "");
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden w-full flex items-center justify-center space-x-2 py-2 px-4 bg-slate-100 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer"
        >
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>
      </div>

      {/* Filter Dropdowns (Desktop always visible, Mobile collapsible) */}
      <div
        className={`${
          isMobileOpen ? "block" : "hidden md:grid"
        } grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t md:border-t-0 border-slate-100`}
      >
        {/* Department */}
        <div>
          <label htmlFor="dept-select" className="sr-only">Department</label>
          <select
            id="dept-select"
            value={filters.department || ""}
            onChange={(e) => onFilterChange("department", e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status-select" className="sr-only">Status</label>
          <select
            id="status-select"
            value={filters.status || ""}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="loc-select" className="sr-only">Location</label>
          <select
            id="loc-select"
            value={filters.location || ""}
            onChange={(e) => onFilterChange("location", e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label htmlFor="type-select" className="sr-only">Employment Type</label>
          <select
            id="type-select"
            value={filters.employmentType || ""}
            onChange={(e) => onFilterChange("employmentType", e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Types</option>
            {employmentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Joining Year */}
        <div>
          <label htmlFor="year-select" className="sr-only">Joining Year</label>
          <select
            id="year-select"
            value={filters.joiningYear || ""}
            onChange={(e) => onFilterChange("joiningYear", e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Years</option>
            {joiningYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;
