import React from "react";

export const KpiCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200"
  };

  const badgeStyle = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${badgeStyle} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
