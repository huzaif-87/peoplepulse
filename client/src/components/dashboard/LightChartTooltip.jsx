import React from "react";

export const LightChartTooltip = ({ active, payload, label, unit = "", labelPrefix = "", valueFormatter }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const dataPoint = payload[0];
  const itemLabel = label || dataPoint.payload?.department || dataPoint.payload?.month || dataPoint.payload?.category || dataPoint.name || "Item";
  const rawValue = dataPoint.value !== undefined ? dataPoint.value : 0;

  const formattedVal = valueFormatter
    ? valueFormatter(rawValue)
    : `${labelPrefix ? `${labelPrefix}: ` : ""}${rawValue}${unit ? ` ${unit}` : ""}`;

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1 z-50">
      <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{itemLabel}</p>
      <div className="flex items-center space-x-2 text-slate-700 pt-0.5">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: dataPoint.color || dataPoint.fill || "#2563eb" }}
        />
        <span className="font-bold text-slate-900">{formattedVal}</span>
      </div>
    </div>
  );
};

export default LightChartTooltip;
