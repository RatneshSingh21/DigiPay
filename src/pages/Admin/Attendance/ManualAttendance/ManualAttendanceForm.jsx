import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Select from "react-select";

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
    "w-full border rounded-lg px-2 py-1  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400";

  // ============== LOAD EMPLOYEE LIST ==============
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await axiosInstance.get("/Employee");
        const options = res.data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
        }));
        setEmployees(options);
      } catch (err) {
        toast.error("Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // ============== FORM SUBMIT ==============
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/Attendance", form);
      toast.success("Attendance saved!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save attendance");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[500px] animate-fadeIn">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Manual Attendance</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black cursor-pointer text-lg">✕</button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">

          {/* Employee Name Select */}
          <div>
            <label className="text-sm font-medium">Employee</label>
            <Select
              options={employees}
              isLoading={loadingEmployees}
              placeholder="Select Employee"
              value={employees.find((e) => e.value === form.employeeId) || null}
              onChange={(selected) =>
                setForm({ ...form, employeeId: selected?.value })
              }
              required
            />
          </div>

          {/* Total Days */}
          <div>
            <label className="text-sm font-medium">Total Month Days</label>
            <input
              type="number"
              value={form.totalMonthDays}
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, totalMonthDays: e.target.value })
              }
              required
            />
          </div>

          {/* Present Days */}
          <div>
            <label className="text-sm font-medium">Present Days</label>
            <input
              type="number"
              value={form.presentDays}
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, presentDays: e.target.value })
              }
              required
            />
          </div>

          {/* Leave Days */}
          <div>
            <label className="text-sm font-medium">Leave Days</label>
            <input
              type="number"
              value={form.leaveDays}
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, leaveDays: e.target.value })
              }
            />
          </div>

          {/* Absent Days */}
          <div>
            <label className="text-sm font-medium">Absent Days</label>
            <input
              type="number"
              value={form.absentDays}
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, absentDays: e.target.value })
              }
            />
          </div>

          {/* OT Hours */}
          <div>
            <label className="text-sm font-medium">OT Hours</label>
            <input
              type="number"
              value={form.otHours}
              className={inputClass}
              onChange={(e) => setForm({ ...form, otHours: e.target.value })}
            />
          </div>

          {/* Month Select */}
          <div>
            <label className="text-sm font-medium">Month</label>
            <Select
              options={monthOptions}
              placeholder="Select Month"
              value={monthOptions.find((m) => m.value === form.month) || null}
              onChange={(selected) => setForm({ ...form, month: selected.value })}
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

          {/* FOOTER BUTTONS */}
          <div className="col-span-2 flex text-sm justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-secondary cursor-pointer text-white rounded-lg"
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
