import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { FaRegCalendarAlt } from "react-icons/fa";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDates, setOpenDates] = useState({});

  const toggleDate = (date) => {
    setOpenDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Fetch & merge attendance
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/Attendance/all");
      const raw = res.data || [];

      const merged = {};

      raw.forEach((item) => {
        const key = `${item.employeeId}-${item.attendanceDate}`;

        if (!merged[key]) {
          merged[key] = {
            employeeId: item.employeeId,
            attendanceDate: item.attendanceDate,
            inTime: null,
            outTime: null,
            status: item.status,
          };
        }

        if (item.punchType === "IN") merged[key].inTime = item.inTime;
        if (item.punchType === "OUT") merged[key].outTime = item.outTime;
      });

      setAttendanceData(Object.values(merged));
    } catch (error) {
      toast.error("Failed to fetch attendance");
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

  // Get employee name
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : `Emp#${id}`;
  };

  // Search filter
  const filteredAttendance = attendanceData.filter((item) =>
    getEmployeeName(item.employeeId)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // --- GROUPED BY DATE LOGIC BEFORE RETURN ---
  const groupedByDate = filteredAttendance.reduce((groups, item) => {
    const dateKey = new Date(item.attendanceDate).toLocaleDateString("en-GB");
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
    return groups;
  }, {});

  // Highlight searched text
  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Status pill colors
  const statusColors = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-yellow-100 text-yellow-700",
    Early: "bg-purple-100 text-purple-700",
    Default: "bg-gray-100 text-gray-700",
  };

  const getStatusClass = (status) =>
    statusColors[status] || statusColors.Default;

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="font-semibold text-xl text-gray-800">Attendance Data</h2>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm w-full md:w-64 focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={fetchAttendance}
            className="flex items-center gap-2 px-3 py-2 bg-primary cursor-pointer hover:bg-secondary text-white rounded-lg text-sm"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Grouped Attendance */}
      <div className="mx-3">
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            Loading attendance...
          </div>
        ) : Object.keys(groupedByDate).length > 0 ? (
          Object.keys(groupedByDate)
            .sort(
              (a, b) =>
                new Date(b.split("/").reverse().join("-")) -
                new Date(a.split("/").reverse().join("-"))
            )
            .map((date) => (
              <div
                key={date}
                className="mb-4 shadow rounded-lg bg-white overflow-hidden"
              >
                {/* Date Header */}
                <div
                  onClick={() => toggleDate(date)}
                  className="bg-gray-300 text-black px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <FaRegCalendarAlt /> {date}
                  </span>
                  <span className="text-lg">{openDates[date] ? "▼" : "▶"}</span>
                </div>

                {/* Table Inside Each Date */}
                {openDates[date] && (
                  <div className="overflow-x-auto transition-all duration-300">
                    <table className="min-w-full text-sm text-center divide-y divide-gray-200">
                      <thead className="bg-gray-100 text-gray-600">
                        <tr>
                          <th className="py-2 px-3">S.No</th>
                          <th className="py-2 px-3">Employee</th>
                          <th className="py-2 px-3">In Time</th>
                          <th className="py-2 px-3">Out Time</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {groupedByDate[date].map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-3">{index + 1}</td>
                            <td className="py-2 px-3">
                              {highlightText(getEmployeeName(item.employeeId))}
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
                                ? new Date(item.outTime).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "-"}
                            </td>

                            <td className="py-2 px-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center text-center bg-white border border-dashed border-gray-300 rounded-2xl p-10 max-w-md shadow-sm">
              <div className="mb-4 rounded-full bg-indigo-100 p-4 text-indigo-600">
                <FaRegCalendarAlt className="text-2xl" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                {searchQuery
                  ? "No Matching Attendance Records"
                  : "No Attendance Records Found"}
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search term or clear the filter to view all attendance data."
                  : "Attendance data has not been recorded yet. Once employees punch in or data is imported, it will appear here."}
              </p>

              <div className="mt-6 flex gap-3">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-lg border cursor-pointer text-sm hover:bg-gray-50"
                  >
                    Clear Search
                  </button>
                )}

                <button
                  onClick={fetchAttendance}
                  className="px-4 py-2 rounded-lg bg-primary cursor-pointer hover:bg-secondary text-white text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Attendance;
