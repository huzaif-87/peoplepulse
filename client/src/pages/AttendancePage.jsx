import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getDashboardAnalytics } from "../services/analyticsService";
import KpiCard from "../components/dashboard/KpiCard";
import LightChartTooltip from "../components/dashboard/LightChartTooltip";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import {
  CalendarCheck,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  CheckSquare
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

export const AttendancePage = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getDashboardAnalytics();
      if (response && response.success && response.data) {
        setAnalytics(response.data);
        setLastUpdated(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          })
        );
      }
    } catch (err) {
      console.error("Failed to load attendance analytics:", err);
      setError("We couldn't retrieve the latest attendance & leave data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const parts = monthStr.split("-");
    if (parts.length === 2) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
    return monthStr;
  };

  return (
    <AppLayout title="Attendance & Leave Analytics">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Attendance & Leave Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Monitor workforce attendance, working patterns, and leave activity.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {lastUpdated && (
              <span className="text-xs font-medium text-slate-500 flex items-center">
                <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                Last updated {lastUpdated}
              </span>
            )}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center space-x-1.5 py-2 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} variant="card" className="h-28" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton variant="card" className="h-80" />
              <Skeleton variant="card" className="h-80" />
            </div>
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load attendance analytics"
            message={error}
            onRetry={() => fetchAnalytics(false)}
          />
        ) : analytics ? (
          <div className={`space-y-6 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
            {/* KPI Cards Row */}
            {(() => {
              const att = analytics.attendance || {};
              const lv = analytics.leave || {};

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <KpiCard
                    title="Attendance Rate"
                    value={`${att.attendanceRate || 0}%`}
                    subtitle="Present / On duty"
                    icon={CalendarCheck}
                    color="blue"
                  />
                  <KpiCard
                    title="Late Rate"
                    value={`${att.lateRate || 0}%`}
                    subtitle="Delayed check-ins"
                    icon={Clock}
                    color="amber"
                  />
                  <KpiCard
                    title="Absence Rate"
                    value={`${att.absenceRate || 0}%`}
                    subtitle="Unplanned absences"
                    icon={UserX}
                    color="red"
                  />
                  <KpiCard
                    title="Avg Working Hours"
                    value={`${att.averageWorkingHours || 0} hrs`}
                    subtitle="Per employee / day"
                    icon={Activity}
                    color="purple"
                  />
                  <KpiCard
                    title="Leave Rate"
                    value={`${lv.leaveRate || 0}%`}
                    subtitle="Approved employee leave"
                    icon={UserCheck}
                    color="emerald"
                  />
                </div>
              );
            })()}

            {/* Row 1: Attendance Health & Status Breakdown + Leave Request Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Health Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Attendance Health</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status Distribution
                  </span>
                </div>

                {(() => {
                  const sb = analytics.attendance?.statusBreakdown || {};
                  const total = (sb.present || 0) + (sb.late || 0) + (sb.halfDay || 0) + (sb.absent || 0);

                  if (total === 0) {
                    return <p className="text-xs text-slate-400 italic py-8 text-center">No attendance record status available.</p>;
                  }

                  const presentPct = total > 0 ? (((sb.present || 0) / total) * 100).toFixed(1) : 0;
                  const latePct = total > 0 ? (((sb.late || 0) / total) * 100).toFixed(1) : 0;
                  const halfDayPct = total > 0 ? (((sb.halfDay || 0) / total) * 100).toFixed(1) : 0;
                  const absentPct = total > 0 ? (((sb.absent || 0) / total) * 100).toFixed(1) : 0;

                  return (
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase">Present</span>
                          <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{sb.present || 0}</div>
                          <span className="text-[10px] font-semibold text-emerald-700">{presentPct}%</span>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <span className="text-[10px] font-bold text-amber-800 uppercase">Late</span>
                          <div className="text-xl font-extrabold text-amber-900 mt-0.5">{sb.late || 0}</div>
                          <span className="text-[10px] font-semibold text-amber-700">{latePct}%</span>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <span className="text-[10px] font-bold text-blue-800 uppercase">Half Day</span>
                          <div className="text-xl font-extrabold text-blue-900 mt-0.5">{sb.halfDay || 0}</div>
                          <span className="text-[10px] font-semibold text-blue-700">{halfDayPct}%</span>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                          <span className="text-[10px] font-bold text-red-800 uppercase">Absent</span>
                          <div className="text-xl font-extrabold text-red-900 mt-0.5">{sb.absent || 0}</div>
                          <span className="text-[10px] font-semibold text-red-700">{absentPct}%</span>
                        </div>
                      </div>

                      {/* Stacked Progress Visual */}
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                        <div style={{ width: `${presentPct}%` }} className="bg-emerald-500 h-full" title="Present" />
                        <div style={{ width: `${latePct}%` }} className="bg-amber-500 h-full" title="Late" />
                        <div style={{ width: `${halfDayPct}%` }} className="bg-blue-500 h-full" title="Half Day" />
                        <div style={{ width: `${absentPct}%` }} className="bg-red-500 h-full" title="Absent" />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Leave Request Queue */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Leave Request Queue</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Approval Pipeline
                  </span>
                </div>

                {(() => {
                  const lv = analytics.leave || {};
                  const pending = lv.pendingRequests || 0;
                  const approved = lv.approvedRequests || 0;
                  const rejected = lv.rejectedRequests || 0;

                  return (
                    <div className="space-y-3 pt-1">
                      {/* Actionable Pending Card */}
                      <div className={`p-4 rounded-xl border ${pending > 0 ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-200"} flex items-center justify-between`}>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-lg ${pending > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pending Approval</span>
                            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{pending}</div>
                          </div>
                        </div>
                        {pending > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                            NEEDS ACTION
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                            ALL CAUGHT UP
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-[11px] font-bold text-emerald-800 uppercase">Approved</span>
                            <div className="text-lg font-bold text-emerald-900">{approved}</div>
                          </div>
                        </div>

                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                          <div>
                            <span className="text-[11px] font-bold text-red-800 uppercase">Rejected</span>
                            <div className="text-lg font-bold text-red-900">{rejected}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Attendance Trend Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Attendance Rate Trend</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Historical Consistency
                </span>
              </div>

              {analytics.attendanceTrend && analytics.attendanceTrend.length > 0 ? (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.attendanceTrend} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tickLine={false}
                        axisLine={false}
                        stroke="#475569"
                        fontSize={11}
                      />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                      <Tooltip content={<LightChartTooltip unit="%" labelPrefix="Attendance Rate" />} />
                      <Area
                        type="monotone"
                        dataKey="attendanceRate"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#attGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-12 text-center">Attendance trend data is not available yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default AttendancePage;
