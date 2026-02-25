import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FaPlus, FaRegCalendarAlt, FaCalendarDay } from "react-icons/fa";

// Components
import AddAttendanceModal from "./AttendanceRecord/AddAttendanceModal";
import GenerateMonthlyModal from "./AttendanceRecord/GenerateMonthlyModal";
import GenerateDateModal from "./AttendanceRecord/GenerateDateModal";
import AttendanceTable from "./AttendanceRecord/AttendanceTable";
import EmployeeWiseRecord from "./AttendanceRecord/EmployeeWiseRecord";

const AttendanceRecord = () => {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState("date");
  // "date" | "employee"

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showDate, setShowDate] = useState(false);

  // Cache employee names
  const [employeeCache, setEmployeeCache] = useState({});

  // Fetch employees
  const loadEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(
        res.data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
        })),
      );
    } catch {
      toast.error("Failed loading employees");
    }
  };

  // Fetch attendance records
  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        "/AttendanceRecord/getAttendancerecord/all",
      );
      const list = res.data.data || [];

      setRecords(list);
      setFilteredRecords(list);

      // load employee names
      list.forEach((r) => fetchEmployeeById(r.employeeId));
    } catch (err) {
      console.log(err);
      // toast.error("Failed loading records");
    } finally {
      setLoading(false);
    }
  };

  // Cache helper
  const fetchEmployeeById = async (id) => {
    if (employeeCache[id]) return;

    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res.data.data;

      setEmployeeCache((prev) => ({
        ...prev,
        [id]: {
          name: emp.fullName,
          code: emp.employeeCode,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch employee details:", err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadRecords();
  }, []);

  return (
    <>
      {/* TOP BAR */}
      <div className="sticky top-14 z-20">
        <div className="px-4 py-3 shadow bg-white flex items-center justify-between">
          <h2 className="font-semibold text-xl">Attendance Records</h2>
          <div className="flex gap-3 text-sm">
            <button
              className="bg-primary text-white cursor-pointer px-4 py-2 rounded-md flex items-center gap-2"
              onClick={() => setShowAdd(true)}
            >
              <FaPlus /> Add Attendance
            </button>

            <button
              className="bg-blue-600 text-white px-4 cursor-pointer py-2 rounded-md flex items-center gap-2"
              onClick={() => setShowMonthly(true)}
            >
              <FaRegCalendarAlt /> Generate Monthly
            </button>

            <button
              className="bg-green-600 text-white cursor-pointer px-4 py-2 rounded-md flex items-center gap-2"
              onClick={() => setShowDate(true)}
            >
              <FaCalendarDay /> Generate Date
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4 mt-4">
        <button
          onClick={() => setViewMode("date")}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition ${
            viewMode === "date"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Date_Wise
        </button>

        <button
          onClick={() => setViewMode("employee")}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition ${
            viewMode === "employee"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Employee_Wise
        </button>
      </div>

      {/* RECORDS TABLE (SEPARATE COMPONENT) */}
      {viewMode === "date" ? (
        <AttendanceTable
          records={filteredRecords}
          employeeCache={employeeCache}
          loading={loading}
        />
      ) : (
        <EmployeeWiseRecord
          records={filteredRecords}
          employees={employees}
          employeeCache={employeeCache}
        />
      )}

      {/* MODALS */}
      <AddAttendanceModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        employees={employees}
        onSuccess={loadRecords}
      />
      <GenerateMonthlyModal
        show={showMonthly}
        onClose={() => setShowMonthly(false)}
        employees={employees}
        onSuccess={loadRecords}
      />
      <GenerateDateModal
        show={showDate}
        onClose={() => setShowDate(false)}
        onSuccess={loadRecords}
      />
    </>
  );
};

export default AttendanceRecord;
