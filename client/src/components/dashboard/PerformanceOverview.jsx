import React from "react";
import { formatRating, formatPercent } from "../../utils/formatCurrency";
import { Award, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CustomChartTooltip } from "./CustomChartTooltip";

export const PerformanceOverview = ({ performance = {}, performanceByDepartment = [] }) => {
  const averageOverallScore = performance.averageOverallScore || 0;
  const productivity = performance.averageProductivityScore || performance.productivity || 0;
  const teamwork = performance.averageTeamworkScore || performance.teamwork || 0;
  const communication = performance.averageCommunicationScore || performance.communication || 0;
  const goalsCompleted = performance.averageGoalsCompleted || performance.goalsCompleted || 0;

  const chartData = performanceByDepartment.map((item) => ({
    department: item.department || item._id || "Unknown",
    score: item.averageScore !== undefined ? Number(item.averageScore.toFixed(1)) : (item.avgScore !== undefined ? Number(item.avgScore.toFixed(1)) : 0)
  }));

  const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8"];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Performance & Productivity</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Workforce Quality
        </span>
      </div>

      {/* Grid: Scores Overview + Department Scores Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric Cards Column */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-xs">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Overall Rating
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-white">
                {averageOverallScore ? averageOverallScore.toFixed(1) : "0.0"}
              </span>
              <span className="text-slate-400 text-sm font-semibold">/ 5.0</span>
            </div>
            <div className="flex items-center space-x-1 mt-2 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(averageOverallScore) ? "fill-amber-400" : "text-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sub-competencies */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-600">Productivity</span>
              <span className="font-bold text-slate-900">{formatRating(productivity)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-600">Teamwork</span>
              <span className="font-bold text-slate-900">{formatRating(teamwork)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-600">Communication</span>
              <span className="font-bold text-slate-900">{formatRating(communication)}</span>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-2.5 rounded-lg border border-blue-200">
              <span className="font-semibold text-blue-900">Goals Completed</span>
              <span className="font-extrabold text-blue-700">{formatPercent(goalsCompleted)}</span>
            </div>
          </div>
        </div>

        {/* Department Performance Bar Chart */}
        <div className="lg:col-span-2 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Performance by Department
          </h4>
          {chartData.length > 0 ? (
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 5]} tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="department" tickLine={false} axisLine={false} stroke="#475569" fontSize={12} width={90} />
                  <Tooltip content={<CustomChartTooltip unit="/ 5.0" labelPrefix="Avg Rating" />} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-8">No department performance data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;
