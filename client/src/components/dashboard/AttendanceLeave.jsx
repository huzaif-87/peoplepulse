import React from "react";
import { formatPercent } from "../../utils/formatCurrency";
import { CalendarCheck, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

export const AttendanceLeave = ({ attendance = {}, leave = {} }) => {
  const {
    attendanceRate = 0,
    lateRate = 0,
    absenceRate = 0,
    averageWorkingHours = 0
  } = attendance;

  const {
    leaveRate = 0,
    pendingRequests = 0,
    approvedRequests = 0,
    rejectedRequests = 0
  } = leave;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Attendance & Leave</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Workforce Operations
        </span>
      </div>

      {/* Grid: Attendance Metrics & Actionable Leave Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Attendance Summary */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Attendance Health
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Attendance Rate</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {formatPercent(attendanceRate)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Hours / Day</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-center">
                <Clock className="w-4 h-4 text-blue-600 mr-1" />
                {averageWorkingHours ? `${averageWorkingHours.toFixed(1)}h` : "0h"}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Late Rate</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">
                {formatPercent(lateRate)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Absence Rate</span>
              <div className="text-lg font-bold text-red-600 mt-0.5">
                {formatPercent(absenceRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests (Actionable Pending Requests Highlight) */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Leave Requests & Queue
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              Leave Rate: {formatPercent(leaveRate)}
            </span>
          </div>

          {/* Actionable Pending Requests Treatment */}
          {pendingRequests > 0 ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-amber-900">
                    {pendingRequests} Pending
                  </div>
                  <p className="text-xs text-amber-700 font-medium">
                    Requests awaiting HR approval
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold uppercase rounded-full tracking-wider">
                Needs Action
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-emerald-900">
                    All caught up
                  </div>
                  <p className="text-xs text-emerald-700 font-medium">
                    No pending leave requests
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-bold uppercase rounded-full tracking-wider">
                Clean Queue
              </span>
            </div>
          )}

          {/* Approved vs Rejected Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Approved</span>
                <div className="text-base font-bold text-slate-900">{approvedRequests}</div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Rejected</span>
                <div className="text-base font-bold text-slate-900">{rejectedRequests}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLeave;
