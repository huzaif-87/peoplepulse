import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import EmployeeForm from "../components/employees/EmployeeForm";
import { createEmployee } from "../services/employeeService";
import { ArrowLeft, UserPlus } from "lucide-react";

export const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    setApiError(null);

    try {
      const response = await createEmployee(formData);
      if (response && response.success && response.data) {
        const createdId = response.data._id;
        navigate(`/employees/${createdId}`, {
          state: { message: "Employee record created successfully!" },
          replace: true
        });
      }
    } catch (err) {
      console.error("Failed to create employee:", err);
      const msg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to create employee. Please check input values and try again.";
      setApiError(msg);
    } fontFinally: {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Add Employee">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            to="/employees"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Employees
          </Link>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Add New Employee
              </h1>
              <p className="text-slate-500 text-sm">
                Create a new employee profile in the workforce database.
              </p>
            </div>
          </div>
        </div>

        {/* Reusable Form */}
        <EmployeeForm
          isEditMode={false}
          onSubmit={handleCreate}
          onCancel={() => navigate("/employees")}
          submitting={submitting}
          apiError={apiError}
        />
      </div>
    </AppLayout>
  );
};

export default AddEmployeePage;
