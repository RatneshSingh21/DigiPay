import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Select from "react-select";
import { X } from "lucide-react";

const ManualAttendanceForm = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    totalMonthDays: "",
    presentDays: "",
    leaveDays: "",
    absentDays: "",
    otHours: "",
    month: "",
    year: "",
  });

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  /* ================= LOAD EMPLOYEES ================= */
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await axiosInstance.get("/Employee");

        const options = Array.isArray(res.data)
          ? res.data.map((emp) => ({
              value: emp.id,
              label: `${emp.fullName} (${emp.employeeCode})`,
            }))
          : [];

        setEmployees(options);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      employeeId: Number(form.employeeId),
      totalMonthDays: Number(form.totalMonthDays),
      presentDays: Number(form.presentDays),
      leaveDays: Number(form.leaveDays || 0),
      absentDays: Number(form.absentDays || 0),
      otHours: Number(form.otHours || 0),
      month: Number(form.month),
      year: Number(form.year),
    };

    try {
      await axiosInstance.post("/Attendance/monthly-summary/save", payload);

      toast.success("Attendance saved!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err);
      toast.error("Failed to save attendance");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[500px]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Manual Attendance</h2>
          <button
            onClick={onClose}
            className="text-gray-600 cursor-pointer hover:text-red-500 text-lg"
          >
            <X size={25} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
          {/* Employee */}
          <div>
            <label className="text-sm font-medium">Employee</label>
            <Select
              options={employees}
              isLoading={loadingEmployees}
              placeholder="Select Employee"
              value={employees.find((e) => e.value === form.employeeId) || null}
              onChange={(s) =>
                setForm({ ...form, employeeId: s ? s.value : "" })
              }
              required
            />
          </div>

          {/* Total Days */}
          <div>
            <label className="text-sm font-medium">Total Month Days</label>
            <input
              type="number"
              className={inputClass}
              value={form.totalMonthDays}
              onChange={(e) =>
                setForm({ ...form, totalMonthDays: e.target.value })
              }
              required
            />
          </div>

          {/* Present */}
          <div>
            <label className="text-sm font-medium">Present Days</label>
            <input
              type="number"
              className={inputClass}
              value={form.presentDays}
              onChange={(e) =>
                setForm({ ...form, presentDays: e.target.value })
              }
              required
            />
          </div>

          {/* Leave */}
          <div>
            <label className="text-sm font-medium">Leave Days</label>
            <input
              type="number"
              className={inputClass}
              value={form.leaveDays}
              onChange={(e) => setForm({ ...form, leaveDays: e.target.value })}
            />
          </div>

          {/* Absent */}
          <div>
            <label className="text-sm font-medium">Absent Days</label>
            <input
              type="number"
              className={inputClass}
              value={form.absentDays}
              onChange={(e) => setForm({ ...form, absentDays: e.target.value })}
            />
          </div>

          {/* OT */}
          <div>
            <label className="text-sm font-medium">OT Hours</label>
            <input
              type="number"
              className={inputClass}
              value={form.otHours}
              onChange={(e) => setForm({ ...form, otHours: e.target.value })}
            />
          </div>

          {/* Month */}
          <div>
            <label className="text-sm font-medium">Month</label>
            <Select
              options={monthOptions}
              placeholder="Select Month"
              value={monthOptions.find((m) => m.value === form.month) || null}
              onChange={(s) => setForm({ ...form, month: s.value })}
              required
            />
          </div>

          {/* Year */}
          <div>
            <label className="text-sm font-medium">Year</label>
            <input
              type="number"
              className={inputClass}
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
          </div>

          {/* BUTTONS */}
          <div className="col-span-2 flex text-sm justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border  cursor-pointer rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary cursor-pointer text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualAttendanceForm;
