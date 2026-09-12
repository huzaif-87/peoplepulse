import React from "react";
import { formatPercent } from "../../utils/formatCurrency";
import { UserCheck, UserMinus, UserPlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CustomChartTooltip } from "./CustomChartTooltip";

export const RetentionOverview = ({ retention = {}, turnoverByDepartment = [] }) => {
  const {
    turnoverRate = 0,
    resignations = 0,
    newJoiners = 0
  } = retention;

  // Sort department turnover highest to lowest
  const chartData = [...turnoverByDepartment]
    .map((item) => ({
      department: item._id || item.department || "Unknown",
      count: item.resignations !== undefined ? item.resignations : (item.count || 0)
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Retention & Turnover</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Workforce Stability
        </span>
      </div>

      {/* Grid: Retention KPI Cards + Department Turnover Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards Column */}
        <div className="space-y-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Turnover Rate</span>
              <UserMinus className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatPercent(turnoverRate)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Annualized turnover rate</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center">
                <UserMinus className="w-3 h-3 text-red-500 mr-1" />
                Resignations
              </span>
              <div className="text-lg font-bold text-slate-900 mt-1">{resignations}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center">
                <UserPlus className="w-3 h-3 text-emerald-500 mr-1" />
                New Joiners
              </span>
              <div className="text-lg font-bold text-slate-900 mt-1">{newJoiners}</div>
            </div>
          </div>
        </div>

        {/* Department Turnover Bar Chart */}
        <div className="lg:col-span-2 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Resignations by Department (Highest to Lowest)
          </h4>
          {chartData.length > 0 ? (
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="department" tickLine={false} axisLine={false} stroke="#475569" fontSize={12} width={90} />
                  <Tooltip content={<CustomChartTooltip unit="Resignations" labelPrefix="Departures" />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#ef4444" : "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-8">No resignations recorded for the selected period.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetentionOverview;
