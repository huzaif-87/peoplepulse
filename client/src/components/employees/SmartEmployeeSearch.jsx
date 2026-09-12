import React, { useState } from "react";
import { searchEmployeesWithAI } from "../../services/aiSearchService";
import { Sparkles, Search, Loader2, X, AlertCircle } from "lucide-react";

export const SmartEmployeeSearch = ({
  onApplyFilters,
  onClearSmartSearch,
  activeInterpretation,
  activeQuery
}) => {
  const [smartQuery, setSmartQuery] = useState(activeQuery || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = smartQuery.trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchEmployeesWithAI(query);
      if (response && response.success && response.data) {
        const { filters, interpretation } = response.data;
        if (onApplyFilters) {
          onApplyFilters(filters, interpretation, query);
        }
      } else {
        setError(response?.message || "Smart Search is temporarily unavailable.");
      }
    } catch (err) {
      console.error("Smart search frontend error:", err);
      const msg = err.response?.data?.message || "Smart Search is temporarily unavailable. You can continue using standard search.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSmartQuery("");
    setError(null);
    if (onClearSmartSearch) {
      onClearSmartSearch();
    }
  };

  return (
    <div className="space-y-3">
      {/* Smart Search Form Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
          <input
            type="text"
            value={smartQuery}
            onChange={(e) => {
              setSmartQuery(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            placeholder="Smart Search ✨ Describe what you're looking for (e.g. 'active developers in Chennai')..."
            aria-label="AI Smart Employee Search"
            className="w-full pl-10 pr-9 py-2 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-200 hover:border-blue-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-2xs"
          />
          {smartQuery && !loading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear Smart Search text"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !smartQuery.trim()}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Understanding...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Search</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message Notice */}
      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-amber-600 hover:text-amber-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interpretation Summary Banner */}
      {activeInterpretation && (
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-blue-900 mr-1.5">Smart Search:</span>
              <span className="text-blue-800 font-medium truncate">{activeInterpretation}</span>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" />
            <span>Clear Smart Search</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartEmployeeSearch;
