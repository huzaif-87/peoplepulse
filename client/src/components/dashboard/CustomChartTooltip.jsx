import React from "react";

export const CustomChartTooltip = ({ active, payload, label, unit = "", valueFormatter }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const dataPoint = payload[0];
  const formattedVal = valueFormatter
    ? valueFormatter(dataPoint.value)
    : `${dataPoint.value}${unit ? ` ${unit}` : ""}`;

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1 z-50">
      <p className="font-bold text-slate-900">{label || dataPoint.name}</p>
      <div className="flex items-center space-x-2 text-slate-600">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ backgroundColor: dataPoint.color || dataPoint.fill || "#2563eb" }}
        />
        <span className="font-semibold text-slate-800">{formattedVal}</span>
      </div>
    </div>
  );
};

export default CustomChartTooltip;
