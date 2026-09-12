import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export const ErrorState = ({
  title = "Something went wrong",
  message = "Failed to load data. Please check your connection and try again.",
  onRetry
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto my-8 shadow-xs">
      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
