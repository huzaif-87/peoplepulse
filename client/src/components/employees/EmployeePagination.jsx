import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const EmployeePagination = ({
  page = 1,
  limit = 20,
  total = 0,
  totalPages = 1,
  onPageChange
}) => {
  if (total === 0 || totalPages <= 1) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Generate page numbers array with intelligent ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 2) {
        end = 4;
      } else if (page >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-200">
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-semibold text-slate-900">{startRecord}</span>–
        <span className="font-semibold text-slate-900">{endRecord}</span> of{" "}
        <span className="font-semibold text-slate-900">{total}</span> employees
      </div>

      <nav className="flex items-center space-x-1" aria-label="Pagination Navigation">
        {/* Previous Page */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous Page"
          className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-slate-400">
                ...
              </span>
            );
          }

          const isCurrent = p === page;

          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={isCurrent ? "page" : undefined}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                isCurrent
                  ? "bg-blue-600 text-white border border-blue-600 shadow-2xs"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next Page"
          className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default EmployeePagination;
