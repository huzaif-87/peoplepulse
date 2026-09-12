import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <Loader2
      className={`animate-spin text-blue-600 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      aria-label="Loading"
    />
  );
};

export const PageLoader = ({ message = "Loading PeoplePulse..." }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
