import { useState } from "react";
import { FiEye } from "react-icons/fi";
import PerDayAttendanceCalendarr from "./PerDayAttendanceCalendarr";
import { XIcon } from "lucide-react";

const EmployeeWiseAttendance = ({ employees, attendanceData, searchQuery }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const filteredEmployees = employees.filter((emp) =>
    `${emp.fullName} ${emp.employeeCode}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const getEmployeeMonthlyData = (employeeId) => {
    return attendanceData
      .filter(
        (a) =>
          a.employeeId === employeeId &&
          new Date(a.attendanceDate).getMonth() === selectedMonth &&
          new Date(a.attendanceDate).getFullYear() === selectedYear,
      )
      .map((a) => ({
        date: a.attendanceDate,
        inTime: a.inTime,
        outTime: a.outTime,
        totalHoursWorked: a.totalHours || 0,
        isAbsent: a.status === "Absent",
        isHalfDay: a.status === "Half Day",
      }));
  };

  return (
    <div className="mx-3 space-y-4">
      {filteredEmployees.map((emp) => (
        <div
          key={emp.id}
          className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
        >
          <div className="text-sm">
            <div className="font-semibold text-gray-800">{emp.fullName}</div>
            <div className="text-gray-500">{emp.employeeCode}</div>
          </div>

          <button
            onClick={() => {
              setSelectedEmployee(emp);

              // reset to current month when opening
              const now = new Date();
              setSelectedMonth(now.getMonth());
              setSelectedYear(now.getFullYear());
            }}
            className="flex items-center gap-2 bg-indigo-100 text-primary font-bold cursor-pointer px-3 py-2 rounded-md text-sm hover:bg-indigo-200"
          >
            <FiEye />
            View
          </button>
        </div>
      ))}

      {/* Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 relative">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-red-600"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedEmployee.fullName} - Monthly Attendance
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

            <PerDayAttendanceCalendarr
              perDayDetails={getEmployeeMonthlyData(selectedEmployee.id)}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWiseAttendance;
