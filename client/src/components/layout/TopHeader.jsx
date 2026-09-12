import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardAnalytics } from "../../services/analyticsService";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  X,
  FileText,
  AlertTriangle,
  Award,
  History,
  ChevronRight
} from "lucide-react";

export const TopHeader = ({ title = "Dashboard", onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  // Fetch real actionable notifications derived from system data
  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await getDashboardAnalytics();
        if (response && response.success && response.data && isMounted) {
          const data = response.data;
          const items = [];

          // 1. Pending Leave Requests
          if (data.leave?.pendingRequests > 0) {
            items.push({
              id: "leave-pending",
              title: "Pending Leave Requests",
              message: `${data.leave.pendingRequests} leave requests awaiting HR review`,
              actionText: "Review requests",
              path: "/attendance",
              icon: FileText,
              color: "text-amber-600 bg-amber-50 border-amber-200"
            });
          }

          // 2. Turnover Hotspot
          if (data.turnoverByDepartment?.length > 0 && data.turnoverByDepartment[0].resignations > 0) {
            const top = data.turnoverByDepartment[0];
            items.push({
              id: "turnover-hotspot",
              title: "Turnover Alert",
              message: `${top.department} department recorded ${top.resignations} resignations`,
              actionText: "View retention",
              path: "/retention",
              icon: AlertTriangle,
              color: "text-red-600 bg-red-50 border-red-200"
            });
          }

          // 3. Recent Employment Activity
          if (data.recentEmploymentEvents?.length > 0) {
            items.push({
              id: "recent-events",
              title: "Employment Events",
              message: `${data.recentEmploymentEvents.length} recent activity logs available`,
              actionText: "View activity",
              path: "/retention",
              icon: History,
              color: "text-blue-600 bg-blue-50 border-blue-200"
            });
          }

          // 4. Strong Performance Indicator
          if (data.performance?.averageOverallScore > 0) {
            items.push({
              id: "perf-summary",
              title: "Performance Intelligence",
              message: `Overall rating currently at ${data.performance.averageOverallScore} / 5.0`,
              actionText: "View performance",
              path: "/performance",
              icon: Award,
              color: "text-emerald-600 bg-emerald-50 border-emerald-200"
            });
          }

          setNotifications(items);
          if (items.length > 0) {
            setHasUnread(true);
          }
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle click outside and Escape key to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = headerSearchQuery.trim();
    if (trimmed) {
      navigate(`/employees?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/employees");
    }
  };

  const handleClearHeaderSearch = () => {
    setHeaderSearchQuery("");
  };

  const handleNotificationClick = (path) => {
    setShowNotifications(false);
    setHasUnread(false);
    if (path) {
      navigate(path);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      {/* Left Area: Mobile Menu Button & Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
        </div>
      </div>

      {/* Right Area: Global Search Input, Notifications, Profile & Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Global TopHeader Search Form */}
        <form onSubmit={handleHeaderSearchSubmit} className="hidden lg:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={headerSearchQuery}
            onChange={(e) => setHeaderSearchQuery(e.target.value)}
            placeholder="Search employees..."
            aria-label="Global employee search"
            className="pl-9 pr-8 py-1.5 bg-slate-100 border border-slate-200 rounded-lg w-64 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
          />
          {headerSearchQuery && (
            <button
              type="button"
              onClick={handleClearHeaderSearch}
              aria-label="Clear global search"
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Notification Bell with Popover Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnread(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5" />
            {hasUnread && notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-900">Actionable Notifications</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {notifications.length} Alerts
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((item) => {
                    const IconComp = item.icon || Bell;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item.path)}
                        className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 group"
                      >
                        <div className={`p-2 rounded-lg border shrink-0 ${item.color}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-semibold text-blue-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.actionText} <ChevronRight className="w-3 h-3 ml-0.5" />
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.message}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    No new notifications
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Info & Avatar */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-xs shadow-xs">
            {user && user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none mb-1">
              {user ? user.name : "HR User"}
            </div>
            <div className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 inline-block px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              {user ? user.role : "HR"}
            </div>
          </div>
          {/* Logout Action */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
