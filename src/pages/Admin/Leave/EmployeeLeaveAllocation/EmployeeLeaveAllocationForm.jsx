// EmployeeLeaveAllocationForm.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const inputClass =
  "w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

export default function EmployeeLeaveAllocationForm({
  onClose,
  onSuccess,
  initialData = null, // if present => edit mode
}) {
  const isEdit = Boolean(initialData);

  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    allocationId: null,
    employeeId: null,
    leaveTypeId: null,
    totalLeavesAllocated: "",
    leavesTaken: "",
    leavesRemaining: "",
    year: new Date().getFullYear(),
    isActive: true,
  });

  // load employees & leaveTypes
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [empRes, ltRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/LeaveType"),
        ]);

        const empOpts = (empRes?.data || []).map((e) => ({
          value: e.employeeId || e.id,
          label: `${e.fullName} (${e.employeeCode || e.employeeId})`,
        }));

        const ltOpts = (ltRes?.data || []).map((lt) => ({
          value: lt.leaveTypeId || lt.id,
          label: lt.leaveName,
        }));

        setEmployees(empOpts);
        setLeaveTypes(ltOpts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employees or leave types.");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // populate form if editing
  useEffect(() => {
    if (initialData) {
      setForm({
        allocationId: initialData.allocationId ?? null,
        employeeId:
          typeof initialData.employeeId === "number"
            ? initialData.employeeId
            : Number(initialData.employeeId) || null,
        leaveTypeId:
          typeof initialData.leaveTypeId === "number"
            ? initialData.leaveTypeId
            : Number(initialData.leaveTypeId) || null,
        totalLeavesAllocated: initialData.totalLeavesAllocated ?? "",
        leavesTaken: initialData.leavesTaken ?? "",
        leavesRemaining: initialData.leavesRemaining ?? "",
        year: initialData.year ?? new Date().getFullYear(),
        isActive:
          typeof initialData.isActive === "boolean"
            ? initialData.isActive
            : initialData.isActive === 1 || initialData.isActive === "true",
      });
    }
  }, [initialData]);

  // calculate leavesRemaining on change if desired
  useEffect(() => {
    const total = Number(form.totalLeavesAllocated || 0);
    const taken = Number(form.leavesTaken || 0);
    const remaining = Math.max(0, total - taken);
    // only auto-set when user hasn't manually changed leavesRemaining to something else
    setForm((prev) => ({ ...prev, leavesRemaining: remaining }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.totalLeavesAllocated, form.leavesTaken]);

  const validate = () => {
    if (!form.employeeId) {
      toast.error("Please select an Employee.");
      return false;
    }
    if (!form.leaveTypeId) {
      toast.error("Please select a Leave Type.");
      return false;
    }
    if (
      form.totalLeavesAllocated === "" ||
      isNaN(Number(form.totalLeavesAllocated))
    ) {
      toast.error("Please enter total leaves allocated (numeric).");
      return false;
    }
    if (form.year === "" || isNaN(Number(form.year))) {
      toast.error("Please enter valid year.");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        allocationId: form.allocationId,
        employeeId: Number(form.employeeId),
        leaveTypeId: Number(form.leaveTypeId),
        totalLeavesAllocated: Number(form.totalLeavesAllocated),
        leavesTaken: Number(form.leavesTaken || 0),
        leavesRemaining: Number(form.leavesRemaining || 0),
        year: Number(form.year),
        isActive: Boolean(form.isActive),
      };

      let res;
      if (isEdit) {
        res = await axiosInstance.put("/EmployeeLeaveAllocation", payload);
      } else {
        res = await axiosInstance.post("/EmployeeLeaveAllocation", payload);
      }

      toast.success(isEdit ? "Allocation updated" : "Allocation created");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save allocation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 cursor-pointer text-gray-600"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit" : "Create"} Leave Allocation
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Employee */}
            <div>
              <label className="block text-xs font-medium mb-1">Employee</label>
              <Select
                isLoading={loadingOptions}
                options={employees}
                value={
                  employees.find((o) => o.value === form.employeeId) || null
                }
                onChange={(opt) =>
                  setForm((prev) => ({
                    ...prev,
                    employeeId: opt?.value || null,
                  }))
                }
                placeholder="Select employee..."
              />
            </div>

            {/* Leave Type */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Leave Type
              </label>
              <Select
                isLoading={loadingOptions}
                options={leaveTypes}
                value={
                  leaveTypes.find((o) => o.value === form.leaveTypeId) || null
                }
                onChange={(opt) =>
                  setForm((prev) => ({
                    ...prev,
                    leaveTypeId: opt?.value || null,
                  }))
                }
                placeholder="Select leave type..."
              />
            </div>

            {/* Total Allocated */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Total Leaves Allocated
              </label>
              <input
                type="number"
                className={inputClass}
                value={form.totalLeavesAllocated}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    totalLeavesAllocated: e.target.value,
                  }))
                }
              />
            </div>

            {/* Leaves Taken */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Leaves Taken
              </label>
              <input
                type="number"
                className={inputClass}
                value={form.leavesTaken}
                onChange={(e) =>
                  setForm((p) => ({ ...p, leavesTaken: e.target.value }))
                }
              />
            </div>

            {/* Leaves Remaining */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Leaves Remaining
              </label>
              <input
                type="number"
                className={inputClass}
                value={form.leavesRemaining}
                onChange={(e) =>
                  setForm((p) => ({ ...p, leavesRemaining: e.target.value }))
                }
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-medium mb-1">Year</label>
              <input
                type="number"
                className={inputClass}
                value={form.year}
                onChange={(e) =>
                  setForm((p) => ({ ...p, year: e.target.value }))
                }
              />
            </div>

            {/* IsActive */}
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={() =>
                  setForm((p) => ({ ...p, isActive: !p.isActive }))
                }
              />
              <label htmlFor="isActive" className="text-sm">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg cursor-pointer text-sm border"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-sm cursor-pointer text-white disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
