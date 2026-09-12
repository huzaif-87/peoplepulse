import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { AlertCircle, Plus, X, ArrowLeft, Save } from "lucide-react";

export const EmployeeForm = ({
  initialValues = null,
  isEditMode = false,
  onSubmit,
  onCancel,
  submitting = false,
  apiError = null
}) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "",
    location: "Bangalore",
    employmentType: "Full-time",
    status: "Active",
    joiningDate: new Date().toISOString().split("T")[0],
    manager: "",
    avatar: "",
    skills: []
  });

  const [skillInput, setSkillInput] = useState("");
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        employeeId: initialValues.employeeId || "",
        firstName: initialValues.firstName || "",
        lastName: initialValues.lastName || "",
        email: initialValues.email || "",
        phone: initialValues.phone || "",
        department: initialValues.department || "Engineering",
        designation: initialValues.designation || "",
        location: initialValues.location || "Bangalore",
        employmentType: initialValues.employmentType || "Full-time",
        status: initialValues.status || "Active",
        joiningDate: initialValues.joiningDate
          ? new Date(initialValues.joiningDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        manager: initialValues.manager || "",
        avatar: initialValues.avatar || "",
        skills: Array.isArray(initialValues.skills) ? [...initialValues.skills] : []
      });
    } else if (!isEditMode) {
      // Generate a reasonable default Employee ID if creating
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setFormData((prev) => ({
        ...prev,
        employeeId: `EMP-${randomNum}`
      }));
    }
  }, [initialValues, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.designation.trim()) {
      errors.designation = "Designation is required.";
    }

    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required.";
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  const departments = [
    "Engineering",
    "Design",
    "Sales",
    "Marketing",
    "HR",
    "Finance",
    "Operations"
  ];

  const locations = [
    "Chennai",
    "Bangalore",
    "Hyderabad",
    "Mumbai",
    "Pune",
    "Delhi",
    "Remote"
  ];

  const employmentTypes = ["Full-time", "Part-time", "Contract", "Intern"];

  const statuses = ["Active", "On Leave", "Inactive"];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* API Error Notification */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Section 1: Personal Details */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Aarav"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            {clientErrors.firstName && (
              <p className="text-xs text-red-600 mt-1">{clientErrors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Sharma"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            {clientErrors.lastName && (
              <p className="text-xs text-red-600 mt-1">{clientErrors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="aarav.sharma@company.com"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            {clientErrors.email && (
              <p className="text-xs text-red-600 mt-1">{clientErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Work & Role Information */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
          Work & Employment Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="EMP-1001"
              disabled={isEditMode}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 disabled:opacity-60 disabled:bg-slate-100"
            />
            {clientErrors.employeeId && (
              <p className="text-xs text-red-600 mt-1">{clientErrors.employeeId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Designation / Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            {clientErrors.designation && (
              <p className="text-xs text-red-600 mt-1">{clientErrors.designation}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Employment Type <span className="text-red-500">*</span>
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              {employmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Joining Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Manager Name
            </label>
            <input
              type="text"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              placeholder="e.g. Priya Patel"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Skills */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Skills & Core Competencies
        </h3>
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add skill (e.g. React, Node.js, Leadership)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddSkill(e);
              }
            }}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Skill Badges List */}
        <div className="flex flex-wrap gap-2 pt-1">
          {formData.skills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-full border border-slate-200"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-red-600 focus:outline-hidden"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {formData.skills.length === 0 && (
            <p className="text-xs text-slate-400 italic">No skills added yet.</p>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
        >
          {submitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Create Employee"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
