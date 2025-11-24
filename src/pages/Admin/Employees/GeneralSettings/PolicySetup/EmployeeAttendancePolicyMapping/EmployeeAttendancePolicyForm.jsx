import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#60A5FA" : "#CBD5E1",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(96,165,250,0.5)" : "none",
    "&:hover": { borderColor: "#60A5FA" },
    borderRadius: "0.375rem",
    minHeight: "36px",
    fontSize: "0.875rem",
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999, fontSize: "0.875rem" }),
  placeholder: (provided) => ({ ...provided, fontSize: "0.875rem" }),
};

const EmployeeAttendancePolicyForm = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    policyId: "",
    effectiveFrom: "",
    effectiveTo: "",
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [empRes, policyRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/AttendancePolicy/GetAll"),
        ]);

        setEmployees(empRes.data || []);
        setPolicies(policyRes.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/EmployeeAttendancePolicyMapping/assign-policy", {
        employeeId: form.employeeId,
        policyId: form.policyId,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo,
      });
      toast.success("Attendance policy assigned successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign attendance policy");
    }
  };

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white relative p-6 rounded-lg max-h-[75vh] overflow-y-auto shadow-lg w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-red-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold mb-4">Assign Attendance Policy</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee */}
          <div>
            <label className="font-medium mb-1 block">Employee</label>
            <Select
              value={
                employees.find((emp) => emp.id === form.employeeId) || null
              }
              onChange={(selected) =>
                setForm({ ...form, employeeId: selected?.id || "" })
              }
              getOptionLabel={(emp) => `${emp.fullName} (${emp.employeeCode})`}
              getOptionValue={(emp) => emp.id}
              options={employees}
              styles={customSelectStyles}
              placeholder="Select Employee"
              autoFocus
            />
          </div>

          {/* Policy */}
          <div>
            <label className="font-medium mb-1 block">Attendance Policy</label>
            <Select
              value={
                policies.find(
                  (policy) => policy.attendancePolicyId === form.policyId
                ) || null
              }
              onChange={(selected) =>
                setForm({
                  ...form,
                  policyId: selected?.attendancePolicyId || "",
                })
              }
              getOptionLabel={(p) => `ID ${p.attendancePolicyId} || ${p.policyName}`}
              getOptionValue={(p) => p.attendancePolicyId}
              options={policies}
              styles={customSelectStyles}
              placeholder="Select Policy"
            />
          </div>

          {/* Effective Dates */}
          <div>
            <label className="text-sm">Effective From</label>
            <input
              type="date"
              name="effectiveFrom"
              value={form.effectiveFrom}
              onChange={(e) =>
                setForm({ ...form, effectiveFrom: e.target.value })
              }
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="text-sm">Effective To</label>
            <input
              type="date"
              name="effectiveTo"
              value={form.effectiveTo}
              onChange={(e) =>
                setForm({ ...form, effectiveTo: e.target.value })
              }
              className={inputClass}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary cursor-pointer text-white rounded hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAttendancePolicyForm;
