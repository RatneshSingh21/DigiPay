import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const AttendanceRecord = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeCache, setEmployeeCache] = useState({});

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Add Attendance States
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Monthly states
  const [monthEmployee, setMonthEmployee] = useState(null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  // Generate for date
  const [genDate, setGenDate] = useState("");

  // Attendance Records
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  // Filters
  const [filterEmployee, setFilterEmployee] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [openDate, setOpenDate] = useState(null);

  // Format Full Date (DD-MM-YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB"); // 23/11/2025
  };

  // Format only time (HH:mm)
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/Employee");
        const empOptions = res.data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
        }));
        setEmployees(empOptions);
      } catch (err) {
        toast.error("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        "/AttendanceRecord/getAttendancerecord/all"
      );

      const list = res.data.data || [];
      setRecords(list);
      setFilteredRecords(list);
      // Fetch missing employee names
      list.forEach((rec) => {
        fetchEmployeeById(rec.employeeId);
      });
    } catch (err) {
      console.log(err);

      // toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const applyFilters = () => {
    let data = [...records];

    if (filterEmployee) {
      data = data.filter((r) => r.employeeId === filterEmployee.value);
    }

    if (filterDate) {
      data = data.filter((r) => r.attendanceDate.startsWith(filterDate));
    }

    if (filterMonth) {
      const [year, month] = filterMonth.split("-");

      data = data.filter((r) => {
        const d = new Date(r.attendanceDate);
        return (
          d.getFullYear().toString() === year &&
          (d.getMonth() + 1).toString().padStart(2, "0") === month
        );
      });
    }

    setFilteredRecords(data);
  };

  const fetchEmployeeById = async (id) => {
    if (employeeCache[id]) return employeeCache[id]; // already cached

    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res.data?.data;

      setEmployeeCache((prev) => ({ ...prev, [id]: emp.fullName }));

      return emp.fullName;
    } catch (err) {
      console.error(`Failed to fetch employee ${id}`, err);
      return "Unknown";
    }
  };

  // Submit Add Attendance
  const handleCreateAttendance = async () => {
    if (!selectedEmployee) return toast.error("Select an employee");
    if (!attendanceDate) return toast.error("Select attendance date");

    const payload = {
      employeeId: selectedEmployee.value,
      attendanceDate: new Date(attendanceDate).toISOString(),
      remarks: remarks || "Marked manually",
    };

    try {
      setSubmitting(true);
      await axiosInstance.post("/AttendanceRecord/create", payload);
      toast.success("Attendance record created");
      fetchRecords();
      setShowAddModal(false);

      // reset
      setSelectedEmployee(null);
      setAttendanceDate("");
      setRemarks("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  // Monthly API
  const handleGenerateMonthly = async () => {
    if (!monthEmployee || !year || !month)
      return toast.error("All fields required");

    try {
      setSubmitting(true);
      await axiosInstance.post("/AttendanceRecord/generateMonthlyAttendance", {
        employeeId: monthEmployee.value,
        year: Number(year),
        month: Number(month),
      });

      toast.success("Monthly attendance generated");
      fetchRecords();
      setShowMonthlyModal(false);

      setMonthEmployee(null);
      setYear("");
      setMonth("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate For Date API
  const handleGenerateForDate = async () => {
    if (!genDate) return toast.error("Select a date");

    try {
      setSubmitting(true);
      await axiosInstance.post(
        `/AttendanceRecord/GenerateForDate?date=${genDate}`
      );

      toast.success("Attendance generated for date");
      fetchRecords();
      setShowDateModal(false);

      setGenDate("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // modal wrapper
  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative">
          <h2 className="text-xl font-semibold mb-4">{title}</h2>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-3 right-3 text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>

          {children}
        </div>
      </div>
    );
  };

  const groupByDate = (records) => {
    return records.reduce((acc, rec) => {
      const date = rec.attendanceDate.split("T")[0]; // 2025-11-01
      if (!acc[date]) acc[date] = [];
      acc[date].push(rec);
      return acc;
    }, {});
  };

  const toggleDate = (date) => {
    setOpenDate((prev) => (prev === date ? null : date));
  };

  return (
    <>
      {/* TOP TOOLBAR */}
      <div className="bg-white p-5 sticky z-20">
        {/* Title + Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            📋 Attendance Records
          </h2>

          <div className="flex flex-wrap gap-3 text-sm">
            <button
              className="bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add Attendance
            </button>

            <button
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => setShowMonthlyModal(true)}
            >
              📅 Generate Monthly
            </button>

            <button
              className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              onClick={() => setShowDateModal(true)}
            >
              📆 Generate for Date
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <Select
            options={employees}
            value={filterEmployee}
            onChange={setFilterEmployee}
            placeholder="Filter by Employee"
          />

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <button
            onClick={applyFilters}
            className="bg-primary cursor-pointer text-white px-5 py-2 rounded-lg"
          >
            Apply
          </button>

          <button
            onClick={() => {
              setFilterEmployee(null);
              setFilterDate("");
              setFilterMonth("");
              setFilteredRecords(records);
            }}
            className="bg-gray-300 cursor-pointer px-5 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {/* NEW TABLE */}
      <div className="mt-6 mx-4 bg-white shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[50vh]">
          <table className="w-full text-xs text-center">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1 border-b">ID</th>
                <th className="px-2 py-1 border-b">Employee</th>
                <th className="px-2 py-1 border-b">Date</th>
                <th className="px-2 py-1 border-b">In-Time</th>
                <th className="px-2 py-1 border-b">Out-Time</th>
                <th className="px-2 py-1 border-b">OTMins</th>
                <th className="px-2 py-1 border-b">EarlyLeave</th>
                <th className="px-2 py-1 border-b">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                Object.entries(groupByDate(filteredRecords)).map(
                  ([date, items], groupIndex) => (
                    <React.Fragment key={date}>
                      {/* DATE HEADER ROW */}
                      <tr
                        className="bg-blue-100 cursor-pointer hover:bg-blue-200"
                        onClick={() => toggleDate(date)}
                      >
                        <td
                          colSpan="8"
                          className="text-left p-2 font-semibold flex items-center gap-2"
                        >
                          <span className="text-lg">
                            {openDate === date ? "▼" : "▶"}
                          </span>
                          📅 {formatDate(date)}
                        </td>
                      </tr>

                      {/* SHOW RECORDS ONLY IF THIS DATE IS OPEN */}
                      {openDate === date &&
                        items.map((rec, idx) => (
                          <tr
                            key={rec.attendanceRecordId}
                            className={`transition ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-gray-100`}
                          >
                            <td className="p-3 border-b">{idx + 1}</td>

                            <td className="p-3 border-b">
                              {employeeCache[rec.employeeId] || "Loading..."}
                            </td>

                            <td className="p-3 border-b">
                              {formatDate(rec.attendanceDate)}
                            </td>

                            <td className="p-3 border-b">
                              {formatTime(rec.inTime)}
                            </td>

                            <td className="p-3 border-b">
                              {formatTime(rec.outTime)}
                            </td>

                            <td className="p-3 border-b">
                              {rec.shiftSegments?.[0]?.otMinutes || 0}
                            </td>

                            <td className="p-3 border-b">
                              {rec.shiftSegments?.[0]?.earlyLeaveMinutes || 0}
                            </td>

                            <td className="p-3 border-b">{rec.remarks}</td>
                          </tr>
                        ))}
                    </React.Fragment>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Attendance Modal */}
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Attendance Record"
      >
        <div className="space-y-4">
          <Select
            options={employees}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder="Select Employee"
          />

          <input
            type="datetime-local"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Remarks (optional)"
            className="w-full border rounded-lg px-3 py-2"
          />

          <button
            onClick={handleCreateAttendance}
            disabled={submitting}
            className="w-full bg-primary cursor-pointer text-white py-2 rounded-lg hover:bg-secondary"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </Modal>

      {/* Monthly Modal */}
      <Modal
        show={showMonthlyModal}
        onClose={() => setShowMonthlyModal(false)}
        title="Generate Monthly Attendance"
      >
        <div className="space-y-4">
          <Select
            options={employees}
            value={monthEmployee}
            onChange={setMonthEmployee}
            placeholder="Select Employee"
          />

          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="number"
            placeholder="Month (1-12)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <button
            onClick={handleGenerateMonthly}
            disabled={submitting}
            className="w-full bg-blue-600 cursor-pointer text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {submitting ? "Processing..." : "Generate Monthly"}
          </button>
        </div>
      </Modal>

      {/* Generate for Date Modal */}
      <Modal
        show={showDateModal}
        onClose={() => setShowDateModal(false)}
        title="Generate Attendance For Date"
      >
        <div className="space-y-4">
          <input
            type="date"
            value={genDate}
            onChange={(e) => setGenDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <button
            onClick={handleGenerateForDate}
            disabled={submitting}
            className="w-full bg-green-600 cursor-pointer text-white py-2 rounded-lg hover:bg-green-700"
          >
            {submitting ? "Generating..." : "Generate"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AttendanceRecord;
