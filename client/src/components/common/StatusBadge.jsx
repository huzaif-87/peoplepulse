import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export const StatusBadge = ({ status = "Active", size = "md" }) => {
  const configs = {
    Active: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      label: "Active"
    },
    "On Leave": {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      iconColor: "text-amber-500",
      label: "On Leave"
    },
    Inactive: {
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      icon: XCircle,
      iconColor: "text-slate-400",
      label: "Inactive"
    }
  };

  const config = configs[status] || configs.Active;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3 py-1.5 text-sm font-medium gap-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  };

  return (
    <span
      className={`inline-flex items-center border rounded-full ${config.bg} ${sizeClasses[size] || sizeClasses.md}`}
      role="status"
    >
      <IconComponent className={`${config.iconColor} ${iconSizes[size] || iconSizes.md}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
