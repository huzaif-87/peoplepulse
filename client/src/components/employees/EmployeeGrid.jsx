import React from "react";
import EmployeeCard from "./EmployeeCard";

export const EmployeeGrid = ({ employees = [] }) => {
  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
      {employees.map((employee) => (
        <EmployeeCard key={employee._id || employee.employeeId} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeeGrid;
