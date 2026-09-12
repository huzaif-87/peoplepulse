import React from "react";
import { Inbox } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No records found",
  message = "Try adjusting your search criteria or clearing filters.",
  action
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
