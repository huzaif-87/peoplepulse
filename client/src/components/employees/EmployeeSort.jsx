import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export const EmployeeSort = ({ sortBy = "createdAt", sortOrder = "desc", onChangeSort }) => {
  const sortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "joiningDate", label: "Joining Date" },
    { value: "department", label: "Department" },
    { value: "status", label: "Status" },
    { value: "location", label: "Location" }
  ];

  const handleSortByChange = (e) => {
    onChangeSort(e.target.value, sortOrder);
  };

  const toggleSortOrder = () => {
    const nextOrder = sortOrder === "asc" ? "desc" : "asc";
    onChangeSort(sortBy, nextOrder);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort-by-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
        Sort by:
      </label>
      <div className="relative inline-flex items-center">
        <select
          id="sort-by-select"
          value={sortBy}
          onChange={handleSortByChange}
          className="py-1.5 pl-3 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={toggleSortOrder}
          title={`Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          aria-label={`Toggle sort order, currently ${sortOrder}`}
          className="ml-2 p-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 hover:text-blue-600 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer flex items-center"
        >
          {sortOrder === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );
};

export default EmployeeSort;
