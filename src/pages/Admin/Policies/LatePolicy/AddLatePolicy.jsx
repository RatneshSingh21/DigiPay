import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FiX } from "react-icons/fi";

/* ================= CONSTANTS ================= */

const RESOLUTION_TYPES = [
  { value: "Ignore", label: "Ignore Late" },
  { value: "HalfDay", label: "Mark Half Day" },
  { value: "FullDay", label: "Mark Full Day" },
  { value: "Fine", label: "Apply Fine" },
  { value: "MakeUpHours", label: "Require Make-up Hours" },
  { value: "LeaveDeduction", label: "Deduct Leave" },
];

const RESOLUTION_TYPE_MAP = {
  Ignore: 0,
  Warning: 1,
  Fine: 2,
  HalfDay: 3,
  FullDay: 4,
  LeaveDeduction: 5,
  MakeUpHours: 6,
};

const smallSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: 32,
    fontSize: 11,
  }),

  valueContainer: (base) => ({
    ...base,
    maxHeight: "60px", // 🔥 cap height
    overflowY: "auto", // 🔥 scroll inside
    flexWrap: "wrap",
    padding: "2px 6px",
  }),

  multiValue: (base) => ({
    ...base,
    fontSize: 10,
    borderRadius: 4,
    maxWidth: "100%",
  }),

  multiValueLabel: (base) => ({
    ...base,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 80,
  }),

  indicatorsContainer: (base) => ({
    ...base,
    height: 32,
  }),

  menu: (base) => ({
    ...base,
    fontSize: 11,
    zIndex: 9999, // 🔥 float above modal
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999, // 🔥 REQUIRED for modals
  }),
};

/* ================= COMPONENT ================= */

