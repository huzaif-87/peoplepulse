import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { DollarSign, Wallet, Calendar } from "lucide-react";

export const FinancialOverview = ({ financial = {}, payrollByDepartment = [] }) => {
  const {
    latestPayrollMonth = "N/A",
    monthlyPayroll = 0,
    benefitsCost = 0,
    bonusCost = 0,
    averageBaseSalary = 0
  } = financial;

  // Format month string (e.g. "2026-02" -> "Feb 2026")
  const formattedMonth = latestPayrollMonth
    ? new Date(`${latestPayrollMonth}-01`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      })
    : "Latest Cycle";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Financial Overview</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {formattedMonth}
        </span>
      </div>

      {/* Grid: Financial KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly Payroll</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(monthlyPayroll)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Total salary expenditure</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Benefits Cost</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(benefitsCost)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Health, insurance, perks</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Bonus Cost</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(bonusCost)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Performance incentives</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Base Salary</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(averageBaseSalary)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Per employee average</p>
        </div>
      </div>

      {/* Department Payroll Distribution Progress list */}
      {payrollByDepartment && payrollByDepartment.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Payroll Allocation by Department
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {payrollByDepartment.slice(0, 6).map((item, idx) => {
              const dept = item._id || item.department || "Unknown";
              const cost = item.payrollCost || item.totalCost || item.monthlyCost || 0;

              return (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{dept}</span>
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(cost)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverview;
