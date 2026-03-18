import { useState, useMemo } from "react";
import { FiEye } from "react-icons/fi";
import PerDayAttendanceCalendarr from "./PerDayAttendanceCalendarr";
import { XIcon } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const EmployeeWiseAttendance = ({ employees, searchQuery }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [loading, setLoading] = useState(false);


  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      `${emp.fullName} ${emp.employeeCode}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);


  // ================= FETCH EMPLOYEE ATTENDANCE =================

  const fetchEmployeeAttendance = async (employeeId, month, year) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/Attendance/employee-nopage/${employeeId}/month?month=${month + 1}&year=${year}`
      );

      const raw = res.data?.data || [];

      const merged = {};

      raw.forEach((item) => {
        const key = item.attendanceDate.split("T")[0];

        if (!merged[key]) {
          merged[key] = {
            attendanceDate: item.attendanceDate,
            inTime: null,
            outTime: null,
            totalHours: null,
            status: item.status,
          };
        }

        if (item.punchType === "IN") {
          merged[key].inTime = item.inTime;
        }

        if (item.punchType === "OUT") {
          merged[key].outTime = item.outTime;
        }

        if (item.totalHours !== null && item.totalHours !== undefined) {
          merged[key].totalHours = item.totalHours;
        }
      });

      setEmployeeAttendance(Object.values(merged));

    } catch (error) {

      if (error.response) {

        // 404 - No attendance
        if (error.response.status === 404) {
          setEmployeeAttendance([]);
          toast.warning("No attendance found for this month.");
        }

        // 500 - Server error
        else if (error.response.status >= 500) {
          toast.error("Server error while loading attendance.");
        }

        // Other API errors
        else {
          toast.error(error.response.data?.message || "Failed to load attendance");
        }

      } else if (error.request) {

        // Network error
        toast.error("Network error. Please check your internet.");

      } else {

        toast.error("Unexpected error occurred.");

      }

      console.error("Employee Attendance Error:", error);

    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN MODAL =================

  const openEmployeeAttendance = async (emp) => {

    const now = new Date();

    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setSelectedEmployee(emp);

    await fetchEmployeeAttendance(
      emp.id,
      now.getMonth(),
      now.getFullYear()
    );

  };

  // ================= MONTH CHANGE =================

  const handleMonthChange = async (month) => {

    setSelectedMonth(month);

    if (selectedEmployee) {
      await fetchEmployeeAttendance(
        selectedEmployee.id,
        month,
        selectedYear
      );
    }

  };

  // ================= YEAR CHANGE =================

  const handleYearChange = async (year) => {

    setSelectedYear(year);

    if (selectedEmployee) {
      await fetchEmployeeAttendance(
        selectedEmployee.id,
        selectedMonth,
        year
      );
    }

  };




  const getEmployeeMonthlyData = () => {

    return employeeAttendance.map((a) => ({
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
            onClick={() => openEmployeeAttendance(emp)}
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
                    onChange={(e) => handleMonthChange(Number(e.target.value))}
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
                    onChange={(e) => handleYearChange(Number(e.target.value))}
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

            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Loading attendance...
              </div>
            ) : (
              <PerDayAttendanceCalendarr
                perDayDetails={getEmployeeMonthlyData()}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWiseAttendance;
