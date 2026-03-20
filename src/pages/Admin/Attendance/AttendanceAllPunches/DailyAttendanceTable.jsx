import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AttendanceRow from "./AttendanceRow";
import { toast } from "react-toastify";
import { SearchX, CalendarX } from "lucide-react";

const DailyAttendanceTable = ({ date }) => {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [showAbsentOnly, setShowAbsentOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ================= FETCH ATTENDANCE =================
  const fetchAttendance = async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.get("/DailyAttendanceStatus/date", {
        params: { date },
      });

      const data = res.data?.data || [];

      setRows(data);

      const uniqueEmpIds = [...new Set(data.map((r) => r.employeeId))];
      fetchEmployees(uniqueEmpIds);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance");
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
    if (date) fetchAttendance();
  }, [date]);

  // ================= FILTER =================
  const filteredRows = rows.filter((r) => {
    const emp = employees[r.employeeId];

    const matchesSearch =
      !searchTerm ||
      emp?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp?.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMissing =
      !showOnlyMissing ||
      (
        (Boolean(r.hasInPunch) && !Boolean(r.hasOutPunch)) ||
        (!Boolean(r.hasInPunch) && Boolean(r.hasOutPunch))
      );

    // ABSENT LOGIC
    const matchesAbsent =
      !showAbsentOnly ||
      (!r.hasInPunch && !r.hasOutPunch); // no punches = absent

    return matchesSearch && matchesMissing && matchesAbsent;
  });

  // ================= LOADING =================
  if (loading)
    return (
      <div className="flex justify-center py-10 text-sm text-gray-500">
        Loading attendance records...
      </div>
    );

  // ================= EMPTY =================
  if (!rows.length)
    return (
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
    );

  return (
    <div className="m-2 space-y-2">
      {/* ===== FILTER BAR ===== */}
      <div className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">
          Daily Attendance ({rows.length})
        </h2>

        <div className="flex gap-3 items-center">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
            h-9 w-64 rounded-md border border-gray-300 px-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />

          {/* FILTER */}
          <button
            onClick={() => {
              setShowOnlyMissing(!showOnlyMissing);
              setShowAbsentOnly(false); // 👈 avoid overlap
            }}
            className="
              rounded-md px-4 py-2 text-sm font-medium
              text-white bg-primary hover:bg-secondary
              transition shadow-sm cursor-pointer
              "
          >
            {showOnlyMissing ? "Show All" : "Missing Punches"}
          </button>

          <button
            onClick={() => {
              setShowAbsentOnly(!showAbsentOnly);
              setShowOnlyMissing(false); // optional: avoid conflict
            }}
            className="
              rounded-md px-4 py-2 text-sm font-medium
              text-white bg-red-500 hover:bg-red-600
              transition shadow-sm cursor-pointer
              "
          >
            {showAbsentOnly ? "Show All" : "Absent Employees"}
          </button>
        </div>
      </div>

      {/* ===== EMPTY SEARCH RESULT ===== */}
      {filteredRows.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="flex justify-center mb-2">
            <SearchX className="w-8 h-8 text-gray-400" />
          </div>

          <p className="text-sm font-medium">
            No employees match your search
          </p>
        </div>
      )}

      {/* ===== TABLE ===== */}
      {filteredRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-y border-gray-200">
              <tr className="text-gray-600">
                <th className="px-4 py-3 text-center">S.No</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-center">InTime</th>
                <th className="px-4 py-3 text-center">OutTime</th>
                <th className="px-4 py-3 text-center">T.Hours</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
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
};

export default DailyAttendanceTable;