import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Enterprise Banking-Style Session Constants
export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
export const INACTIVITY_WARNING_MS = 14 * 60 * 1000; // 14 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem("peoplepulse_token") || null);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastActivityTimeRef = useRef(Date.now());

  // Clear session state
  const clearSessionState = useCallback((message = null) => {
    sessionStorage.removeItem("peoplepulse_token");
    localStorage.removeItem("peoplepulse_token");
    setToken(null);
    setUser(null);
    setShowWarningModal(false);
    if (message) {
      setSessionExpiredMessage(message);
    }
  }, []);

  // Cancel running timers
  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  // Handle inactivity timeout expiration
  const handleInactivityTimeout = useCallback(() => {
    clearTimers();
    clearSessionState("Your session expired due to inactivity. Please sign in again.");
  }, [clearTimers, clearSessionState]);

  // Handle inactivity warning display (at 14 mins)
  const handleInactivityWarning = useCallback(() => {
    setShowWarningModal(true);
  }, []);

  // Reset inactivity timers
  const resetInactivityTimers = useCallback(() => {
    if (!sessionStorage.getItem("peoplepulse_token")) return;

    lastActivityTimeRef.current = Date.now();
    setShowWarningModal(false);
    clearTimers();

    // Set 14-minute warning timer
    warningTimerRef.current = setTimeout(handleInactivityWarning, INACTIVITY_WARNING_MS);

    // Set 15-minute expiration timer
    inactivityTimerRef.current = setTimeout(handleInactivityTimeout, INACTIVITY_TIMEOUT_MS);
  }, [clearTimers, handleInactivityWarning, handleInactivityTimeout]);

  // Throttled user activity handler
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    // Throttle activity resets to at most once per 1.5 seconds for performance
    if (now - lastActivityTimeRef.current > 1500) {
      resetInactivityTimers();
    }
  }, [resetInactivityTimers]);

  // Setup user activity listeners when authenticated
  useEffect(() => {
    if (!user || !token) return;

    resetInactivityTimers();

    const activityEvents = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearTimers();
    };
  }, [user, token, handleUserActivity, resetInactivityTimers, clearTimers]);

  // Listen to global 401 unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorizedEvent = () => {
      clearTimers();
      clearSessionState("Your session expired. Please sign in again.");
    };

    window.addEventListener("peoplepulse:unauthorized", handleUnauthorizedEvent);
    return () => {
      window.removeEventListener("peoplepulse:unauthorized", handleUnauthorizedEvent);
    };
  }, [clearTimers, clearSessionState]);

  // Restore authenticated user state on page refresh using sessionStorage
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = sessionStorage.getItem("peoplepulse_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (response.data && response.data.data && response.data.data.user) {
          setUser(response.data.data.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.error("Auth restoration failed:", err.message);
        clearSessionState("Your session has expired. Please sign in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [clearSessionState]);

  // Login handler
  const login = async (email, password) => {
    setSessionExpiredMessage(null);
    const response = await api.post("/auth/login", { email, password });
    if (response.data && response.data.data) {
      const { user: loggedInUser, token: receivedToken } = response.data.data;
      sessionStorage.setItem("peoplepulse_token", receivedToken);
      // Clean up legacy localStorage item
      localStorage.removeItem("peoplepulse_token");
      setToken(receivedToken);
      setUser(loggedInUser);
      resetInactivityTimers();
      return loggedInUser;
    }
  };

  // Logout handler
  const logout = () => {
    clearTimers();
    clearSessionState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        sessionExpiredMessage,
        setSessionExpiredMessage,
        login,
        logout,
        resetInactivityTimers
      }}
    >
      {children}

      {/* Subtle Session Timeout Warning Modal */}
      {showWarningModal && user && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-4 max-w-md animate-bounce">
          <div className="text-xs space-y-1 flex-1">
            <p className="font-bold text-amber-400">Session Warning</p>
            <p className="text-slate-300">
              Your session will expire soon due to inactivity.
            </p>
          </div>
          <button
            onClick={resetInactivityTimers}
            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Stay signed in
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
