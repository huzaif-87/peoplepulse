import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getFinancialAnalytics } from "../services/analyticsService";
import KpiCard from "../components/dashboard/KpiCard";
import LightChartTooltip from "../components/dashboard/LightChartTooltip";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import { formatCurrency } from "../utils/formatCurrency";
import {
  DollarSign,
  Wallet,
  Gift,
  Award,
  Calendar,
  Building2,
  Clock,
  RefreshCw,
  TrendingUp
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

export const FinancialPage = () => {
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
      const response = await getFinancialAnalytics();
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
      console.error("Failed to load financial analytics:", err);
      setError("We couldn't retrieve the latest payroll & financial data.");
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

  const formatMonth = (monthStr) => {
    if (!monthStr) return "Latest Cycle";
    const parts = monthStr.split("-");
    if (parts.length === 2) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return monthStr;
  };

  const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8", "#1e40af"];

  return (
    <AppLayout title="Financial & Payroll Analytics">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Financial & Payroll Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Monitor payroll expenditure, compensation, benefits, and workforce cost.
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
            title="Unable to load financial analytics"
            message={error}
            onRetry={() => fetchAnalytics(false)}
          />
        ) : analytics ? (
          <div className={`space-y-6 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
            {/* KPI Cards Row */}
            {(() => {
              const fin = analytics.financial || {};

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <KpiCard
                    title="Monthly Payroll"
                    value={formatCurrency(fin.monthlyPayroll)}
                    subtitle="Total salary expenditure"
                    icon={DollarSign}
                    color="blue"
                  />
                  <KpiCard
                    title="Benefits Cost"
                    value={formatCurrency(fin.benefitsCost)}
                    subtitle="Health, insurance & perks"
                    icon={Gift}
                    color="purple"
                  />
                  <KpiCard
                    title="Bonus Cost"
                    value={formatCurrency(fin.bonusCost)}
                    subtitle="Performance incentives"
                    icon={Award}
                    color="amber"
                  />
                  <KpiCard
                    title="Avg Base Salary"
                    value={formatCurrency(fin.averageBaseSalary)}
                    subtitle="Per employee average"
                    icon={Wallet}
                    color="emerald"
                  />
                  <KpiCard
                    title="Latest Payroll Month"
                    value={formatMonth(fin.latestPayrollMonth)}
                    subtitle="Current reporting cycle"
                    icon={Calendar}
                    color="blue"
                  />
                </div>
              );
            })()}

            {/* Department Payroll Breakdown & Compensation Split Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Compensation Split Summary */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Compensation Split</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Cost Allocation
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-medium text-slate-500 uppercase">Monthly Payroll Cost</span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {formatCurrency(analytics.financial?.monthlyPayroll)}
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-900 flex items-center">
                      <Gift className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Benefits Cost
                    </span>
                    <span className="text-xs font-extrabold text-purple-950">
                      {formatCurrency(analytics.financial?.benefitsCost)}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-900 flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Bonus Cost
                    </span>
                    <span className="text-xs font-extrabold text-amber-950">
                      {formatCurrency(analytics.financial?.bonusCost)}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-900 flex items-center">
                      <Wallet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Avg Base Salary
                    </span>
                    <span className="text-xs font-extrabold text-emerald-950">
                      {formatCurrency(analytics.financial?.averageBaseSalary)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Payroll Bar Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Payroll Allocation by Department</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Click bar to filter
                  </span>
                </div>

                {analytics.payrollByDepartment && analytics.payrollByDepartment.length > 0 ? (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.payrollByDepartment}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <XAxis
                          type="number"
                          tickFormatter={(v) => formatCurrency(v)}
                          tickLine={false}
                          axisLine={false}
                          stroke="#94a3b8"
                          fontSize={11}
                        />
                        <YAxis
                          type="category"
                          dataKey="department"
                          tickLine={false}
                          axisLine={false}
                          stroke="#475569"
                          fontSize={12}
                          width={95}
                        />
                        <Tooltip content={<LightChartTooltip labelPrefix="Payroll Cost" valueFormatter={formatCurrency} />} />
                        <Bar
                          dataKey="payrollCost"
                          radius={[0, 4, 4, 0]}
                          className="cursor-pointer"
                          onClick={(entry) => handleDepartmentFilter(entry.department)}
                        >
                          {analytics.payrollByDepartment.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-12 text-center">No payroll data available yet.</p>
                )}
              </div>
            </div>

            {/* Payroll Trend Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Historical Payroll Cost Trend</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Monthly Expenditure
                </span>
              </div>

              {analytics.payrollTrend && analytics.payrollTrend.length > 0 ? (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.payrollTrend} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="finGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
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
                      <YAxis
                        tickFormatter={(v) => formatCurrency(v)}
                        tickLine={false}
                        axisLine={false}
                        stroke="#94a3b8"
                        fontSize={11}
                      />
                      <Tooltip content={<LightChartTooltip labelPrefix="Total Payroll" valueFormatter={formatCurrency} />} />
                      <Area
                        type="monotone"
                        dataKey="totalPayroll"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#finGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-12 text-center">Payroll trend data is not available yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default FinancialPage;
