import React, { useEffect, useState, useMemo } from "react";
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
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    color: state.isDisabled ? "#9ca3af" : base.color,
    cursor: state.isDisabled ? "not-allowed" : "pointer",
  }),
};

const EmployeeLeavePolicyMappingForm = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [existingAllocations, setExistingAllocations] = useState([]);

  const [form, setForm] = useState({
    employeeId: "",
    leavePolicyId: "",
    effectiveFrom: "",
    effectiveTo: "",
  });

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, policyRes, allocationRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/LeavePolicy/all"),
          axiosInstance.get("/EmployeeLeavePolicyAllocation"),
        ]);

        setEmployees(empRes.data || []);
        setLeavePolicies(policyRes.data?.data || []);
        setExistingAllocations(allocationRes.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load form data");
      }
    };

    fetchData();
  }, []);

  /* ================= CHECK MAPPED ================= */
  const isEmployeeAlreadyMapped = (employeeId) => {
    return existingAllocations.some(
      (a) =>
        a.employeeId === employeeId &&
        a.leavePolicyId === Number(form.leavePolicyId) &&
        a.isActive
    );
  };

  /* ================= EMPLOYEE OPTIONS ================= */
  const employeeOptions = useMemo(() => {
    if (!form.leavePolicyId) return [];

    return employees.map((emp) => {
      const isMapped = isEmployeeAlreadyMapped(emp.id);

      return {
        value: emp.id,
        label: `${emp.fullName} (${emp.employeeCode})${
          isMapped ? " • Already mapped" : ""
        }`,
        isDisabled: isMapped, // ✅ KEY PART
      };
    });
  }, [employees, existingAllocations, form.leavePolicyId]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmployeeAlreadyMapped(Number(form.employeeId))) {
      toast.warning(
        "This employee is already mapped with the selected leave policy"
      );
      return;
    }

    try {
      const payload = {
        employeeId: Number(form.employeeId),
        leavePolicyId: Number(form.leavePolicyId),
        effectiveFrom: `${form.effectiveFrom}T00:00:00Z`,
        effectiveTo: `${form.effectiveTo}T00:00:00Z`,
      };

      await axiosInstance.post("/EmployeeLeavePolicyAllocation", payload);

      toast.success("Leave policy assigned successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to assign leave policy"
      );
    }
  };

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white relative p-6 rounded-lg shadow-lg w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-red-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-lg font-bold mb-4">Assign Leave Policy</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Policy */}
          <div>
            <label className="font-medium mb-1 block">Leave Policy</label>
            <Select
              options={leavePolicies}
              value={
                leavePolicies.find(
                  (p) => p.leavePolicyId === Number(form.leavePolicyId)
                ) || null
              }
              onChange={(val) =>
                setForm({
                  ...form,
                  leavePolicyId: val?.leavePolicyId || "",
                  employeeId: "", // reset employee
                })
              }
              getOptionLabel={(p) => `ID ${p.leavePolicyId} || ${p.policyName}`}
              getOptionValue={(p) => p.leavePolicyId}
              styles={customSelectStyles}
              placeholder="Select Leave Policy"
            />
          </div>

          {/* Employee */}
          <div>
            <label className="font-medium mb-1 block">Employee</label>
            <Select
              options={employeeOptions}
              value={employeeOptions.find(
                (o) => o.value === Number(form.employeeId)
              )}
              onChange={(opt) =>
                setForm({
                  ...form,
                  employeeId: opt?.value || "",
                })
              }
              isDisabled={!form.leavePolicyId}
              styles={customSelectStyles}
              placeholder={
                form.leavePolicyId ? "Select Employee" : "Select policy first"
              }
            />
          </div>

          {/* Dates */}
          <div>
            <label className="text-sm">Effective From</label>
            <input
              type="date"
              className={inputClass}
              value={form.effectiveFrom}
              onChange={(e) =>
                setForm({
                  ...form,
                  effectiveFrom: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm">Effective To</label>
            <input
              type="date"
              className={inputClass}
              value={form.effectiveTo}
              onChange={(e) =>
                setForm({
                  ...form,
                  effectiveTo: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded cursor-pointer hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLeavePolicyMappingForm;
