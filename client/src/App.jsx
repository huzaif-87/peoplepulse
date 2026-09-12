import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import EditEmployeePage from "./pages/EditEmployeePage";

import HeadcountPage from "./pages/HeadcountPage";
import AttendancePage from "./pages/AttendancePage";
import PerformancePage from "./pages/PerformancePage";
import FinancialPage from "./pages/FinancialPage";
import RetentionPage from "./pages/RetentionPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="/headcount" element={<HeadcountPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/retention" element={<RetentionPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<AddEmployeePage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/employees/:id/edit" element={<EditEmployeePage />} />
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
