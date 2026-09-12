import React from "react";
import { History, UserCheck, UserMinus, ArrowUpRight, Repeat } from "lucide-react";

export const RecentEmploymentEvents = ({ recentEmploymentEvents = [] }) => {
  const getEventBadge = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case "joined":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3 mr-1" />
            Joined
          </span>
        );
      case "resigned":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <UserMinus className="w-3 h-3 mr-1" />
            Resigned
          </span>
        );
      case "promoted":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Promoted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Repeat className="w-3 h-3 mr-1" />
            {eventType || "Event"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Recent Employment Events</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Activity Log
        </span>
      </div>

      {/* Events Table / Timeline */}
      {recentEmploymentEvents && recentEmploymentEvents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Employee</th>
                <th className="pb-2.5 font-bold">Event</th>
                <th className="pb-2.5 font-bold">Department</th>
                <th className="pb-2.5 font-bold">Date</th>
                <th className="pb-2.5 font-bold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentEmploymentEvents.map((evt, idx) => {
                const name = (evt.firstName && evt.lastName)
                  ? `${evt.firstName} ${evt.lastName}`
                  : (evt.employeeName || evt.name || evt.employeeId || "Employee");
                const rawDate = evt.eventDate || evt.date;
                const dateStr = rawDate
                  ? new Date(rawDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  : "N/A";

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900 whitespace-nowrap">{name}</td>
                    <td className="py-3 whitespace-nowrap">{getEventBadge(evt.eventType)}</td>
                    <td className="py-3 text-slate-600 font-medium whitespace-nowrap">
                      {evt.department || "N/A"}
                    </td>
                    <td className="py-3 text-slate-500 font-mono whitespace-nowrap">{dateStr}</td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">{evt.reason || "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-4">No recent employment events.</p>
      )}
    </div>
  );
};

export default RecentEmploymentEvents;
