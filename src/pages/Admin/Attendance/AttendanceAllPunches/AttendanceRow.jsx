import { useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const inputClass =
  "h-9 w-28 rounded-md border border-gray-300 px-2 text-sm text-center " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "bg-white disabled:bg-gray-100";

const AttendanceRow = ({ row, employee, onSuccess, serialNumber }) => {
  const [inTime, setInTime] = useState(
    row.firstInTime?.substring(11, 16) || "",
  );
  const [outTime, setOutTime] = useState(
    row.lastOutTime?.substring(11, 16) || "",
  );
  const [saving, setSaving] = useState(false);

  const baseDate = row.attendanceDate.split("T")[0];

  // ===== STATUS LOGIC =====
  let status = "";
  let statusStyle = "";

  if (row.hasInPunch && row.hasOutPunch) {
    status = "Present";
    statusStyle = "bg-green-100 text-green-700";
  } else if (!row.hasInPunch && !row.hasOutPunch) {
    status = "Absent";
    statusStyle = "bg-red-100 text-red-700";
  } else if (!row.hasInPunch) {
    status = "Missing In";
    statusStyle = "bg-yellow-100 text-yellow-700";
  } else if (!row.hasOutPunch) {
    status = "Missing Out";
    statusStyle = "bg-orange-100 text-orange-700";
  }

  const handleSave = async () => {
    if (!row.hasInPunch && !inTime) {
      toast.error("Please enter In time");
      return;
    }

    if (!row.hasOutPunch && !outTime) {
      toast.error("Please enter Out time");
      return;
    }

    setSaving(true);

    try {
      if (!row.hasInPunch && !row.hasOutPunch) {
        await axiosInstance.put("/DailyAttendanceStatus/edit", {
          employeeId: row.employeeId,
          attendanceDate: row.attendanceDate,
          newInTime: `${baseDate}T${inTime}:00`,
          newOutTime: `${baseDate}T${outTime}:00`,
        });
      } else if (!row.hasInPunch) {
        await axiosInstance.put("/DailyAttendanceStatus/edit-in", {
          employeeId: row.employeeId,
          attendanceDate: row.attendanceDate,
          newInTime: `${baseDate}T${inTime}:00`,
        });
      } else if (!row.hasOutPunch) {
        await axiosInstance.put("/DailyAttendanceStatus/edit-out", {
          employeeId: row.employeeId,
          attendanceDate: row.attendanceDate,
          newOutTime: `${baseDate}T${outTime}:00`,
        });
      }

      toast.success("Attendance updated");
      onSuccess();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="text-xs border-t border-gray-100 hover:bg-gray-50 transition">
      {/* S.No */}
      <td className="p-3 text-center text-gray-600">{serialNumber}.</td>

      {/* Employee */}
      <td className="p-3">
        <p className="font-medium text-gray-800">{employee?.fullName || "—"}</p>
        <p className="text-xs text-gray-500">{employee?.employeeCode}</p>
      </td>

      {/* In Time */}
      <td className="p-3 text-center">
        {row.hasInPunch ? (
          <span
            className="
              px-2.5 py-1 rounded-md
              text-xs font-medium
              bg-gray-100 text-gray-800
              hover:bg-indigo-100 hover:text-indigo-700
              transition-colors cursor-help
            "
            title="In Punch"
          >
            {inTime}
          </span>
        ) : (
          <input
            type="time"
            value={inTime}
            onChange={(e) => setInTime(e.target.value)}
            className={inputClass}
          />
        )}
      </td>

      {/* Out Time */}
      <td className="p-3 text-center">
        {row.hasOutPunch ? (
          <span
            className="
              px-2.5 py-1 rounded-md
              text-xs font-medium
              bg-gray-100 text-gray-800
              hover:bg-indigo-100 hover:text-indigo-700
              transition-colors cursor-help
            "
            title="Out Punch"
          >
            {outTime}
          </span>
        ) : (
          <input
            type="time"
            value={outTime}
            onChange={(e) => setOutTime(e.target.value)}
            className={inputClass}
          />
        )}
      </td>

      {/* Hours */}
      <td className="p-3 text-center font-medium text-gray-700">
        {row.totalHours ? row.totalHours.toFixed(2) : "-"}
      </td>

      {/* Status */}
      <td className="p-3 text-center">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyle}`}
        >
          {status}
        </span>
      </td>

      {/* Action */}
      <td className="p-3 text-center">
        <button
          disabled={saving || (row.hasInPunch && row.hasOutPunch)}
          onClick={handleSave}
          className="
            bg-primary hover:bg-secondary cursor-pointer
            text-white px-4 py-1.5 rounded-md text-xs font-semibold
            shadow-sm transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </td>
    </tr>
  );
};

export default AttendanceRow;