export default function AddLatePolicy({
  onClose,
  isEdit = false,
  initialData = null,
  onSuccess,
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

    resolutionRules: [
      {
        fromLateMinutes: "",
        toLateMinutes: "",
        fromOccurrence: "",
        toOccurrence: "",
        useOccurrence: false,
        cutoffTime: "",
        resolutionType: "Ignore",
        amount: "",
        amountType: "",
        leaveType: "",
        priority: 1,
        isActive: true,
      },
    ],

    workTypeIds: [],
    shiftIds: [],
    departmentIds: [],
    locationIds: [],
  });

  const [shiftOptions, setShiftOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [workTypeOptions, setWorkTypeOptions] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);

  const selectAllOption = { value: "*", label: "Select All" };

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [shiftRes, deptRes, locRes, workTypeRes, leaveTypeRes] =
          await Promise.all([
            axiosInstance.get("/shift"),
            axiosInstance.get("/Department"),
            axiosInstance.get("/WorkLocation"),
            axiosInstance.get("/WorkTypeMaster/all"),
            axiosInstance.get("/LeaveType"),
          ]);

        // Shifts
        setShiftOptions(
          shiftRes.data.map((x) => ({
            value: x.id || x.shiftId,
            label: x.shiftName,
          }))
        );

        // Departments
        setDepartmentOptions(
          deptRes.data.map((x) => ({
            value: x.id || x.departmentId,
            label: x.name,
          }))
        );

        // Locations
        setLocationOptions(
          locRes.data.map((x) => ({
            value: x.id || x.locationId,
            label: x.name,
          }))
        );

        // Work Types
        setWorkTypeOptions(
          workTypeRes.data.data.map((x) => ({
            value: x.workTypeId,
            label: x.workTypeName,
          }))
        );

        // ✅ Leave Types (THIS FIXES YOUR ISSUE)
        setLeaveTypeOptions(
          leaveTypeRes.data
            .filter((l) => l.isActive)
            .map((l) => ({
              value: l.leaveTypeId,
              label: `${l.leaveName} (${l.leaveCode})`,
            }))
        );
      } catch (err) {
        console.error("Dropdown fetch error:", err);
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdownData();
  }, []);

  /* ================= HELPERS ================= */

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleMultiSelect = (key, selected, options) => {
    if (!selected) return handleChange(key, []);
    if (selected.at(-1)?.value === "*")
      handleChange(
        key,
        options.map((o) => o.value)
      );
    else
      handleChange(
        key,
        selected.map((s) => s.value)
      );
  };

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        policyName: initialData.policyName || "",
        description: initialData.description || "",
        effectiveFrom: initialData.effectiveFrom
          ? new Date(initialData.effectiveFrom).toISOString().slice(0, 16)
          : "",
        effectiveTo: initialData.effectiveTo
          ? new Date(initialData.effectiveTo).toISOString().slice(0, 16)
          : "",
        isActive: initialData.isActive ?? true,

        graceMinutesPerDay: initialData.graceMinutesPerDay ?? "",
        maxGraceOccurrences: initialData.maxGraceOccurrences ?? "",
        lateThresholdMinutes: initialData.lateThresholdMinutes ?? "",
        maxLateAllowedPerMonth: initialData.maxLateAllowedPerMonth ?? "",

        resolutionRules: initialData.resolutionRules?.map((r, i) => ({
          fromLateMinutes: r.fromLateMinutes ?? "",
          toLateMinutes: r.toLateMinutes ?? "",
          fromOccurrence: r.fromOccurrence ?? "",
          toOccurrence: r.toOccurrence ?? "",
          useOccurrence: r.useOccurrence ?? false,
          cutoffTime: r.cutoffTime || "00:00",
          resolutionType:
            Object.keys(RESOLUTION_TYPE_MAP).find(
              (k) => RESOLUTION_TYPE_MAP[k] === r.resolutionType
            ) || "Ignore",
          amount: r.amount ?? "",
          amountType: r.amountType || "Fixed",
          requiredMakeUpHours: r.requiredMakeUpHours ?? "",
          leaveType: r.leaveType || "",
          priority: i + 1,
          isActive: r.isActive ?? true,
        })) || [
            {
              fromLateMinutes: "",
              toLateMinutes: "",
              fromOccurrence: "",
              toOccurrence: "",
              useOccurrence: false,
              cutoffTime: "",
              resolutionType: "Ignore",
              amount: "",
              amountType: "",

              leaveType: "",
              priority: 1,
              isActive: true,
            },
          ],

        workTypeIds: initialData.workTypeIds || [],
        shiftIds: initialData.shiftIds || [],
        departmentIds: initialData.departmentIds || [],
        locationIds: initialData.locationIds || [],
      });
    }
  }, [isEdit, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // STEP NAVIGATION
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        policyName: form.policyName,
        description: form.description,
        effectiveFrom: new Date(form.effectiveFrom).toISOString(),
        effectiveTo: form.effectiveTo
          ? new Date(form.effectiveTo).toISOString()
          : null,
        isActive: form.isActive,
        graceMinutesPerDay: Number(form.graceMinutesPerDay),
        maxGraceOccurrences: Number(form.maxGraceOccurrences),
        lateThresholdMinutes: Number(form.lateThresholdMinutes),
        maxLateAllowedPerMonth: Number(form.maxLateAllowedPerMonth),
        resolutionRules: form.resolutionRules.map((r, i) => ({
          fromLateMinutes: Number(r.fromLateMinutes),
          toLateMinutes: Number(r.toLateMinutes),
          fromOccurrence: r.useOccurrence ? Number(r.fromOccurrence) : 0,
          toOccurrence: r.useOccurrence ? Number(r.toOccurrence) : 0,
          cutoffTime: r.cutoffTime || "00:00",
          resolutionType: RESOLUTION_TYPE_MAP[r.resolutionType] ?? 0,
          amount: Number(r.amount || 0),
          amountType: r.amountType || "Fixed",
          //requiredMakeUpHours: Number(r.requiredMakeUpHours || 0),
          leaveType: r.leaveType || "N/A",
          priority: i + 1,
          isActive: true,
        })),
        workTypeIds: form.workTypeIds,
        shiftIds: form.shiftIds,
        departmentIds: form.departmentIds,
        locationIds: form.locationIds,
      };

      if (isEdit && initialData?.latePolicyId) {
        // ✅ Edit / Update Existing Policy
        await axiosInstance.put(
          `/LatePolicy/update/${initialData.latePolicyId}`,
          payload
        );
        toast.success("Late policy updated successfully");
      } else {
        // ✅ Create New Policy
        await axiosInstance.post("/LatePolicy/create", payload);
        toast.success("Late policy created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEdit ? "update" : "create"} late policy`);
    } finally {
      setLoading(false);
    }
  };

  const updateRule = (i, k, v) => {
    const rules = [...form.resolutionRules];
    rules[i][k] = v;
    setForm({ ...form, resolutionRules: rules });
  };

  const addRule = () => {
    setForm((p) => ({
      ...p,
      resolutionRules: [
        ...p.resolutionRules,
        { ...p.resolutionRules[0], priority: p.resolutionRules.length + 1 },
      ],
    }));
  };

  const removeRule = (index) => {
    setForm((p) => ({
      ...p,
      resolutionRules: p.resolutionRules.filter((_, i) => i !== index),
    }));
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-40 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-4 max-h-[95vh] overflow-y-auto relative text-[11px]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 cursor-pointer hover:text-red-500 right-4 text-gray-500"
        >
          <FiX size={20} />
        </button>
        {/* STEPPER */}
        <div className="flex mb-4 text-xs">
          {["Policy", "Applicability", "Rules"].map((t, i) => (
            <div
              key={i}
              className={`flex-1 text-center py-1 border-b-2 ${step === i + 1
                ? "border-blue-500 font-semibold"
                : "border-gray-200 text-gray-400"
                }`}
            >
              {i + 1}. {t}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-2">
            <p className="text-gray-500 text-[11px]">
              Give this policy a clear name so HR and admins know when it
              applies. Example: <strong>“Grace + Fine Late Policy”</strong>
            </p>

            <input
              className={inputClass}
              placeholder="Policy Name (required)"
              value={form.policyName}
              onChange={(e) => handleChange("policyName", e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Short description (optional)"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />

            <p className="text-gray-500 text-[11px]">
              Set the time period during which this policy is active. Leave{" "}
              <strong>Effective To</strong> empty for ongoing policies.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                className={inputClass}
                value={form.effectiveFrom}
                onChange={(e) => handleChange("effectiveFrom", e.target.value)}
              />
              <input
                type="datetime-local"
                className={inputClass}
                value={form.effectiveTo}
                onChange={(e) => handleChange("effectiveTo", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Intro */}
            <p className="text-gray-500 text-[11px]">
              Configure how much lateness is allowed and decide exactly
              <strong> who this policy applies to</strong>. If nothing is
              selected, the policy applies to <strong>everyone</strong>.
            </p>

            {/* ================= NUMERIC SETTINGS ================= */}
            <div className="grid grid-cols-2 gap-3">
              {/* Grace Minutes */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Grace Minutes per Day
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.graceMinutesPerDay
                    ? `Currently set: ${form.graceMinutesPerDay} minutes`
                    : "Currently not set"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: Employee can be late by 10 minutes without penalty.
                </div>
                <input
                  className={inputClass}
                  placeholder="e.g. 10"
                  value={form.graceMinutesPerDay}
                  onChange={(e) =>
                    handleChange("graceMinutesPerDay", e.target.value)
                  }
                />
              </div>

              {/* Max Grace Occurrences */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Max Grace Occurrences (per month)
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.maxGraceOccurrences
                    ? `Currently set: ${form.maxGraceOccurrences} times`
                    : "Currently not set"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: Grace can be used only 5 times in a month.
                </div>
                <input
                  className={inputClass}
                  placeholder="e.g. 5"
                  value={form.maxGraceOccurrences}
                  onChange={(e) =>
                    handleChange("maxGraceOccurrences", e.target.value)
                  }
                />
              </div>

              {/* Late Threshold */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Late Threshold (minutes)
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.lateThresholdMinutes
                    ? `Currently set: ${form.lateThresholdMinutes} minutes`
                    : "Currently not set"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: After 30 minutes late, penalties start.
                </div>
                <input
                  className={inputClass}
                  placeholder="e.g. 30"
                  value={form.lateThresholdMinutes}
                  onChange={(e) =>
                    handleChange("lateThresholdMinutes", e.target.value)
                  }
                />
              </div>

              {/* Max Late Count */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Max Late Count (per month)
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.maxLateAllowedPerMonth
                    ? `Currently set: ${form.maxLateAllowedPerMonth} times`
                    : "Currently not set"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: Employee can be late only 3 times in a month.
                </div>
                <input
                  className={inputClass}
                  placeholder="e.g. 3"
                  value={form.maxLateAllowedPerMonth}
                  onChange={(e) =>
                    handleChange("maxLateAllowedPerMonth", e.target.value)
                  }
                />
              </div>
            </div>

            {/* ================= LIVE SUMMARY ================= */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-[10px] text-blue-700">
              <strong>Policy applies to:</strong>{" "}
              {[
                form.workTypeIds.length &&
                `${form.workTypeIds.length} work types`,
                form.shiftIds.length && `${form.shiftIds.length} shifts`,
                form.departmentIds.length &&
                `${form.departmentIds.length} departments`,
                form.locationIds.length &&
                `${form.locationIds.length} locations`,
              ]
                .filter(Boolean)
                .join(" · ") || "All employees"}
            </div>

            {/* ================= DROPDOWNS ================= */}
            <div className="grid grid-cols-2 gap-3">
              {/* Work Types */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Applies to Work Types
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.workTypeIds.length
                    ? `Selected: ${workTypeOptions
                      .filter((o) => form.workTypeIds.includes(o.value))
                      .map((o) => o.label)
                      .join(", ")}`
                    : "Applies to all work types"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: Only Full-Time and Contract employees.
                </div>
                <Select
                  isMulti
                  styles={smallSelectStyles}
                  menuPortalTarget={document.body}
                  options={[selectAllOption, ...workTypeOptions]}
                  value={workTypeOptions.filter((o) =>
                    form.workTypeIds.includes(o.value)
                  )}
                  onChange={(s) =>
                    handleMultiSelect("workTypeIds", s, workTypeOptions)
                  }
                  placeholder="Select work types (optional)"
                />
              </div>

              {/* Shifts */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Applies to Shifts
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.shiftIds.length
                    ? `Selected: ${shiftOptions
                      .filter((o) => form.shiftIds.includes(o.value))
                      .map((o) => o.label)
                      .join(", ")}`
                    : "Applies to all shifts"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: Morning and General shifts only.
                </div>
                <Select
                  isMulti
                  styles={smallSelectStyles}
                  options={[selectAllOption, ...shiftOptions]}
                  value={shiftOptions.filter((o) =>
                    form.shiftIds.includes(o.value)
                  )}
                  onChange={(s) =>
                    handleMultiSelect("shiftIds", s, shiftOptions)
                  }
                  placeholder="Select shifts (optional)"
                />
              </div>

              {/* Departments */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Applies to Departments
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.departmentIds.length
                    ? `Selected: ${departmentOptions
                      .filter((o) => form.departmentIds.includes(o.value))
                      .map((o) => o.label)
                      .join(", ")}`
                    : "Applies to all departments"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: HR and Engineering departments.
                </div>
                <Select
                  isMulti
                  styles={smallSelectStyles}
                  options={[selectAllOption, ...departmentOptions]}
                  value={departmentOptions.filter((o) =>
                    form.departmentIds.includes(o.value)
                  )}
                  onChange={(s) =>
                    handleMultiSelect("departmentIds", s, departmentOptions)
                  }
                  placeholder="Select departments (optional)"
                />
              </div>

              {/* Locations */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-700">
                  Applies to Locations
                </div>
                <div className="text-[10px] text-gray-500">
                  {form.locationIds.length
                    ? `Selected: ${locationOptions
                      .filter((o) => form.locationIds.includes(o.value))
                      .map((o) => o.label)
                      .join(", ")}`
                    : "Applies to all locations"}
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  Example: Bangalore office only.
                </div>
                <Select
                  isMulti
                  styles={smallSelectStyles}
                  options={[selectAllOption, ...locationOptions]}
                  value={locationOptions.filter((o) =>
                    form.locationIds.includes(o.value)
                  )}
                  onChange={(s) =>
                    handleMultiSelect("locationIds", s, locationOptions)
                  }
                  placeholder="Select locations (optional)"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-gray-500 text-[11px]">
              Define what should happen when an employee is late. Rules are
              evaluated <strong>top to bottom</strong>.
            </p>

            {form.resolutionRules.map((rule, i) => {
              const from = rule.fromLateMinutes || "—";
              const to = rule.toLateMinutes ? `${rule.toLateMinutes}` : "above";

              return (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3"
                >
                  {/* RULE HEADER */}
                  <div className="flex justify-between items-center">
                    <div className="text-[12px] font-semibold text-gray-700">
                      Rule {i + 1} · Late {from} – {to} minutes
                    </div>

                    {form.resolutionRules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(i)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* LATE RANGE */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-600">
                        From Late Minutes
                      </label>
                      <input
                        className={inputClass}
                        placeholder="e.g. 0"
                        value={rule.fromLateMinutes}
                        onChange={(e) =>
                          updateRule(i, "fromLateMinutes", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-600">
                        To Late Minutes (leave empty = above)
                      </label>
                      <input
                        className={inputClass}
                        placeholder="e.g. 10"
                        value={rule.toLateMinutes}
                        onChange={(e) =>
                          updateRule(i, "toLateMinutes", e.target.value)
                        }
                      />
                    </div>

                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rule.useOccurrence}
                      onChange={(e) => updateRule(i, "useOccurrence", e.target.checked)}
                    />
                    <label className="text-[10px] text-gray-600">
                      Apply occurrence condition
                    </label>
                  </div>
                  {/* OCCURRENCE RANGE */}
                  {rule.useOccurrence && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-600">
                          From Occurrence
                        </label>
                        <input
                          className={inputClass}
                          placeholder="e.g. 1"
                          value={rule.fromOccurrence}
                          onChange={(e) =>
                            updateRule(i, "fromOccurrence", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-600">
                          To Occurrence
                        </label>
                        <input
                          className={inputClass}
                          placeholder="e.g. 8"
                          value={rule.toOccurrence}
                          onChange={(e) =>
                            updateRule(i, "toOccurrence", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* ACTION */}
                  <div>
                    <label className="text-[10px] text-gray-600">
                      What should happen?
                    </label>
                    <Select
                      styles={smallSelectStyles}
                      options={RESOLUTION_TYPES}
                      value={RESOLUTION_TYPES.find(
                        (x) => x.value === rule.resolutionType
                      )}
                      onChange={(o) => updateRule(i, "resolutionType", o.value)}
                    />
                  </div>

                  {/* CONDITIONAL: FINE */}
                  {rule.resolutionType === "Fine" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-600">
                          Fine Amount
                        </label>
                        <input
                          className={inputClass}
                          placeholder="e.g. 200"
                          value={rule.amount}
                          onChange={(e) =>
                            updateRule(i, "amount", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-600">
                          Amount Type
                        </label>
                        <input
                          className={inputClass}
                          placeholder="Fixed / Percentage"
                          value={rule.amountType}
                          onChange={(e) =>
                            updateRule(i, "amountType", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* CONDITIONAL: MAKE UP HOURS */}
                  {rule.resolutionType === "MakeUpHours" && (
                    <div>
                      <label className="text-[10px] text-gray-600">
                        Required Make-up Hours
                      </label>
                      <input
                        className={inputClass}
                        placeholder="e.g. 1.5"
                        value={rule.requiredMakeUpHours}
                        onChange={(e) =>
                          updateRule(i, "requiredMakeUpHours", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* CONDITIONAL: LEAVE */}
                  {rule.resolutionType === "LeaveDeduction" && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-600">
                        Which leave should be deducted?
                      </label>

                      <Select
                        styles={smallSelectStyles}
                        options={leaveTypeOptions}
                        value={leaveTypeOptions.find(
                          (x) => x.value === rule.leaveType
                        )}
                        onChange={(opt) =>
                          updateRule(i, "leaveType", opt.value)
                        }
                        placeholder="Select Leave Type"
                      />

                      <div className="text-[10px] text-gray-400 italic">
                        Example: If employee is late beyond this limit, 1 day
                        will be deducted from the selected leave.
                      </div>
                    </div>
                  )}
                  {/* HUMAN SUMMARY */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-[10px] text-blue-700">
                    <strong>Summary:</strong> If employee is late{" "}
                    <strong>
                      {from} – {to}
                    </strong>{" "}
                    minutes → <strong>{rule.resolutionType}</strong>
                    {rule.resolutionType === "Fine" && rule.amount
                      ? ` (₹${rule.amount})`
                      : ""}
                  </div>
                </div>
              );
            })}

            {/* ADD RULE */}
            <button
              type="button"
              onClick={addRule}
              className=" flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition cursor-pointer"
            >
              + Add Another Rule
            </button>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            className="bg-gray-500 cursor-pointer text-white px-4 py-2 text-sm rounded"
          >
            Back
          </button>

          <button
            type="submit"
            className="bg-primary cursor-pointer text-white px-4 py-2 text-sm rounded"
          >
            {step < 3 ? "Next" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
