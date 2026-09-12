import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getDashboardAnalytics } from "../services/analyticsService";
import KpiCard from "../components/dashboard/KpiCard";
import LightChartTooltip from "../components/dashboard/LightChartTooltip";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import { formatRating, formatPercent } from "../utils/formatCurrency";
import {
  Award,
  Star,
  Target,
  Zap,
  Users,
  MessageSquare,
  Building2,
  Clock,
  RefreshCw,
  TrendingUp,
  ExternalLink
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

export const PerformancePage = () => {
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
      console.error("Failed to load performance analytics:", err);
      setError("We couldn't retrieve the latest performance data.");
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

  const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8", "#1e40af"];

  return (
    <AppLayout title="Performance & Productivity">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Performance & Productivity
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Understand workforce performance, competencies, and goal completion.
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
            title="Unable to load performance analytics"
            message={error}
            onRetry={() => fetchAnalytics(false)}
          />
        ) : analytics ? (
          <div className={`space-y-6 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
            {/* KPI Row */}
            {(() => {
              const perf = analytics.performance || {};
              const overall = perf.averageOverallScore || 0;
              const prod = perf.averageProductivityScore || perf.productivity || 0;
              const team = perf.averageTeamworkScore || perf.teamwork || 0;
              const comm = perf.averageCommunicationScore || perf.communication || 0;
              const goals = perf.averageGoalsCompleted || perf.goalsCompleted || 0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <KpiCard
                    title="Overall Rating"
                    value={overall ? `${overall.toFixed(1)} / 5.0` : "0.0 / 5.0"}
                    subtitle="Organization average"
                    icon={Award}
                    color="blue"
                  />
                  <KpiCard
                    title="Productivity"
                    value={prod ? `${prod.toFixed(1)} / 5.0` : "0.0 / 5.0"}
                    subtitle="Execution & output"
                    icon={Zap}
                    color="purple"
                  />
                  <KpiCard
                    title="Teamwork"
                    value={team ? `${team.toFixed(1)} / 5.0` : "0.0 / 5.0"}
                    subtitle="Collaboration score"
                    icon={Users}
                    color="emerald"
                  />
                  <KpiCard
                    title="Communication"
                    value={comm ? `${comm.toFixed(1)} / 5.0` : "0.0 / 5.0"}
                    subtitle="Clarity & engagement"
                    icon={MessageSquare}
                    color="amber"
                  />
                  <KpiCard
                    title="Goals Completed"
                    value={formatPercent(goals)}
                    subtitle="Target attainment"
                    icon={Target}
                    color="blue"
                  />
                </div>
              );
            })()}

            {/* Performance Overview & Competencies Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Rating & Competencies */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-xs">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Overall Performance Rating
                  </span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-4xl font-extrabold text-white">
                      {analytics.performance?.averageOverallScore ? analytics.performance.averageOverallScore.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-slate-400 text-base font-semibold">/ 5.0</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-3 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(analytics.performance?.averageOverallScore || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Sub-competencies Breakdown */}
                <div className="space-y-2.5 text-xs pt-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Competency Benchmark</h4>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700 flex items-center">
                      <Zap className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Productivity
                    </span>
                    <span className="font-bold text-slate-900">{formatRating(analytics.performance?.averageProductivityScore)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700 flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Teamwork
                    </span>
                    <span className="font-bold text-slate-900">{formatRating(analytics.performance?.averageTeamworkScore)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700 flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Communication
                    </span>
                    <span className="font-bold text-slate-900">{formatRating(analytics.performance?.averageCommunicationScore)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="font-semibold text-blue-900 flex items-center">
                      <Target className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Goals Attainment
                    </span>
                    <span className="font-extrabold text-blue-700">{formatPercent(analytics.performance?.averageGoalsCompleted)}</span>
                  </div>
                </div>
              </div>

              {/* Department Performance Bar Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Performance by Department</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Click bar to filter
                  </span>
                </div>

                {analytics.performanceByDepartment && analytics.performanceByDepartment.length > 0 ? (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.performanceByDepartment}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <XAxis type="number" domain={[0, 5]} tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                        <YAxis
                          type="category"
                          dataKey="department"
                          tickLine={false}
                          axisLine={false}
                          stroke="#475569"
                          fontSize={12}
                          width={95}
                        />
                        <Tooltip content={<LightChartTooltip unit="/ 5.0" labelPrefix="Avg Score" />} />
                        <Bar
                          dataKey="averageScore"
                          radius={[0, 4, 4, 0]}
                          className="cursor-pointer"
                          onClick={(entry) => handleDepartmentFilter(entry.department)}
                        >
                          {analytics.performanceByDepartment.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-12 text-center">No performance data available yet.</p>
                )}
              </div>
            </div>

            {/* Performance Rating Distribution */}
            {analytics.performanceRatingDistribution && analytics.performanceRatingDistribution.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Rating Distribution Breakdown</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Performance Tiers
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {analytics.performanceRatingDistribution.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs font-bold text-slate-600">{item.category}</span>
                      <div className="text-2xl font-extrabold text-slate-900 mt-1">{item.count}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Reviews logged</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default PerformancePage;
