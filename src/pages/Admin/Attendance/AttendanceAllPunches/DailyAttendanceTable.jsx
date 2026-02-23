import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AttendanceRow from "./AttendanceRow";
import { toast } from "react-toastify";
import { SearchX, CalendarX } from "lucide-react";

const DailyAttendanceTable = () => {
  const [groupedData, setGroupedData] = useState({});
  const [employees, setEmployees] = useState({});
  const [openDate, setOpenDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ================= FETCH ATTENDANCE =================
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/DailyAttendanceStatus");
      const data = res.data.data;

      const grouped = data.reduce((acc, row) => {
        const day = row.attendanceDate.split("T")[0];
        if (!acc[day]) acc[day] = [];
        acc[day].push(row);
        return acc;
      }, {});

      const sortedDates = Object.keys(grouped).sort(
        (a, b) => new Date(b) - new Date(a),
      );

      const sortedGrouped = {};
      sortedDates.forEach((date) => {
        sortedGrouped[date] = grouped[date];
      });

      setGroupedData(sortedGrouped);
      setOpenDate(sortedDates[0]);

      const uniqueEmpIds = [...new Set(data.map((r) => r.employeeId))];
      fetchEmployees(uniqueEmpIds);
    } catch (err) {
      // toast.error("Failed to load attendance");
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH EMPLOYEES =================
  const fetchEmployees = async (empIds) => {
    try {
      const responses = await Promise.all(
        empIds.map((id) => axiosInstance.get(`/Employee/${id}`)),
      );

      const empMap = {};
      responses.forEach((res) => {
        empMap[res.data.data.id] = res.data.data;
      });

      setEmployees(empMap);
    } catch {
      toast.error("Failed to load employee details");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const formatDateDDMMYYYY = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  if (loading)
    return (
      <div className="flex justify-center py-10 text-sm text-gray-500">
        Loading attendance records...
      </div>
    );

  return (
    <div className="m-2 space-y-2">
      {/* ===== FILTER BAR ===== */}
      <div className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">
          Daily Attendance Overview
        </h2>
        <div className="flex gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search employee name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
            h-9 w-64 rounded-md border border-gray-300 px-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            "
          />

          {/* Missing Filter */}
          <button
            onClick={() => setShowOnlyMissing(!showOnlyMissing)}
            className="
            rounded-md px-4 py-2 text-sm font-medium
            text-white bg-primary
            hover:bg-secondary cursor-pointer
            transition-all shadow-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40
          "
          >
            {showOnlyMissing ? "Show All Records" : "Show Missing Punches"}
          </button>
        </div>
      </div>

      {/* ===== GLOBAL EMPTY STATE ===== */}
      {!loading && Object.keys(groupedData).length === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <div className="flex justify-center mb-3">
            <CalendarX className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            No attendance records found
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Attendance data will appear here once records are created.
          </p>
        </div>
      )}

      {/* ===== DATE GROUPS ===== */}
      {Object.keys(groupedData).map((day) => {
        const totalCount = groupedData[day].length;

        const filteredRows = groupedData[day].filter((r) => {
          const emp = employees[r.employeeId];
          const matchesSearch =
            !searchTerm ||
            emp?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp?.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesMissing =
            !showOnlyMissing || !r.hasInPunch || !r.hasOutPunch;

          return matchesSearch && matchesMissing;
        });
        const visibleCount = filteredRows.length;

        return (
          <div
            key={day}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* ===== DATE HEADER ===== */}
            <div
              onClick={() => setOpenDate(openDate === day ? null : day)}
              className="
                cursor-pointer flex justify-between items-center
                px-6 py-4 bg-gray-50
                hover:bg-gray-100 transition
              "
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDateDDMMYYYY(day)}
                </p>
                <p className="text-xs text-gray-500">
                  {totalCount} employee{totalCount !== 1 && "s"}
                  {visibleCount !== totalCount && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-medium">
                      {visibleCount} found
                    </span>
                  )}
                </p>
              </div>

              <span className="text-gray-500 text-sm">
                {openDate === day ? "▲" : "▼"}
              </span>
            </div>

            {/* ===== TABLE ===== */}
            {openDate === day && filteredRows.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="flex justify-center mb-2">
                  <SearchX className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium">
                  No employees match your search or filter
                </p>
                <p className="text-xs mt-1">
                  Try clearing search or disabling filters
                </p>
              </div>
            )}

            {openDate === day && filteredRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-y border-gray-200">
                    <tr className="text-gray-600">
                      <th className="px-4 py-3 text-center font-medium">
                        S.No
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        InTime
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        OutTime
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        T.Hours
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredRows.map((row, index) => (
                      <AttendanceRow
                        key={row.id}
                        row={row}
                        employee={employees[row.employeeId]}
                        onSuccess={fetchAttendance}
                        serialNumber={index + 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DailyAttendanceTable;
