import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import { X } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function EmployeeOtPermissionForm({
  initialData,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(initialData);

  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    employeeId: null,
    isAllowed: false,
    maxOTHoursPerDay: "",
    startAfterMinutes: "",
  });

  // Fetch employee list
  useEffect(() => {
    axiosInstance.get("/Employee").then((res) => {
      const list = res?.data ?? [];
      setEmployees(
        list.map((e) => ({
          label: `${e.fullName} (${e.employeeCode})`,
          value: e.id,
        })),
      );
    });
  }, []);

  // Prefill form on edit
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        employeeId: initialData.employeeId,
        isAllowed: initialData.isAllowed,
        maxOTHoursPerDay: initialData.maxOTHoursPerDay,
        startAfterMinutes: initialData.startAfterMinutes,
      });
    }
  }, [initialData]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    const payload = {
      ...form,
      employeeId: Number(form.employeeId),
      maxOTHoursPerDay: Number(form.maxOTHoursPerDay),
      startAfterMinutes: Number(form.startAfterMinutes),
    };

    try {
      setSaving(true);

      if (isEdit) {
        await axiosInstance.put(
          "/EmployeeOTPermission/updateOTPermission",
          payload,
        );
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post(
          "/EmployeeOTPermission/createOTPermission",
          payload,
        );
        toast.success("Created successfully");
      }

      onSuccess();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit OT Permission" : "Create OT Permission"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-red-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} className="p-6 space-y-3">
          {/* Employee Select */}
          <div>
            <label className="block text-gray-600 mb-1">Employee</label>
            <Select
              options={employees}
              value={employees.find((e) => e.value === form.employeeId)}
              onChange={(opt) =>
                setForm((p) => ({ ...p, employeeId: opt?.value }))
              }
              placeholder="Select employee..."
              className="text-sm"
            />
            <p className="text-gray-400 text-xs mt-1">
              Select the employee for whom this OT permission applies.
            </p>
          </div>

          {/* OT Allowed Toggle */}
          <div className="flex items-center gap-3">
            <label
              className="flex items-center cursor-pointer"
              onClick={() =>
                setForm((p) => ({ ...p, isAllowed: !p.isAllowed }))
              }
            >
              <div
                className={`relative w-11 h-6 transition-colors rounded-full ${
                  form.isAllowed ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    form.isAllowed ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="ml-3 text-gray-700 font-medium">Allow OT</span>
            </label>
            <p className="text-gray-400 text-xs">
              Enable to allow this employee to log overtime.
            </p>
          </div>

          {/* Max OT Hours */}
          <div>
            <label className="block text-gray-600 mb-1">
              Max OT Hours per Day
            </label>
            <input
              type="number"
              placeholder="Enter max OT hours"
              value={form.maxOTHoursPerDay}
              onChange={(e) =>
                setForm((p) => ({ ...p, maxOTHoursPerDay: e.target.value }))
              }
              className={inputClass}
            />
            <p className="text-gray-400 text-xs mt-1">
              Maximum hours allowed for OT per day.
            </p>
          </div>

          {/* Start After Minutes */}
          <div>
            <label className="block text-gray-600 mb-1">
              Start After Minutes
            </label>
            <input
              type="number"
              placeholder="Enter start after minutes"
              value={form.startAfterMinutes}
              onChange={(e) =>
                setForm((p) => ({ ...p, startAfterMinutes: e.target.value }))
              }
              className={inputClass}
            />
            <p className="text-gray-400 text-xs mt-1">
              Employee can log OT only after these many minutes.
            </p>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end border-t border-gray-300 text-sm gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-white cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
