import { useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance.js";
import { toast } from "react-toastify";
import { Calendar, RefreshCw, Database, Clock, Users } from "lucide-react";
import assets from "../../../../assets/assets.js";
import { FiRefreshCw } from "react-icons/fi";


const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


/* ================= STATUS BADGE ================= */
const StatusBadge = ({ status }) => {
  const map = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Incomplete: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

/* ================= HELPERS ================= */
const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

const calcHours = (inTime, outTime) => {
  if (!inTime || !outTime) return "--";
  const diffMs = new Date(outTime) - new Date(inTime);
  const hrs = diffMs / (1000 * 60 * 60);
  return hrs > 0 ? `${hrs.toFixed(2)} hrs` : "--";
};

/* ================= MAIN ================= */
const AttendanceMachineData = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeMap, setEmployeeMap] = useState({});

  /* 🔹 Sync machine */
  const loadMachineData = async () => {
    try {
      setLoading(true);
      await axiosInstance.get(`/Attendance/sync-essl?date=${date}`);
      toast.success("Machine data synced successfully");
      loadAttendanceData();
    } catch (err) {
      toast.error("Failed to sync machine data");
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 Fetch attendance */
  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/Attendance/all");
      const raw = res.data || [];

      const dayRows = raw.filter((r) => r.attendanceDate?.startsWith(date));

      const map = {};
      dayRows.forEach((r) => {
        if (!map[r.employeeId]) {
          map[r.employeeId] = {
            employeeId: r.employeeId,
            status: r.status,
            inTime: null,
            outTime: null,
          };
        }

        if (r.inTime) {
          if (!map[r.employeeId].inTime || r.inTime < map[r.employeeId].inTime)
            map[r.employeeId].inTime = r.inTime;
        }

        if (r.outTime) {
          if (
            !map[r.employeeId].outTime ||
            r.outTime > map[r.employeeId].outTime
          )
            map[r.employeeId].outTime = r.outTime;
        }
      });

      const recordsArray = Object.values(map);
      setRecords(recordsArray);

      // 🔹 Fetch employee details
      const ids = [...new Set(recordsArray.map((r) => r.employeeId))];

      const employeeData = {};
      await Promise.all(
        ids.map(async (id) => {
          const emp = await fetchEmployee(id);
          if (emp) {
            employeeData[id] = {
              name: emp.fullName,
              code: emp.employeeCode,
            };
          }
        })
      );

      setEmployeeMap(employeeData);
    } catch (err) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployee = async (id) => {
    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      return res.data?.data;
    } catch (err) {
      console.error("Failed to fetch employee", id);
      return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* HEADER CARD */}
      <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Database size={20} />
            Attendance Machine Data
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Normalized biometric punches per employee
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          Date: {new Date(date).toLocaleDateString("en-GB")}
        </span>
      </div>

      {/* CONTROLS */}
      <div className="bg-white rounded-xl shadow p-5 mx-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Attendance Date
          </label>
          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-3.5 text-gray-400"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputClass} pl-9 w-auto cursor-pointer`}
            />
          </div>
        </div>

        <button
          onClick={loadMachineData}
          className="flex items-center gap-2 bg-primary cursor-pointer text-white px-4 py-2 rounded text-sm hover:bg-secondary"
        >
          <RefreshCw size={16} />
          Sync Machine
        </button>

        <button
          onClick={loadAttendanceData}
          className="flex items-center gap-2 border cursor-pointer px-4 py-2 rounded text-sm hover:bg-gray-50"
        >
          <Users size={16} />
          View Attendance
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto mx-4">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading attendance data...
          </div>
        ) : records.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center 
               py-14 px-6 mx-4 my-6 rounded-2xl 
               bg-gradient-to-br from-white to-gray-50 
               shadow-sm"
          >
            <img
              src={assets.NoData}
              alt="No Attendance Data"
              className="w-56 mb-6 opacity-90"
            />

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Attendance Data Found
            </h3>

            <p className="text-sm text-gray-600 mb-6 max-w-md text-center">
              There is no biometric attendance available for the selected date.
              Try syncing the machine or select a different date.
            </p>

            <div className="flex gap-3">
              <button
                onClick={loadMachineData}
                className="flex items-center gap-2 
                   bg-primary hover:bg-secondary 
                   text-white px-6 py-2 
                   rounded-full text-sm font-medium 
                   shadow hover:shadow-md transition"
              >
                <FiRefreshCw size={16} />
                Sync Machine
              </button>

              <button
                onClick={loadAttendanceData}
                className="flex items-center gap-2 
                   border px-6 py-2 
                   rounded-full text-sm font-medium 
                   hover:bg-gray-50 transition"
              >
                View Attendance
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 text-center">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">IN</th>
                <th className="px-4 py-3">OUT</th>
                <th className="px-4 py-3">Working Hours</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {records.map((r) => (
                <tr key={r.employeeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{records.indexOf(r) + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {employeeMap[r.employeeId]?.name || "Loading..."}
                      </span>
                      <span className="text-xs text-gray-500">
                        {employeeMap[r.employeeId]?.code
                          ? `EmpCode: ${employeeMap[r.employeeId].code}`
                          : `ID: ${r.employeeId}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatTime(r.inTime)}</td>
                  <td className="px-4 py-3">{formatTime(r.outTime)}</td>
                  <td className="px-4 py-3 flex items-center justify-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    {calcHours(r.inTime, r.outTime)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceMachineData;
