import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PieChart,
  CalendarCheck,
  Award,
  DollarSign,
  UserCheck,
  X,
  Activity
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const mainNavItems = [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", path: "/employees", icon: Users }
  ];

  const intelligenceItems = [
    { label: "Headcount", path: "/headcount", icon: PieChart },
    { label: "Attendance", path: "/attendance", icon: CalendarCheck },
    { label: "Performance", path: "/performance", icon: Award },
    { label: "Financial", path: "/financial", icon: DollarSign },
    { label: "Retention", path: "/retention", icon: UserCheck }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-60 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">PeoplePulse</span>
        </div>
        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg focus:outline-hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Main Navigation */}
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* HR Intelligence Section */}
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            HR Intelligence
          </p>
          <nav className="space-y-1">
            {intelligenceItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        PeoplePulse v1.0 • Enterprise HR
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30 w-60">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
