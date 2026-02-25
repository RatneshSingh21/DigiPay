import React, { useState } from "react";
import { FiEye } from "react-icons/fi";
import { XIcon } from "lucide-react";
import PerDayAttendanceRecords from "./PerDayAttendanceRecords";

const EmployeeWiseRecord = ({ records, employees, employeeCache }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const getEmployeeMonthlyData = (employeeId) => {
    return records
      .filter(
        (r) =>
          r.employeeId === employeeId &&
          new Date(r.attendanceDate).getMonth() === selectedMonth &&
          new Date(r.attendanceDate).getFullYear() === selectedYear,
      )
      .map((r) => ({
        date: r.attendanceDate,
        inTime: r.inTime,
        outTime: r.outTime,
        totalHoursWorked: r.totalHoursWorked,
        otMinutes: r.shiftSegments?.[0]?.otMinutes || 0,
        lateMinutes: r.shiftSegments?.[0]?.lateMinutes || 0,
        earlyLeaveMinutes: r.shiftSegments?.[0]?.earlyLeaveMinutes || 0,
        remarks: r.remarks,
      }));
  };

  return (
    <div className="mx-4 mt-6 space-y-4">
      {employees.map((emp) => (
        <div
          key={emp.value}
          className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
        >
          <div className="font-medium text-sm text-gray-800">{emp.label}</div>

          <button
            onClick={() => setSelectedEmployee(emp)}
            className="flex items-center gap-2 bg-indigo-100 text-primary font-bold cursor-pointer px-3 py-2 rounded-md text-sm hover:bg-indigo-200"
          >
            <FiEye />
            View
          </button>
        </div>
      ))}

      {/* MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full p-6 relative">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-red-600"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedEmployee.label} - Monthly Records
              </h3>

              <div className="flex items-center gap-3 pr-4">
                {/* Month Selector */}
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="
        appearance-none
        bg-white
        border border-gray-300
        rounded-lg
        px-4 pr-10 py-2
        text-sm font-medium text-gray-700
        shadow-sm
        focus:outline-none
        focus:ring-2 focus:ring-indigo-500
        focus:border-indigo-500
        transition
        cursor-pointer
      "
                  >
                    {Array.from({ length: 12 }).map((_, index) => (
                      <option key={index} value={index}>
                        {new Date(0, index).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    ▼
                  </div>
                </div>

                {/* Year Selector */}
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="
        appearance-none
        bg-white
        border border-gray-300
        rounded-lg
        px-4 pr-10 py-2
        text-sm font-medium text-gray-700
        shadow-sm
        focus:outline-none
        focus:ring-2 focus:ring-indigo-500
        focus:border-indigo-500
        transition
        cursor-pointer
      "
                  >
                    {Array.from({ length: 5 }).map((_, index) => {
                      const year = today.getFullYear() - 2 + index;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <PerDayAttendanceRecords
              perDayDetails={getEmployeeMonthlyData(selectedEmployee.value)}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWiseRecord;
