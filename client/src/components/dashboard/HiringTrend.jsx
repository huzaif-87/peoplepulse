import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { TrendingUp } from "lucide-react";
import CustomChartTooltip from "./CustomChartTooltip";

export const HiringTrend = ({ hiringTrend = [] }) => {
  const data = hiringTrend.map((item) => {
    const periodStr = item.period || item.month || item._id || "";
    let monthLabel = periodStr;

    if (periodStr && periodStr.includes("-")) {
      const [year, month] = periodStr.split("-");
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      monthLabel = dateObj.toLocaleDateString("en-US", { month: "short" });
    }

    return {
      month: monthLabel,
      hires: item.count !== undefined ? item.count : item.hires || 0
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Hiring Trend</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Workforce Growth
        </span>
      </div>

      {data.length > 0 ? (
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hiringGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip
                content={<CustomChartTooltip unit="Hires" />}
                cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="hires"
                name="New Hires"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#hiringGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-8">No hiring trend data available.</p>
      )}
    </div>
  );
};

export default HiringTrend;
