import React from "react";
import { X } from "lucide-react";

export const ActiveFilterChips = ({ filters = {}, onRemoveFilter, onClearAll }) => {
  const filterKeys = [
    { key: "search", label: "Search" },
    { key: "designation", label: "Role" },
    { key: "department", label: "Dept" },
    { key: "status", label: "Status" },
    { key: "location", label: "Location" },
    { key: "employmentType", label: "Type" },
    { key: "joiningYear", label: "Year" }
  ];

  const activeChips = filterKeys.filter(({ key }) => Boolean(filters[key]));

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 pb-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
        Active Filters:
      </span>

      {activeChips.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
        >
          <span>
            <strong className="font-semibold text-blue-900">{label}:</strong> {filters[key]}
          </span>
          <button
            onClick={() => onRemoveFilter(key)}
            className="p-0.5 hover:bg-blue-200 rounded-full text-blue-600 hover:text-blue-900 transition-colors"
            aria-label={`Remove ${label} filter`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-xs font-semibold text-slate-600 hover:text-red-600 underline ml-2 transition-colors cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilterChips;
