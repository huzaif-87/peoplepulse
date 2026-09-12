import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Building2, MapPin } from "lucide-react";
import CustomChartTooltip from "./CustomChartTooltip";

export const WorkforceDistribution = ({ departmentDistribution = [], locationDistribution = [] }) => {
  const chartData = departmentDistribution.map((item) => ({
    name: item.department || item._id || "Unknown",
    count: item.count || 0
  }));

  const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8", "#1e40af", "#1e3a8a"];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Workforce Distribution</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Demographics
        </span>
      </div>

      {/* Grid: Department Bar Chart + Location Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution Chart */}
        <div className="lg:col-span-2 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Employees by Department
          </h4>
          {chartData.length > 0 ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    stroke="#475569"
                    fontSize={12}
                    width={95}
                  />
                  <Tooltip
                    content={<CustomChartTooltip unit="Employees" />}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-8">No department distribution data available.</p>
          )}
        </div>

        {/* Location Distribution */}
        <div className="space-y-3 lg:border-l lg:border-slate-100 lg:pl-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Locations</span>
          </h4>

          <div className="space-y-2.5">
            {locationDistribution.slice(0, 7).map((loc, idx) => {
              const name = loc.location || loc._id || "Unknown";
              const count = loc.count || 0;
              const maxCount = locationDistribution[0]?.count || 1;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{name}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (count / Math.max(1, maxCount)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {locationDistribution.length === 0 && (
              <p className="text-xs text-slate-400 italic">No location data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceDistribution;
