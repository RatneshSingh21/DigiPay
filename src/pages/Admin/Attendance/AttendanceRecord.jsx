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

const AttendanceRecord = () => {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterEmployee, setFilterEmployee] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

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
        }))
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
        "/AttendanceRecord/getAttendancerecord/all"
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
      setEmployeeCache((prev) => ({
        ...prev,
        [id]: res.data.data.fullName,
      }));
    } catch {}
  };

  // Filters
  const applyFilters = () => {
    let list = [...records];

    if (filterEmployee) {
      list = list.filter((r) => r.employeeId === filterEmployee.value);
    }

    if (filterDate) {
      list = list.filter((r) => r.attendanceDate.startsWith(filterDate));
    }

    if (filterMonth) {
      const [yr, mo] = filterMonth.split("-");
      list = list.filter((r) => {
        const d = new Date(r.attendanceDate);
        return (
          d.getFullYear().toString() === yr &&
          (d.getMonth() + 1).toString().padStart(2, "0") === mo
        );
      });
    }

    setFilteredRecords(list);
  };

  // Reset Filters
  const resetFilters = () => {
    setFilterEmployee(null);
    setFilterDate("");
    setFilterMonth("");
    setFilteredRecords(records);
  };

  useEffect(() => {
    loadEmployees();
    loadRecords();
  }, []);

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      height: "42px",
      fontSize: "14px",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "42px",
      padding: "0 8px",
    }),
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="sticky top-14 z-20">
        <div className="px-4 py-3 shadow bg-white flex items-center justify-between">
          <h2 className="font-semibold text-xl">Attendance Records</h2>
          <div className="flex gap-3 text-sm">
            <button
              className="bg-primary text-white cursor-pointer px-4 py-2 rounded flex items-center gap-2"
              onClick={() => setShowAdd(true)}
            >
              <FaPlus /> Add Attendance
            </button>

            <button
              className="bg-blue-600 text-white px-4 cursor-pointer py-2 rounded flex items-center gap-2"
              onClick={() => setShowMonthly(true)}
            >
              <FaRegCalendarAlt /> Generate Monthly
            </button>

            <button
              className="bg-green-600 text-white cursor-pointer px-4 py-2 rounded flex items-center gap-2"
              onClick={() => setShowDate(true)}
            >
              <FaCalendarDay /> Generate Date
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white grid grid-cols-1 sm:grid-cols-5 gap-4 p-6">
          {/* Employee Select */}
          <Select
            options={employees}
            value={filterEmployee}
            onChange={setFilterEmployee}
            placeholder="Employee"
            styles={selectStyles}
          />

          {/* Date */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border px-3 py-2 rounded h-[42px] text-sm"
          />

          {/* Month */}
          <div className="relative">
            {!filterMonth && (
              <span className="absolute left-3 top-[10px] text-gray-400 font-bold pointer-events-none text-sm">
                Select Month
              </span>
            )}

            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border px-3 py-2 rounded h-[42px] text-sm w-full relative"
            />
          </div>

          {/* Apply */}
          <button
            onClick={applyFilters}
            className="bg-primary cursor-pointer text-white px-4 rounded h-[42px]"
          >
            Apply
          </button>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="bg-gray-300 cursor-pointer px-4 rounded h-[42px]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* RECORDS TABLE (SEPARATE COMPONENT) */}
      <AttendanceTable
        records={filteredRecords}
        employeeCache={employeeCache}
        loading={loading}
      />

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
