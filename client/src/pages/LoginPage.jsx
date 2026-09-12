import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export const LoginPage = () => {
  const { login, isAuthenticated, sessionExpiredMessage, setSessionExpiredMessage } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to /dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (setSessionExpiredMessage) setSessionExpiredMessage(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      const msg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Invalid email or password";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeNotice = error || sessionExpiredMessage;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Branding & Product Proposition */}
        <div className="bg-slate-950 p-8 lg:p-12 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                PeoplePulse
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-4">
              Intelligent Employee Management & HR Analytics
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Streamline employee administration, headcount analytics, attendance tracking, and financial intelligence in one unified platform.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role-Based Access Control (HR & Admin)</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Consolidated Workforce Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="p-8 lg:p-12 bg-white flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Sign in to your account</h3>
            <p className="text-sm text-slate-500">
              Enter your credentials to access PeoplePulse HR Portal.
            </p>
          </div>

          {activeNotice && (
            <div className={`mb-6 p-3.5 rounded-lg flex items-start space-x-3 text-sm ${
              error
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-amber-50 border border-amber-200 text-amber-800"
            }`}>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{activeNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setError("");
                    setEmail(e.target.value);
                  }}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setError("");
                    setPassword(e.target.value);
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Need access? Contact your administrator or HR operations team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
