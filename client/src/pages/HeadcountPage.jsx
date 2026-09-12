import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getHeadcountAnalytics } from "../services/analyticsService";
import KpiCard from "../components/dashboard/KpiCard";
import { CustomChartTooltip } from "../components/dashboard/CustomChartTooltip";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import {
  Users,
  UserCheck,
  CalendarCheck,
  UserMinus,
  UserPlus,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  RefreshCw,
  ExternalLink,
  PieChart
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from "recharts";

export const HeadcountPage = () => {
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
      const response = await getHeadcountAnalytics();
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
      console.error("Failed to load headcount analytics:", err);
      setError("We couldn't retrieve the latest headcount data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Navigation Drill-down handlers
  const handleDepartmentFilter = (dept) => {
    if (dept) {
      navigate(`/employees?department=${encodeURIComponent(dept)}`);
    }
  };

  const handleLocationFilter = (loc) => {
    if (loc) {
      navigate(`/employees?location=${encodeURIComponent(loc)}`);
    }
  };

  const handleEmploymentTypeFilter = (type) => {
    if (type) {
      navigate(`/employees?employmentType=${encodeURIComponent(type)}`);
    }
  };

  const handleJoiningYearFilter = (year) => {
    if (year) {
      navigate(`/employees?joiningYear=${year}`);
    }
  };

  // Month names formatter for hiring trend chart
  const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const parts = monthStr.split("-");
    if (parts.length === 2) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return date.toLocaleDateString("en-US", { month: "short" });
    }
    return monthStr;
  };

  const deptColors = [
    "#2563eb",
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#1d4ed8",
    "#1e40af",
    "#3e82f7"
  ];

  return (
    <AppLayout title="Headcount Analytics">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Headcount Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Understand workforce size, distribution, and growth across the organization.
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

        {/* View Handling: Loading, Error, or Analytics */}
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
            title="Unable to load headcount analytics"
            message={error}
            onRetry={() => fetchAnalytics(false)}
          />
        ) : analytics ? (
          <div className={`space-y-6 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
            {/* KPI Cards Row */}
            {(() => {
              const hc = analytics.headcount || {};
              const total = hc.total || 0;
              const active = hc.active || 0;
              const onLeave = hc.onLeave || 0;
              const inactive = hc.inactive || 0;
              const newHires = hc.newHires || 0;

              const activePct = total > 0 ? ((active / total) * 100).toFixed(1) : 0;
              const leavePct = total > 0 ? ((onLeave / total) * 100).toFixed(1) : 0;
              const inactivePct = total > 0 ? ((inactive / total) * 100).toFixed(1) : 0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <KpiCard
                    title="Total Employees"
                    value={total}
                    subtitle="Current workforce"
                    icon={Users}
                    color="blue"
                  />
                  <KpiCard
                    title="Active Employees"
                    value={active}
                    subtitle={`${activePct}% of workforce`}
                    icon={UserCheck}
                    color="emerald"
                  />
                  <KpiCard
                    title="On Leave"
                    value={onLeave}
                    subtitle={`${leavePct}% of workforce`}
                    icon={CalendarCheck}
                    color="amber"
                  />
                  <KpiCard
                    title="Inactive Employees"
                    value={inactive}
                    subtitle={`${inactivePct}% of workforce`}
                    icon={UserMinus}
                    color="red"
                  />
                  <KpiCard
                    title="New Hires"
                    value={newHires}
                    subtitle="This calendar year"
                    icon={UserPlus}
                    color="purple"
                  />
                </div>
              );
            })()}

            {/* Department & Location Breakdown Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Employees by Department</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Click bar to filter
                  </span>
                </div>

                {analytics.departmentDistribution && analytics.departmentDistribution.length > 0 ? (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.departmentDistribution}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <XAxis type="number" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                        <YAxis
                          type="category"
                          dataKey="department"
                          tickLine={false}
                          axisLine={false}
                          stroke="#475569"
                          fontSize={12}
                          width={95}
                        />
                        <Tooltip content={<CustomChartTooltip unit="Employees" labelPrefix="Count" />} />
                        <Bar
                          dataKey="count"
                          radius={[0, 4, 4, 0]}
                          className="cursor-pointer"
                          onClick={(entry) => handleDepartmentFilter(entry.department)}
                        >
                          {analytics.departmentDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={deptColors[index % deptColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No department data available.</p>
                )}
              </div>

              {/* Location Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Employees by Location</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Geographic Footprint
                  </span>
                </div>

                {analytics.locationDistribution && analytics.locationDistribution.length > 0 ? (
                  <div className="space-y-3.5 pt-1 max-h-72 overflow-y-auto pr-1">
                    {analytics.locationDistribution.map((item, idx) => {
                      const total = analytics.headcount?.total || 1;
                      const pct = ((item.count / total) * 100).toFixed(1);

                      return (
                        <div
                          key={idx}
                          onClick={() => handleLocationFilter(item.location)}
                          className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/40 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 flex items-center">
                              {item.location}
                              <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                            </span>
                            <div className="text-xs font-semibold text-slate-600">
                              <span className="font-bold text-slate-900">{item.count}</span>{" "}
                              <span className="text-slate-400 text-[11px]">({pct}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No location data available.</p>
                )}
              </div>
            </div>

            {/* Employment Type & Joining Year Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employment Type Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Employment Type Distribution</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Workforce Mix
                  </span>
                </div>

                {analytics.employmentTypeDistribution && analytics.employmentTypeDistribution.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {analytics.employmentTypeDistribution.map((item, idx) => {
                      const total = analytics.headcount?.total || 1;
                      const pct = ((item.count / total) * 100).toFixed(1);

                      return (
                        <div
                          key={idx}
                          onClick={() => handleEmploymentTypeFilter(item.employmentType)}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 flex items-center">
                              {item.employmentType}
                              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {pct}%
                            </span>
                          </div>
                          <div className="text-2xl font-extrabold text-slate-900 mt-2">
                            {item.count}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Employees</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No employment type data available.</p>
                )}
              </div>

              {/* Joining Year Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Employees by Joining Year</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Tenure Distribution
                  </span>
                </div>

                {analytics.joiningYearDistribution && analytics.joiningYearDistribution.length > 0 ? (
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.joiningYearDistribution}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <XAxis dataKey="year" tickLine={false} axisLine={false} stroke="#475569" fontSize={11} />
                        <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                        <Tooltip content={<CustomChartTooltip unit="Employees Joined" labelPrefix="Hires" />} />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          className="cursor-pointer"
                          onClick={(entry) => handleJoiningYearFilter(entry.year)}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No tenure history available.</p>
                )}
              </div>
            </div>

            {/* Workforce Growth Chart Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Workforce Growth (Hiring Trend)</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Current Calendar Year
                </span>
              </div>

              {(() => {
                const hiringData = (analytics.hiringTrend || []).map((item) => ({
                  month: formatMonth(item.period),
                  hires: item.count || 0
                }));

                const totalHires = hiringData.reduce((acc, cur) => acc + cur.hires, 0);

                if (totalHires === 0) {
                  return (
                    <div className="py-12 text-center space-y-2">
                      <PieChart className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-600">No hiring activity recorded for this year.</p>
                      <p className="text-xs text-slate-400">Workforce growth records will appear here as new employees are onboarded.</p>
                    </div>
                  );
                }

                return (
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hiringData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#475569" fontSize={11} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                        <Tooltip content={<CustomChartTooltip unit="New Hires" labelPrefix="Joined" />} />
                        <Area
                          type="monotone"
                          dataKey="hires"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#growthGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default HeadcountPage;
