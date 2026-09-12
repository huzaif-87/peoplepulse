import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getDashboardAnalytics } from "../services/analyticsService";
import KpiCard from "../components/dashboard/KpiCard";
import LightChartTooltip from "../components/dashboard/LightChartTooltip";
import RecentEmploymentEvents from "../components/dashboard/RecentEmploymentEvents";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import { formatPercent } from "../utils/formatCurrency";
import {
  UserCheck,
  UserMinus,
  UserPlus,
  Building2,
  Clock,
  RefreshCw,
  TrendingDown,
  History,
  Activity
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export const RetentionPage = () => {
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
      console.error("Failed to load retention analytics:", err);
      setError("We couldn't retrieve the latest retention & turnover data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDepartmentFilter = (dept) => {
    if (dept) {
      navigate(`/employees?department=${encodeURIComponent(dept)}`);
    }
  };

  const chartData = (analytics?.turnoverByDepartment || [])
    .map((item) => ({
      department: item._id || item.department || "Unknown",
      count: item.resignations !== undefined ? item.resignations : (item.count || 0)
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <AppLayout title="Retention & Turnover">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Retention & Turnover
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Understand workforce stability, employee turnover, and resignation patterns.
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
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
            title="Unable to load retention analytics"
            message={error}
            onRetry={() => fetchAnalytics(false)}
          />
        ) : analytics ? (
          <div className={`space-y-6 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
            {/* KPI Cards Row */}
            {(() => {
              const ret = analytics.retention || {};
              const turnoverRate = ret.turnoverRate || 0;
              const resignations = ret.resignations || 0;
              const newJoiners = ret.newJoiners || 0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <KpiCard
                    title="Turnover Rate"
                    value={formatPercent(turnoverRate)}
                    subtitle="Annualized turnover rate"
                    icon={TrendingDown}
                    color={turnoverRate > 15 ? "red" : "blue"}
                  />
                  <KpiCard
                    title="Resignations"
                    value={resignations}
                    subtitle="Departures in current year"
                    icon={UserMinus}
                    color="red"
                  />
                  <KpiCard
                    title="New Joiners"
                    value={newJoiners}
                    subtitle="Onboarded in current year"
                    icon={UserPlus}
                    color="emerald"
                  />
                </div>
              );
            })()}

            {/* Department Turnover Bar Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Turnover Metric Overview */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Retention Summary</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Stability
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-medium text-slate-500 uppercase">Turnover Rate</span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">
                      {formatPercent(analytics.retention?.turnoverRate)}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Annualized employee turnover ratio</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <span className="text-[11px] font-bold text-red-800 uppercase flex items-center">
                        <UserMinus className="w-3.5 h-3.5 mr-1" /> Resignations
                      </span>
                      <div className="text-xl font-bold text-red-950 mt-1">
                        {analytics.retention?.resignations || 0}
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center">
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> New Joiners
                      </span>
                      <div className="text-xl font-bold text-emerald-950 mt-1">
                        {analytics.retention?.newJoiners || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Resignations Bar Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Resignations by Department</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Click bar to filter
                  </span>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                        <YAxis type="category" dataKey="department" tickLine={false} axisLine={false} stroke="#475569" fontSize={12} width={95} />
                        <Tooltip content={<LightChartTooltip unit="Resignations" labelPrefix="Departures" />} />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[0, 4, 4, 0]}
                          className="cursor-pointer"
                          onClick={(entry) => handleDepartmentFilter(entry.department)}
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#ef4444" : "#3b82f6"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-12 text-center">No resignations recorded for the selected period.</p>
                )}
              </div>
            </div>

            {/* Recent Employment History Log Component */}
            <RecentEmploymentEvents recentEmploymentEvents={analytics.recentEmploymentEvents || []} />
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default RetentionPage;
