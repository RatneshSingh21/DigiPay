import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ManualAttendanceForm from "./ManualAttendanceForm";

const ManualAttendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  // ------------------------
  // FETCH ATTENDANCE
  // ------------------------
  const fetchAttendance = async () => {
    try {
      const { data } = await axiosInstance.get("/Attendance");
      setAttendanceList(data);
      fetchEmployees(data);
    } catch (err) {
      console.log(err);
      // toast.error("Failed to load attendance");
    }
  };

  // ------------------------
  // FETCH EMPLOYEE MAP (Single API call)
  // ------------------------
  const fetchEmployees = async (attendance) => {
    try {
      const { data } = await axiosInstance.get("/Employee");

      const map = {};
      data.forEach((emp) => {
        map[emp.id] = {
          name: emp.fullName,
          code: emp.employeeCode,
        };
      });

      setEmployeeMap(map);
    } catch (error) {
      toast.error("Failed to fetch employee details");
    }
  };

  // ------------------------
  // IMPORT SUMMARY
  // ------------------------
  const handleImport = async (file) => {
    if (!file) return toast.error("Select a file");

    const formData = new FormData();
    formData.append("File", file);

    try {
      await axiosInstance.post(
        "/Attendance/monthly-summary/import-summary",
        formData
      );

      toast.success("Imported successfully");
      fetchAttendance();
    } catch {
      toast.error("Import failed");
    }
  };

  // ------------------------
  // EXPORT SUMMARY
  // ------------------------
  const handleExport = async () => {
    try {
      const res = await axiosInstance.get(
        "/Attendance/monthly-summary/export-summary",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "AttendanceSummary.xlsx";
      a.click();

      toast.success("Downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">Manual Attendance</h2>

        <div className="flex gap-3">
          <button
            className="bg-primary hover:bg-secondary cursor-pointer text-white px-3 py-2 rounded text-sm"
            onClick={() => setShowAddModal(true)}
          >
            + Add Attendance
          </button>

          <label className="bg-green-600 text-white px-3 py-2 rounded cursor-pointer text-sm">
            Import Attendance
            <input
              type="file"
              hidden
              onChange={(e) => handleImport(e.target.files[0])}
            />
          </label>

          <button
            className="bg-purple-600 text-white cursor-pointer px-3 py-2 rounded text-sm"
            onClick={handleExport}
          >
            Export Attendance
          </button>
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="mt-4 border border-gray-200 rounded-lg overflow-x-auto max-h-[75vh]">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 text-gray-700 sticky top-0">
            <tr className="text-center">
              <th className="p-2 border-r border-gray-200">S.No</th>
              <th className="p-2 border-r border-gray-200">Employee</th>
              <th className="p-2 border-r border-gray-200">Present</th>
              <th className="p-2 border-r border-gray-200">Leave</th>
              <th className="p-2 border-r border-gray-200">Absent</th>
              <th className="p-2 border-r border-gray-200">OT Hours</th>
              <th className="p-2 border-r border-gray-200">Month</th>
              <th className="p-2 border-r border-gray-200">Year</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-center">
            {attendanceList.map((row, idx) => {
              const emp = employeeMap[row.employeeId] || {};
              return (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="p-2 border-r border-gray-200">{idx + 1}</td>

                  <td className="p-2 border-r border-gray-200 font-medium">
                    {emp.name ? (
                      <>
                        {emp.name}{" "}
                        <span className="text-gray-500 text-[11px]">
                          ({emp.code})
                        </span>
                      </>
                    ) : (
                      "Loading..."
                    )}
                  </td>

                  <td className="p-2 border-r border-gray-200">
                    {row.presentDays}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {row.leaveDays}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {row.absentDays}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {row.otHours}
                  </td>
                  <td className="p-2 border-r border-gray-200">{row.month}</td>
                  <td className="p-2 border-r border-gray-200">{row.year}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Popup Form */}
      {showAddModal && (
        <ManualAttendanceForm
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchAttendance}
        />
      )}
    </div>
  );
};

export default ManualAttendance;
