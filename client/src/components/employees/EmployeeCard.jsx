import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../common/StatusBadge";
import { MapPin, Briefcase, Calendar, Hash, ArrowRight } from "lucide-react";

export const EmployeeCard = ({ employee }) => {
  const [imgError, setImgError] = useState(false);

  if (!employee) return null;

  const {
    _id,
    employeeId,
    firstName = "",
    lastName = "",
    designation = "",
    department = "",
    status = "Active",
    location = "",
    employmentType = "",
    joiningDate,
    avatar
  } = employee;

  const fullName = `${firstName} ${lastName}`.trim() || "Unnamed Employee";

  // Generate fallback initials
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "EP";

  // Format joining date cleanly (e.g. "Mar 15, 2024")
  const formattedJoiningDate = joiningDate
    ? new Date(joiningDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header: Avatar, Name, Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Avatar with fallback */}
            <div className="relative shrink-0">
              {avatar && !imgError ? (
                <img
                  src={avatar}
                  alt={fullName}
                  onError={() => setImgError(true)}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {fullName}
              </h3>
              <p className="text-xs text-slate-500 truncate font-medium">
                {designation || "Team Member"}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Department & Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {department}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
            {employmentType}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 py-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <Hash className="w-3.5 h-3.5 mr-1" /> ID
            </span>
            <span className="font-mono text-slate-700 font-semibold">{employeeId}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" /> Location
            </span>
            <span className="font-medium text-slate-700">{location}</span>
          </div>

          {formattedJoiningDate && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" /> Joined
              </span>
              <span className="font-medium text-slate-700">{formattedJoiningDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Link */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <Link
          to={`/employees/${_id}`}
          className="w-full inline-flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
        >
          <span>View profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default EmployeeCard;
