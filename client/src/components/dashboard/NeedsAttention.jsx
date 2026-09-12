import React from "react";
import { AlertTriangle, CheckCircle2, Info, AlertCircle, Compass } from "lucide-react";

export const NeedsAttention = ({ insights = [] }) => {
  if (!insights || insights.length === 0) return null;

  const getStyleForType = (type) => {
    switch (type?.toLowerCase()) {
      case "warning":
      case "danger":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          badge: "bg-amber-100 text-amber-800"
        };
      case "positive":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          badge: "bg-emerald-100 text-emerald-800"
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-900",
          icon: <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
          badge: "bg-blue-100 text-blue-800"
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Needs Attention & Actionable Insights</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          HR Intelligence
        </span>
      </div>

      {/* Grid of Insight Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item, idx) => {
          const style = getStyleForType(item.type);

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${style.bg} flex items-start space-x-3 transition-shadow hover:shadow-2xs`}
            >
              {style.icon}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold truncate">{item.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${style.badge}`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NeedsAttention;
