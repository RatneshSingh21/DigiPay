import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch attendance records (using correct API)
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "/AttendanceRecord/getAttendancerecord/all"
      );
      if (res.data && res.data.data) {
        setAttendanceData(res.data.data);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      // toast.error("Failed to fetch attendance data");
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
    const emp = employees.find((e) => e.employeeId === id || e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : `Emp#${id}`;
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Attendance Record</h2>
        <button
          onClick={fetchAttendance}
          className="flex cursor-pointer items-center text-sm gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg bg-white mx-3">
        <table className="min-w-full divide-y text-sm divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 text-center">
            <tr>
              <th className="py-2 px-3">Employee</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">In Time</th>
              <th className="py-2 px-3">Out Time</th>
              <th className="py-2 px-3">Total Hours</th>
              <th className="py-2 px-3">Late (mins)</th>
              <th className="py-2 px-3">Early Leave (mins)</th>
              <th className="py-2 px-3">OT (mins)</th>
              <th className="py-2 px-3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  Loading attendance data...
                </td>
              </tr>
            ) : attendanceData.length > 0 ? (
              attendanceData.map((item) => (
                <tr
                  key={item.attendanceRecordId}
                  className="hover:bg-gray-50 text-center"
                >
                  <td className="py-2 px-3">
                    {getEmployeeName(item.employeeId)}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(item.attendanceDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-2 px-3">
                    {item.inTime
                      ? new Date(item.inTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="py-2 px-3">
                    {item.outTime
                      ? new Date(item.outTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="py-2 px-3">{item.totalHoursWorked.toFixed(2) || "-"}</td>
                  <td className="py-2 px-3">
                    {item.shiftSegments?.reduce(
                      (sum, seg) => sum + (seg.lateMinutes || 0),
                      0
                    ) || 0}
                  </td>
                  <td className="py-2 px-3">
                    {item.shiftSegments?.reduce(
                      (sum, seg) => sum + (seg.earlyLeaveMinutes || 0),
                      0
                    ) || 0}
                  </td>
                  <td className="py-2 px-3">
                    {item.shiftSegments?.reduce(
                      (sum, seg) => sum + (seg.otMinutes || 0),
                      0
                    ) || 0}
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    {item.remarks || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
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
