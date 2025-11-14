import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 

  // Fetch attendance records
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch {
      toast.error("Failed to fetch employees");
    }
  };

  // Get employee name by ID
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.employeeId === id || e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : `Emp#${id}`;
  };

  // Filtered attendance based on search
  const filteredAttendance = attendanceData.filter((item) =>
    getEmployeeName(item.employeeId)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Highlight search matches
  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.toString().split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-yellow-200">{part}</span> : part
    );
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        <h2 className="font-semibold text-xl">Attendance Record</h2>
        <div className="flex items-center gap-2 flex-col md:flex-row w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by employee name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={fetchAttendance}
            className="flex cursor-pointer items-center text-sm gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg bg-white mx-3">
        <table className="min-w-full divide-y text-sm divide-gray-200 text-center">
          <thead className="bg-gray-100 text-gray-600">
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
            ) : filteredAttendance.length > 0 ? (
              filteredAttendance.map((item) => (
                <tr
                  key={item.attendanceRecordId}
                  className="hover:bg-gray-50"
                >
                  <td className="py-2 px-3">{highlightText(getEmployeeName(item.employeeId))}</td>
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
                  <td className="py-2 px-3">{item.totalHoursWorked?.toFixed(2) || "-"}</td>
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
                  <td className="py-2 px-3 text-gray-600">{item.remarks || "-"}</td>
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
