import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import Select from "react-select";
import { XIcon } from "lucide-react";
import { toast } from "react-toastify";

import PerDayAttendancePunchesCalendar from "./PerDayAttendancePunchesCalendar";
import EditPunchModal from "./EditPunchModal";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";

const EmployeeWiseAttendancePunches = () => {
    const [employees, setEmployees] = useState([]);
    const [searchEmployee, setSearchEmployee] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedDay, setSelectedDay] = useState(null);

    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    // ================= FETCH EMPLOYEES =================
    const fetchEmployees = async () => {
        try {
            const res = await axiosInstance.get("/Employee");

            const mapped = res.data.map((emp) => ({
                value: emp.id,
                label: `${emp.fullName} (${emp.employeeCode})`,
                raw: emp,
            }));

            setEmployees(mapped);
        } catch {
            toast.error("Failed to load employees");
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // ================= FETCH ATTENDANCE =================
    const fetchAttendance = async (empId, m, y) => {
        try {
            setLoading(true);
            setAttendance([]);

            const res = await axiosInstance.get(
                `/DailyAttendanceStatus/employee/${empId}/monthly`,
                { params: { month: m + 1, year: y } }
            );

            const data = res.data?.data || [];

            const mapped = data.map((d) => ({
                date: d.attendanceDate,
                inTime: d.firstInTime,
                outTime: d.lastOutTime,
                totalHours: d.totalHours || 0,
                isAbsent: d.isAbsent,
                isWeekend: d.isWeekend,
                isHoliday: d.isHoliday,
                isOnLeave: d.isOnLeave,
            }));

            setAttendance(mapped);
        } catch {
            toast.error("Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedEmployee) return;
        fetchAttendance(selectedEmployee.value, month, year);
    }, [selectedEmployee, month, year]);

    const filteredEmployees = searchEmployee
        ? employees.filter((e) => e.value === searchEmployee.value)
        : employees;

    return (
        <div className="mx-4 mt-6 space-y-4">
            {/* SEARCH */}
            <div className="bg-white p-4 rounded-lg shadow">
                <Select
                    placeholder="Search Employee..."
                    options={employees}
                    value={searchEmployee}
                    onChange={(val) => setSearchEmployee(val)}
                    isClearable
                />
            </div>

            {/* EMPLOYEE LIST */}
            {filteredEmployees.map((emp) => (
                <div
                    key={emp.value}
                    className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
                >
                    <div className="font-medium text-sm text-gray-800">
                        {emp.label}
                    </div>

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
                    <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full p-6 relative">
                        <button
                            onClick={() => setSelectedEmployee(null)}
                            className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-red-600"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedEmployee.label} - Attendance
                            </h3>

                            <div className="flex items-center gap-3 pr-4">
                                {/* Month Selector */}
                                <div className="relative">
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(Number(e.target.value))}
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
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
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
                            <div className="text-center py-10">Loading...</div>
                        ) : (
                            <PerDayAttendancePunchesCalendar
                                perDayDetails={attendance}
                                selectedMonth={month}
                                selectedYear={year}
                                onDayClick={(day) => setSelectedDay(day)}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {selectedDay && (
                <EditPunchModal
                    day={selectedDay}
                    employeeId={selectedEmployee.value}
                    onClose={() => setSelectedDay(null)}
                    onSuccess={() =>
                        fetchAttendance(selectedEmployee.value, month, year)
                    }
                />
            )}
        </div>
    );
};

export default EmployeeWiseAttendancePunches;