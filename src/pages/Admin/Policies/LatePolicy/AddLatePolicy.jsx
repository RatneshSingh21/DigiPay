import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import useAuthStore from "../../../../store/authStore";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

export default function AddLatePolicy({
  onClose,
  isEdit = false,
  initialData = null,
  onSuccess,
}) {
  const auth = useAuthStore ? useAuthStore() : null;
  const createdBy =
    auth && auth.user ? auth.user.userId || auth.user.id || null : null;

  const [form, setForm] = useState({
    policyName: "",
    description: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
    graceMinutesPerDay: "",
    maxGraceOccurrences: "",
    lateThresholdMinutes: "",
    maxLateAllowedPerMonth: "",
    deductHalfDay: false,
    deductFullDay: false,
    deductionAmount: "",
    deductionType: "",
    autoAdjustWithLeave: false,
    allowCompOffAdjustment: false,
    leaveAdjustmentPriority: "",
    escalationLevel: "",
    notifyManager: false,
    notifyHR: false,
    notifyPayroll: false,
    allowWorkFromHomeAdjustment: false,
    allowShiftSwap: false,
    createdBy: createdBy || "",
    workTypeIds: [],
    shiftIds: [],
    departmentIds: [],
    locationIds: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shiftOptions, setShiftOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shiftRes = await axiosInstance.get("/shift");
        setShiftOptions(
  shiftRes.data.map((s) => ({ value: s.id, label: s.shiftName }))
);

        const deptRes = await axiosInstance.get("/Department");
        setDepartmentOptions(
          deptRes.data.map((d) => ({ value: d.id, label: d.name }))
        );

        const locRes = await axiosInstance.get("/WorkLocation");
        setLocationOptions(
          locRes.data.map((l) => ({ value: l.id, label: l.name }))
        );
      } catch {
        toast.error("Failed to fetch options");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isEdit && initialData) {
      const toLocalDateTime = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setForm((prev) => ({
        ...prev,
        ...initialData,
        effectiveFrom: toLocalDateTime(initialData.effectiveFrom),
        effectiveTo: toLocalDateTime(initialData.effectiveTo),
      }));
    }
  }, [isEdit, initialData]);

  const validate = () => {
    const e = {};
    if (!form.policyName) e.policyName = "Policy name is required.";
    if (!form.effectiveFrom) e.effectiveFrom = "Effective From is required.";
    if (form.effectiveFrom && form.effectiveTo) {
      if (new Date(form.effectiveFrom) > new Date(form.effectiveTo))
        e.effectiveTo = "Effective To must be after Effective From.";
    }
    if (form.deductionAmount && isNaN(Number(form.deductionAmount)))
      e.deductionAmount = "Deduction amount must be numeric.";
    if (form.escalationLevel && isNaN(Number(form.escalationLevel)))
      e.escalationLevel = "Escalation level must be numeric.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleCheckboxChange = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const toISO = (val) => (val ? new Date(val).toISOString() : null);
      const payload = {
        ...form,
        effectiveFrom: toISO(form.effectiveFrom),
        effectiveTo: toISO(form.effectiveTo),
        createdBy: form.createdBy ? Number(form.createdBy) : null,
        createdOn: new Date().toISOString(),
      };

      const res = isEdit
        ? await axiosInstance.put(
            `/LatePolicy/update/${initialData?.latePolicyId}`,
            payload
          )
        : await axiosInstance.post("/LatePolicy/create", payload);

      setLoading(false);
      if (res && (res.status === 200 || res.status === 201)) {
        toast.success(
          isEdit
            ? "Late Policy updated successfully!"
            : "Late Policy created successfully!"
        );
        onSuccess?.(res.data);
        onClose?.();
      }
    } catch (err) {
      setLoading(false);
      toast.error(
        err?.response?.data?.message || err.message || "Failed to save"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative p-8 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          {isEdit ? "Edit" : "Create"} Late Policy
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Policy Name */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Policy Name
              </label>
              <input
                type="text"
                value={form.policyName}
                onChange={(e) => handleChange("policyName", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-xs ${
                  errors.policyName
                    ? "border-red-500"
                    : "border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                }`}
                autoFocus
              />
              {errors.policyName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.policyName}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Effective From */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Effective From
              </label>
              <input
                type="datetime-local"
                value={form.effectiveFrom}
                onChange={(e) => handleChange("effectiveFrom", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-xs ${
                  errors.effectiveFrom
                    ? "border-red-500"
                    : "border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                }`}
              />
              {errors.effectiveFrom && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.effectiveFrom}
                </p>
              )}
            </div>

            {/* Effective To */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Effective To
              </label>
              <input
                type="datetime-local"
                value={form.effectiveTo}
                onChange={(e) => handleChange("effectiveTo", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-xs ${
                  errors.effectiveTo
                    ? "border-red-500"
                    : "border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                }`}
              />
              {errors.effectiveTo && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.effectiveTo}
                </p>
              )}
            </div>

            {/* Deduction Type */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Deduction Type
              </label>
              <input
                type="text"
                value={form.deductionType}
                onChange={(e) => handleChange("deductionType", e.target.value)}
                placeholder="e.g., Fixed, Percentage"
                className="w-full border rounded-lg px-3 py-2 text-xs border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Deduction Amount */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Deduction Amount
              </label>
              <input
                type="number"
                value={form.deductionAmount}
                onChange={(e) => handleChange("deductionAmount", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-xs ${
                  errors.deductionAmount
                    ? "border-red-500"
                    : "border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                }`}
              />
              {errors.deductionAmount && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.deductionAmount}
                </p>
              )}
            </div>

            {/* Other numeric fields */}
            {[
              ["Grace Minutes Per Day", "graceMinutesPerDay"],
              ["Max Grace Occurrences", "maxGraceOccurrences"],
              ["Late Threshold (Minutes)", "lateThresholdMinutes"],
              ["Max Late Allowed Per Month", "maxLateAllowedPerMonth"],
              ["Leave Adjustment Priority", "leaveAdjustmentPriority"],
              ["Escalation Level", "escalationLevel"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs ${
                    errors[key]
                      ? "border-red-500"
                      : "border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  }`}
                />
                {errors[key] && (
                  <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
                )}
              </div>
            ))}

            {/* Work Type IDs */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Work Type IDs (comma separated)
              </label>
              <input
                type="text"
                value={form.workTypeIds.join(",")}
                onChange={(e) =>
                  handleChange(
                    "workTypeIds",
                    e.target.value.split(",").map((v) => v.trim())
                  )
                }
                placeholder="e.g., 1,2,3"
                className="w-full border rounded-lg px-3 py-2 text-xs border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Shift, Department, Location Selects */}
          <div>
            <label className="block text-xs font-medium mb-1">Shifts</label>
            <Select
              isMulti
              options={shiftOptions}
              value={shiftOptions.filter((o) => form.shiftIds.includes(o.value))}
              onChange={(selected) =>
                handleChange(
                  "shiftIds",
                  selected.map((s) => s.value)
                )
              }
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Departments</label>
            <Select
              isMulti
              options={departmentOptions}
              value={departmentOptions.filter((o) =>
                form.departmentIds.includes(o.value)
              )}
              onChange={(selected) =>
                handleChange(
                  "departmentIds",
                  selected.map((s) => s.value)
                )
              }
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Locations</label>
            <Select
              isMulti
              options={locationOptions}
              value={locationOptions.filter((o) =>
                form.locationIds.includes(o.value)
              )}
              onChange={(selected) =>
                handleChange(
                  "locationIds",
                  selected.map((s) => s.value)
                )
              }
              className="text-xs"
            />
          </div>

          {/* Checkbox Group */}
          <div className="grid grid-cols-2 gap-3">
            {[
              "deductHalfDay",
              "deductFullDay",
              "autoAdjustWithLeave",
              "allowCompOffAdjustment",
              "notifyManager",
              "notifyHR",
              "notifyPayroll",
              "allowWorkFromHomeAdjustment",
              "allowShiftSwap",
              "isActive",
            ].map((key) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={() => handleCheckboxChange(key)}
                  className="h-4 w-4 accent-primary"
                />
                <span>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}
                </span>
              </label>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary cursor-pointer text-white disabled:opacity-60"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
