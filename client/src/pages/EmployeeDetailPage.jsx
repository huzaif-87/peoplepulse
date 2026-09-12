import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import {
  getEmployee,
  updateEmployeeStatus,
  deleteEmployee
} from "../services/employeeService";
import { StatusBadge } from "../components/common/StatusBadge";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import {
  ArrowLeft,
  Edit,
  UserX,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Hash,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X
} from "lucide-react";

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Status & Deactivation Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(
    locationState?.message || null
  );

  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEmployee(id);
      if (response && response.success && response.data) {
        setEmployee(response.data);
        setSelectedStatus(response.data.status || "Active");
      }
    } catch (err) {
      console.error("Failed to fetch employee details:", err);
      if (err.response && err.response.status === 404) {
        setError("NOT_FOUND");
      } else {
        setError("Unable to load employee profile.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  // Handle status update submit
  const handleStatusUpdate = async () => {
    if (!employee || selectedStatus === employee.status) {
      setShowStatusModal(false);
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const response = await updateEmployeeStatus(employee._id, selectedStatus);
      if (response && response.success && response.data) {
        setEmployee(response.data);
        setFeedbackMessage(`Status updated to "${selectedStatus}" successfully.`);
        setShowStatusModal(false);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setActionError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to update employee status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle soft delete / deactivation submit
  const handleDeactivate = async () => {
    if (!employee) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const response = await deleteEmployee(employee._id);
      if (response && response.success && response.data) {
        setEmployee(response.data);
        setFeedbackMessage("Employee has been deactivated successfully.");
        setShowDeactivateModal(false);
      }
    } catch (err) {
      console.error("Failed to deactivate employee:", err);
      setActionError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to deactivate employee."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Employee Profile">
        <div className="space-y-6 max-w-5xl mx-auto">
          <Skeleton variant="text" className="w-32 h-5" />
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center space-x-4">
            <Skeleton variant="avatar" className="w-16 h-16 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="w-1/3 h-6" />
              <Skeleton variant="text" className="w-1/4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="card" className="h-40" />
            <Skeleton variant="card" className="h-40" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error === "NOT_FOUND") {
    return (
      <AppLayout title="Employee Not Found">
        <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-xl border border-slate-200 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Employee not found</h2>
          <p className="text-slate-500 text-sm">
            The employee you're looking for doesn't exist or is no longer available in the system.
          </p>
          <div className="pt-2">
            <Link
              to="/employees"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Error Profile">
        <div className="max-w-2xl mx-auto my-8">
          <ErrorState
            title="Unable to load employee profile"
            message={error}
            onRetry={fetchEmployeeData}
          />
        </div>
      </AppLayout>
    );
  }

  const {
    _id,
    employeeId,
    firstName = "",
    lastName = "",
    designation = "",
    department = "",
    status = "Active",
    email = "",
    phone = "",
    location = "",
    employmentType = "",
    joiningDate,
    manager = "",
    avatar = "",
    skills = []
  } = employee;

  const fullName = `${firstName} ${lastName}`.trim() || "Unnamed Employee";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "EP";

  const formattedJoiningDate = joiningDate
    ? new Date(joiningDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

  return (
    <AppLayout title={`${fullName} - Profile`}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Success Feedback Banner */}
        {feedbackMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-sm shadow-2xs">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Back Link */}
        <div>
          <Link
            to="/employees"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Employees
          </Link>
        </div>

        {/* Hero Card: Identity, Avatar & Primary Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              {avatar && !imgError ? (
                <img
                  src={avatar}
                  alt={fullName}
                  onError={() => setImgError(true)}
                  className="w-20 h-20 rounded-full object-cover border border-slate-200 bg-slate-100 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-xs">
                  {initials}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {fullName}
                </h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm font-semibold text-slate-600">{designation}</p>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{department}</span>
                <span>•</span>
                <span className="font-mono text-slate-600">{employeeId}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/employees/${_id}/edit`}
              className="inline-flex items-center space-x-1.5 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Employee</span>
            </Link>

            <button
              onClick={() => {
                setSelectedStatus(status);
                setShowStatusModal(true);
              }}
              className="inline-flex items-center space-x-1.5 py-2 px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Status</span>
            </button>

            {status !== "Inactive" && (
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="inline-flex items-center space-x-1.5 py-2 px-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5 text-red-600" />
                <span>Deactivate</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Overview & Contact Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Contact & Overview</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email Address</span>
                <span className="font-medium text-slate-900 select-all">{email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="font-medium text-slate-900">{phone || "Not provided"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-900 flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {location}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={status} />
              </div>
            </div>
          </div>

          {/* Section 2: Work & Employment Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Work & Employment</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-mono font-semibold text-slate-900">{employeeId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-900">{department}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Employment Type</span>
                <span className="font-medium text-slate-900">{employmentType}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Joining Date</span>
                <span className="font-medium text-slate-900 flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {formattedJoiningDate}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reporting Manager</span>
                <span className="font-medium text-slate-900">{manager || "Not assigned"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Skills & Competencies */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Skills & Competencies
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {skills && skills.length > 0 ? (
              skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No skills listed for this employee.</p>
            )}
          </div>
        </div>
      </div>

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <RefreshCw className="w-4 h-4 text-blue-600 mr-2" />
                Change Employee Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {actionError}
              </div>
            )}

            <div className="space-y-3 py-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select New Status
              </label>
              {["Active", "On Leave", "Inactive"].map((s) => (
                <label
                  key={s}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                    selectedStatus === s
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status-radio"
                      value={s}
                      checked={selectedStatus === s}
                      onChange={() => setSelectedStatus(s)}
                      className="text-blue-600 focus:ring-blue-600"
                    />
                    <span>{s}</span>
                  </div>
                  <StatusBadge status={s} />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs flex items-center space-x-1.5"
              >
                {actionLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Status</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Deactivate this employee?
                </h3>
                <p className="text-xs text-slate-500">
                  {fullName} ({employeeId})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              The employee will remain in the system for historical records but will be marked as <strong>Inactive</strong>.
            </p>

            {actionError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs flex items-center space-x-1.5"
              >
                {actionLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Deactivating...</span>
                  </>
                ) : (
                  <span>Deactivate Employee</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default EmployeeDetailPage;
