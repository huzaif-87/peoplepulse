import React from "react";

export const Skeleton = ({ className = "", variant = "text" }) => {
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${variantClasses[variant] || ""} ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
