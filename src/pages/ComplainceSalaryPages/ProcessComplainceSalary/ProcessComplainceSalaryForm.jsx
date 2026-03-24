import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "36px",
    fontSize: "13px",
    borderColor: "#d1d5db",
    boxShadow: "none",
    "&:hover": { borderColor: "#3b82f6" },
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  menuList: (base) => ({ ...base, maxHeight: "180px" }),
};

const MONTH_OPTIONS = [
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

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i).map((y) => ({
  value: y,
  label: String(y),
}));

const ProcessComplainceSalaryForm = ({ onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState(MONTH_OPTIONS[new Date().getMonth()]);
  const [year, setYear] = useState(YEAR_OPTIONS.find((y) => y.value === currentYear));
  const [salaryRunId, setSalaryRunId] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/Employee");
        setEmployees(
          res.data.map((emp) => ({
            value: emp.id,
            label: `${emp.fullName} (${emp.employeeCode})`,
          }))
        );
      } catch (error) {
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, []);

  // Auto-generate Salary Run ID from Month & Year
  useEffect(() => {
    if (month && year) {
      const runId = `${year.value}${String(month.value).padStart(2, "0")}`;
      setSalaryRunId(Number(runId));
    }
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !salaryRunId) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/ComplianceSalary/process", {
        employeeId: selectedEmployee.value,
        salaryRunId,
        month: month.value,
        year: year.value,
      });
      toast.success("Compliance salary processed successfully!");
      onClose?.();
    } catch (error) {
      toast.error("Failed to process compliance salary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Process Employee Compliance Salary
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form className="px-6 py-4 space-y-3" onSubmit={handleSubmit}>
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <Select
              options={employees}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder="Select Employee"
              styles={selectStyles}
            />
          </div>

          {/* Month & Year */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <Select value={month} onChange={setMonth} options={MONTH_OPTIONS} styles={selectStyles} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <Select value={year} onChange={setYear} options={YEAR_OPTIONS} styles={selectStyles} />
            </div>
          </div>

          {/* Salary Run ID (auto-generated but editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Run ID</label>
            <input
              type="number"
              value={salaryRunId}
              onChange={(e) => setSalaryRunId(Number(e.target.value))}
              className={inputClass}
              placeholder="Auto-generated from Month & Year"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format <strong>YYYYMM</strong>. Auto-generated from selected Month & Year but editable.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedEmployee || !salaryRunId}
            className="px-4 py-2 rounded bg-primary text-white hover:bg-secondary cursor-pointer disabled:opacity-50"
          >
            {loading ? "Processing..." : "Process Salary"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessComplainceSalaryForm;