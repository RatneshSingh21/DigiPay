import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]); // Added missing state
  const [loading, setLoading] = useState(false);

  // Fetch all attendance records
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Attendance/all");
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees for name mapping
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch {
      toast.error("Failed to fetch employees");
    }
  };

  // Get Employee Name by ID
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : `Emp#${id}`;
  };

  // Load both attendance + employee data on mount
  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Attendance</h2>
        <button
          onClick={fetchAttendance}
          className="flex cursor-pointer items-center text-sm gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg bg-white">
        <table className="min-w-full divide-y text-sm divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 text-center">
            <tr>
              <th className="py-2 px-3">Employee</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">In Time</th>
              <th className="py-2 px-3">Out Time</th>
              <th className="py-2 px-3">Total Hours</th>
              <th className="py-2 px-3">Work Type</th>
              <th className="py-2 px-3">Punch Type</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading attendance data...
                </td>
              </tr>
            ) : attendanceData.length > 0 ? (
              attendanceData.map((item) => (
                <tr
                  key={item.attendanceId}
                  className="hover:bg-gray-50 text-center"
                >
                  <td className="py-2 px-3">{getEmployeeName(item.employeeId)}</td>
                  <td className="py-2 px-3">
                    {new Date(item.attendanceDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(item.inTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 px-3">
                    {item.outTime
                      ? new Date(item.outTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="py-2 px-3">{item.totalHours}</td>
                  <td className="py-2 px-3">{item.workType}</td>
                  <td className="py-2 px-3">{item.punchType}</td>
                  <td
                    className={`py-2 px-3 font-medium ${
                      item.status === "Present"
                        ? "text-green-600"
                        : item.status === "Absent"
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {item.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Attendance;
