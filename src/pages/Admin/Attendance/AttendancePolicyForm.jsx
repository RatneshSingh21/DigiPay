import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { fetchAllAttendancePolicyOptions } from "../../../services/attendancePolicyService";

/* ===================== STYLES ===================== */
const selectStyles = {
  control: (p) => ({ ...p, minHeight: 36, fontSize: 12 }),
  option: (p) => ({ ...p, fontSize: 12 }),
  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

const input =
  "w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500";

/* ===================== STEP META ===================== */
const STEPS = [
  {
    title: "Basic Policy Details",
    subtitle: "Give this policy a clear identity and time range",
  },
  {
    title: "Who Does This Apply To?",
    subtitle: "Define where and to whom this policy applies",
  },
  {
    title: "Attendance Rules",
    subtitle: "Working hours, late rules, overtime & weekends",
  },
  {
    title: "Payroll & Leave Impact",
    subtitle: "How attendance affects salary and leave",
  },
  {
    title: "System Behaviour",
    subtitle: "Automation, approvals and system controls",
  },
  {
    title: "Advanced Rules",
    subtitle: "Optional expert-level configuration",
  },
];

/* ===================== COMPONENT ===================== */
const AttendancePolicyForm = ({ onClose, onSuccess, initialData }) => {
  const [step, setStep] = useState(0);
  const [options, setOptions] = useState({});
  const [showJson, setShowJson] = useState(false);

  const [form, setForm] = useState({
    policyName: "",
    description: "",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: new Date().toISOString().split("T")[0],
    isActive: true,

    fullDayHours: 8,
    halfDayHours: 4,

    shiftIds: [],
    workTypeIds: [],
    departmentIds: [],
    locationIds: [],
    latePolicyIds: [],
    otRateSlabIds: [],
    paymentAdjustmentIds: [],
    holidayListIds: [],
    leaveTypeIds: [],
    weekendPolicyIds: [],
    weekendPolicyMappingIds: [],

    attendanceInputConfig: {
      enableBiometric: true,
      enableFaceRecognition: true,
      enableGeoFencing: true,
      allowMobilePunch: true,
      allowManualCorrection: true,
      manualCorrectionApprovalRequired: true,
    },

    escalationConfig: {
      lateEscalationLevel: 0,
      absentEscalationLevel: 0,
      otEscalationLevel: 0,
      notifyManager: true,
      notifyHR: true,
      notifyPayroll: true,
      autoWorkflowTrigger: true,
    },

    salaryIntegration: {
      autoCalculateOT: true,
      autoCalculateLateDeduction: true,
      autoAdjustLeaveEncashment: true,
      autoApplyBonus: true,
      autoApplySpecialAllowance: true,
    },

    exceptionHandling: {
      allowShiftSwap: true,
      allowWFHAdjustment: true,
      allowCompOffAdjustment: true,
      manualOverrideAllowed: true,
      auditRequired: true,
    },

    additionalMetadataJson: "{}",
  });

  /* ================= LOAD OPTIONS ================= */
  useEffect(() => {
    fetchAllAttendancePolicyOptions()
      .then(setOptions)
      .catch(() => toast.error("Failed to load options"));
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      ...initialData,
      effectiveFrom: initialData.effectiveFrom?.split("T")[0],
      effectiveTo: initialData.effectiveTo?.split("T")[0],
      additionalMetadataJson: initialData.additionalMetadataJson || "{}",
    });
    if (initialData.additionalMetadataJson !== "{}") setShowJson(true);
  }, [initialData]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name.includes(".")) {
      const [p, c] = name.split(".");
      setForm((f) => ({
        ...f,
        [p]: { ...f[p], [c]: type === "checkbox" ? checked : value },
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const submit = async () => {
    try {
      const payload = {
        ...form,
        additionalMetadataJson: showJson ? form.additionalMetadataJson : "{}",
      };

      if (initialData) {
        await axiosInstance.put(
          `/AttendancePolicy/${initialData.attendancePolicyId}`,
          payload
        );
      } else {
        await axiosInstance.post("/AttendancePolicy", payload);
      }

      toast.success("Attendance Policy saved successfully");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    }
  };

  const Multi = ({ field, label, hint }) => {
    const fieldOptions = options[field] || [];
    const selectedValues = form[field] || [];

    const allSelected =
      fieldOptions.length > 0 && selectedValues.length === fieldOptions.length;

    const enhancedOptions = [
      {
        value: "__all__",
        label: allSelected ? "Clear All" : "Select All",
      },
      ...fieldOptions,
    ];

    const selectedObjects = enhancedOptions.filter((o) =>
      selectedValues.includes(o.value)
    );

    return (
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">
          {label}
        </label>

        {hint && <p className="text-[11px] text-gray-500 mb-1">{hint}</p>}

        <Select
          isMulti
          styles={selectStyles}
          options={enhancedOptions}
          value={selectedObjects}
          menuPortalTarget={document.body}
          onChange={(selected) => {
            if (!selected) {
              setForm((f) => ({ ...f, [field]: [] }));
              return;
            }

            const hasAll = selected.some((s) => s.value === "__all__");

            if (hasAll) {
              setForm((f) => ({
                ...f,
                [field]: allSelected ? [] : fieldOptions.map((o) => o.value),
              }));
            } else {
              setForm((f) => ({
                ...f,
                [field]: selected.map((s) => s.value),
              }));
            }
          }}
        />
      </div>
    );
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 cursor-pointer hover:text-red-500 right-4 text-gray-500"
        >
          <FiX size={20} />
        </button>

        {/* PROGRESS */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{STEPS[step].title}</span>
            <span>
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <div className="h-1 bg-gray-200 rounded">
            <div
              className="h-1 bg-blue-600 rounded transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* HEADER */}
        <h2 className="text-lg font-semibold">{STEPS[step].title}</h2>
        <p className="text-sm text-gray-600 mb-4">{STEPS[step].subtitle}</p>

        {/* STEP CONTENT */}
        <div className="space-y-4">
          {step === 0 && (
            <>
              <input
                className={input}
                name="policyName"
                value={form.policyName}
                onChange={handleChange}
                placeholder="Policy name (e.g. Office Attendance Policy)"
              />
              <textarea
                className={input}
                rows={2}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What does this policy do?"
              />
              <div className="flex gap-3">
                <input
                  type="date"
                  className={input}
                  name="effectiveFrom"
                  value={form.effectiveFrom}
                  onChange={handleChange}
                />
                <input
                  type="date"
                  className={input}
                  name="effectiveTo"
                  value={form.effectiveTo}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Multi
                field="shiftIds"
                label="Applicable Shifts"
                hint="Only employees working under these shifts will follow this policy."
              />

              <Multi
                field="workTypeIds"
                label="Work Types"
                hint="Select employment types like Full Time, Part Time, Contractual, etc."
              />

              <Multi
                field="departmentIds"
                label="Departments"
                hint="Restrict this policy to specific departments if required."
              />

              <Multi
                field="locationIds"
                label="Work Locations"
                hint="Useful when attendance rules differ by branch or site."
              />
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Working Hours Definition
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  These values decide how the system marks Full Day and Half Day
                  attendance.
                </p>

                <div className="flex gap-3">
                  <input
                    className={input}
                    type="number"
                    name="fullDayHours"
                    value={form.fullDayHours}
                    onChange={handleChange}
                    placeholder="Full day hours"
                  />
                  <input
                    className={input}
                    type="number"
                    name="halfDayHours"
                    value={form.halfDayHours}
                    onChange={handleChange}
                    placeholder="Half day hours"
                  />
                </div>
              </div>

              <Multi
                field="latePolicyIds"
                label="Late Arrival Rules"
                hint="Controls penalties, grace periods, or half-day rules for late punches."
              />

              <Multi
                field="otRateSlabIds"
                label="Overtime Rules"
                hint="Defines how overtime is calculated and paid."
              />

              <Multi
                field="weekendPolicyIds"
                label="Weekend Policies"
                hint="Determines weekly offs, alternate Saturdays, or weekend work rules."
              />
            </>
          )}
          {step === 3 && (
            <>
              <Multi
                field="paymentAdjustmentIds"
                label="Salary Adjustments"
                hint="Bonuses, deductions, or attendance-based adjustments linked to payroll."
              />

              <Multi
                field="holidayListIds"
                label="Holiday Lists"
                hint="Public or company holidays applicable under this policy."
              />

              <Multi
                field="leaveTypeIds"
                label="Leave Types"
                hint="Leaves that interact with attendance calculations."
              />
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-[11px] text-gray-500 mb-2">
                These settings control how attendance data is captured and
                processed by the system.
              </p>

              {Object.entries(form.attendanceInputConfig).map(([k, v]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`attendanceInputConfig.${k}`}
                    checked={v}
                    onChange={handleChange}
                  />
                  {k.replace(/([A-Z])/g, " $1")}
                </label>
              ))}
            </>
          )}

          {step === 5 && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showJson}
                  onChange={(e) => setShowJson(e.target.checked)}
                />
                Enable advanced configuration (JSON)
              </label>
              {showJson && (
                <textarea
                  rows={4}
                  className={`${input} font-mono`}
                  name="additionalMetadataJson"
                  value={form.additionalMetadataJson}
                  onChange={handleChange}
                />
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center mt-6 border-t pt-4">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="bg-gray-500 cursor-pointer text-white px-4 py-2 text-sm rounded"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-primary cursor-pointer text-white px-4 py-2 text-sm rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              className="bg-green-600 text-white px-4 py-2 text-sm rounded"
            >
              Save Policy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePolicyForm;
