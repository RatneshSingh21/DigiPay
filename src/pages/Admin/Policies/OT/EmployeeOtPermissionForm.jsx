// EmployeeOtPermissionForm.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const inputClass =
  "w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

export default function EmployeeOtPermissionForm({
  initialData = null,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(initialData);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employeeId: null,
    isAllowed: false,
    maxOTHoursPerDay: "",
  });

  // Load employees for react-select
  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await axiosInstance.get("/Employee");
      const list = res?.data ?? [];
      const opts = list.map((e) => ({
        label: `${e.fullName} ${e.employeeCode ? `(${e.employeeCode})` : ""}`,
        value: e.id,
      }));
      setEmployees(opts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Populate form when initialData arrives (edit mode)
  useEffect(() => {
    if (initialData) {
      setForm({
        employeeId:
          typeof initialData.employeeId === "number"
            ? initialData.employeeId
            : Number(initialData.employeeId) || null,
        isAllowed:
          typeof initialData.isAllowed === "boolean"
            ? initialData.isAllowed
            : initialData.isAllowed === 1 || initialData.isAllowed === "true",
        maxOTHoursPerDay:
          initialData.maxOTHoursPerDay ?? initialData.maxHours ?? "",
      });
    } else {
      // reset for create
      setForm({
        employeeId: null,
        isAllowed: false,
        maxOTHoursPerDay: "",
      });
    }
  }, [initialData]);

  // Ensure react-select shows selected option (it needs employees loaded)
  const selectedEmployeeOption =
    employees.find((o) => o.value === form.employeeId) || null;

  const validate = () => {
    if (!form.employeeId) {
      toast.error("Please select an employee");
      return false;
    }
    if (form.maxOTHoursPerDay === "" || isNaN(Number(form.maxOTHoursPerDay))) {
      toast.error("Please enter valid max OT hours per day (number)");
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
        employeeId: Number(form.employeeId),
        isAllowed: Boolean(form.isAllowed),
        maxOTHoursPerDay: Number(form.maxOTHoursPerDay),
      };

      // API is a POST createOrUpdate (single endpoint)
      const res = await axiosInstance.post(
        "/EmployeeOTPermission/createOTPermission",
        payload
      );

      toast.success(isEdit ? "Updated OT permission" : "Created OT permission");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save");
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
        className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 cursor-pointer right-3 text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit" : "Create"} Employee OT Permission
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Employee</label>
            <Select
              options={employees}
              isLoading={loadingEmployees}
              value={selectedEmployeeOption}
              onChange={(opt) =>
                setForm((p) => ({ ...p, employeeId: opt?.value || null }))
              }
              placeholder="Select employee..."
              isClearable
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isAllowed"
              type="checkbox"
              checked={Boolean(form.isAllowed)}
              onChange={() =>
                setForm((p) => ({ ...p, isAllowed: !p.isAllowed }))
              }
            />
            <label htmlFor="isAllowed" className="text-sm">
              Allow OT
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Max OT Hours per Day
            </label>
            <input
              type="number"
              className={inputClass}
              value={form.maxOTHoursPerDay}
              onChange={(e) =>
                setForm((p) => ({ ...p, maxOTHoursPerDay: e.target.value }))
              }
              min={0}
            />
          </div>

          <div className="flex justify-end gap-3 text-sm">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border cursor-pointer"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary cursor-pointer text-white disabled:opacity-60"
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
