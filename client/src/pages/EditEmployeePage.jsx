import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import EmployeeForm from "../components/employees/EmployeeForm";
import { getEmployee, updateEmployee } from "../services/employeeService";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import { ArrowLeft, UserCheck } from "lucide-react";

export const EditEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getEmployee(id);
        if (response && response.success && response.data) {
          setEmployee(response.data);
        }
      } catch (err) {
        console.error("Failed to load employee for edit:", err);
        setError(
          err.response && err.response.status === 404
            ? "Employee record not found."
            : "Unable to load employee information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    setApiError(null);

    try {
      const response = await updateEmployee(id, formData);
      if (response && response.success) {
        navigate(`/employees/${id}`, {
          state: { message: "Employee profile updated successfully!" },
          replace: true
        });
      }
    } catch (err) {
      console.error("Failed to update employee:", err);
      const msg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to update employee profile. Please check input values and try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Edit Employee">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            to={`/employees/${id}`}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Profile
          </Link>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Edit Employee Profile
              </h1>
              <p className="text-slate-500 text-sm">
                Update details for {employee ? `${employee.firstName} ${employee.lastName}` : "employee"}.
              </p>
            </div>
          </div>
        </div>

        {/* Content handling: Loading, Error, or Form */}
        {loading ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 space-y-6">
            <Skeleton variant="text" className="w-1/3 h-6" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="text" className="w-full h-10" />
              <Skeleton variant="text" className="w-full h-10" />
            </div>
            <Skeleton variant="text" className="w-full h-24" />
          </div>
        ) : error ? (
          <ErrorState
            title="Employee Not Available"
            message={error}
            onRetry={() => navigate("/employees")}
          />
        ) : (
          <EmployeeForm
            initialValues={employee}
            isEditMode={true}
            onSubmit={handleUpdate}
            onCancel={() => navigate(`/employees/${id}`)}
            submitting={submitting}
            apiError={apiError}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default EditEmployeePage;
