import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../components/layout/AppLayout";
import { getDashboardAnalytics } from "../services/analyticsService";
import KpiCard from "../components/dashboard/KpiCard";
import WorkforceDistribution from "../components/dashboard/WorkforceDistribution";
import HiringTrend from "../components/dashboard/HiringTrend";
import AttendanceLeave from "../components/dashboard/AttendanceLeave";
import PerformanceOverview from "../components/dashboard/PerformanceOverview";
import FinancialOverview from "../components/dashboard/FinancialOverview";
import RetentionOverview from "../components/dashboard/RetentionOverview";
import RecentEmploymentEvents from "../components/dashboard/RecentEmploymentEvents";
import NeedsAttention from "../components/dashboard/NeedsAttention";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import { formatPercent } from "../utils/formatCurrency";
import { Users, UserCheck, CalendarCheck, UserPlus, TrendingDown, RefreshCw, Clock } from "lucide-react";

export const DashboardPage = () => {
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
      console.error("Failed to load dashboard analytics:", err);
      setError("We couldn't retrieve the latest workforce data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <AppLayout title="Executive Overview">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Viewport Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Understand workforce health, performance, attendance, and retention at a glance.
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

        {/* Content handling: Loading, Error, or Analytics View */}
        {loading ? (
          /* Initial Load Skeletons */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} variant="card" className="h-28" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton variant="card" className="h-72" />
              <Skeleton variant="card" className="h-72" />
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <ErrorState
            title="Unable to load workforce analytics"
            message={error}
            onRetry={() => fetchAnalytics(false)}
          />
        ) : analytics ? (
          /* Real Analytics Data Dashboard */
          <div className={`space-y-6 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
            {/* Top KPI Row */}
            {(() => {
              const hc = analytics.headcount || {};
              const ret = analytics.retention || {};
              const total = hc.total || 0;
              const active = hc.active || 0;
              const onLeave = hc.onLeave || 0;
              const newHires = hc.newHires || 0;
              const turnoverRate = ret.turnoverRate || 0;

              const activePct = total > 0 ? ((active / total) * 100).toFixed(0) : 0;
              const leavePct = total > 0 ? ((onLeave / total) * 100).toFixed(1) : 0;

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
                    subtitle={`${leavePct}% currently on leave`}
                    icon={CalendarCheck}
                    color="amber"
                  />
                  <KpiCard
                    title="New Hires"
                    value={newHires}
                    subtitle="This calendar year"
                    icon={UserPlus}
                    color="purple"
                  />
                  <KpiCard
                    title="Turnover Rate"
                    value={formatPercent(turnoverRate)}
                    subtitle="Annualized turnover"
                    icon={TrendingDown}
                    color={turnoverRate > 15 ? "red" : "blue"}
                  />
                </div>
              );
            })()}

            {/* Row 1: Workforce Distribution + Hiring Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WorkforceDistribution
                departmentDistribution={analytics.departmentDistribution || []}
                locationDistribution={analytics.locationDistribution || []}
              />
              <HiringTrend hiringTrend={analytics.hiringTrend || []} />
            </div>

            {/* Row 2: Attendance & Leave + Performance & Productivity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceLeave
                attendance={analytics.attendance || {}}
                leave={analytics.leave || {}}
              />
              <PerformanceOverview
                performance={analytics.performance || {}}
                performanceByDepartment={analytics.performanceByDepartment || []}
              />
            </div>

            {/* Row 3: Financial Overview + Retention & Turnover */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialOverview
                financial={analytics.financial || {}}
                payrollByDepartment={analytics.payrollByDepartment || []}
              />
              <RetentionOverview
                retention={analytics.retention || {}}
                turnoverByDepartment={analytics.turnoverByDepartment || []}
              />
            </div>

            {/* Row 4: Recent Employment Events */}
            <RecentEmploymentEvents
              recentEmploymentEvents={analytics.recentEmploymentEvents || []}
            />

            {/* Row 5: Actionable Insights / Needs Attention */}
            <NeedsAttention insights={analytics.insights || []} />
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
