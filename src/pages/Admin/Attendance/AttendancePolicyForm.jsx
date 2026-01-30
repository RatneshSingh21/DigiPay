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
    title: "Compliance Rules",
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

const otCalculationModeOptions = [
  { value: "Simple", label: "Simple" },
  { value: "ComplianceEmbedded", label: "Compliance Embedded" },
];

const otAttendanceCreditModeOptions = [
  { value: "None", label: "No Attendance Credit" },
  { value: "ConvertToAttendance", label: "Convert To Attendance" },
  { value: "CapAtFullDay", label: "CapAt FullDay" },
];

const otCalculationModeHints = {
  Simple:
    "Clean overtime calculation. OT is calculated separately and clearly visible.",
  ComplianceEmbedded:
    "Overtime is adjusted internally via compliance rules and may not appear explicitly.",
};

const otAttendanceCreditModeHints = {
  None: "Overtime will NOT affect attendance or payable days.",
  ConvertToAttendance:
    "Overtime hours can be converted into attendance credit.",
  CapAtFullDay:
    "Overtime can add attendance credit but will be capped at one full day.",
};

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

    otCalculationMode: "Simple",
    otDailyBaseDays: 0,
    includeOTInCompliance: true,
    otAttendanceCreditMode: "None",
    maxOTHoursPerDayForAttendance: null,
    maxAttendanceCreditPerDay: null,

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

      // 🔒 FINAL DB-SAFE NORMALIZATION
      if (payload.otAttendanceCreditMode === "None") {
        payload.maxOTHoursPerDayForAttendance = null;
        payload.maxAttendanceCreditPerDay = null;
      }

      if (initialData) {
        await axiosInstance.put(
          `/AttendancePolicy/${initialData.attendancePolicyId}`,
          payload,
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
      selectedValues.includes(o.value),
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
              {/* Policy Name */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Policy Name
                </label>
                <input
                  className={input}
                  name="policyName"
                  value={form.policyName}
                  onChange={handleChange}
                  placeholder="e.g. Office Attendance Policy"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  className={input}
                  rows={2}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Briefly explain what this policy controls"
                />
              </div>

              {/* Effective Dates */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Policy Effective Period
                </label>
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
              {/* Working Hours */}
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Working Hours Definition
                </label>
                <p className="text-[11px] text-gray-500">
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

              {/* OT Configuration */}
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Overtime Configuration
                </label>
                <p className="text-[11px] text-gray-500">
                  Define how overtime contributes to attendance and compliance.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* OT Calculation Mode */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      OT Calculation Mode
                    </label>

                    <Select
                      styles={selectStyles}
                      options={otCalculationModeOptions}
                      value={otCalculationModeOptions.find(
                        (o) => o.value === form.otCalculationMode,
                      )}
                      onChange={(opt) =>
                        setForm((f) => ({ ...f, otCalculationMode: opt.value }))
                      }
                      menuPortalTarget={document.body}
                    />

                    {/* Hint */}
                    {form.otCalculationMode && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {otCalculationModeHints[form.otCalculationMode]}
                      </p>
                    )}
                  </div>

                  {/* OT Attendance Credit Mode */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      OT Attendance Credit Mode
                    </label>

                    <Select
                      styles={selectStyles}
                      options={otAttendanceCreditModeOptions}
                      value={otAttendanceCreditModeOptions.find(
                        (o) => o.value === form.otAttendanceCreditMode,
                      )}
                      onChange={(opt) =>
                        setForm((f) => ({
                          ...f,
                          otAttendanceCreditMode: opt.value,

                          // HARD RESET based on DB constraint
                          maxOTHoursPerDayForAttendance:
                            opt.value === "None"
                              ? null
                              : (f.maxOTHoursPerDayForAttendance ?? 1),

                          maxAttendanceCreditPerDay:
                            opt.value === "ConvertToAttendance"
                              ? (f.maxAttendanceCreditPerDay ?? 1)
                              : null,
                        }))
                      }
                      menuPortalTarget={document.body}
                    />

                    {/* Hint */}
                    {form.otAttendanceCreditMode && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {
                          otAttendanceCreditModeHints[
                            form.otAttendanceCreditMode
                          ]
                        }
                      </p>
                    )}
                  </div>

                  {/* OT Base Days */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      OT Base Days
                    </label>
                    <input
                      className={input}
                      type="number"
                      name="otDailyBaseDays"
                      value={form.otDailyBaseDays}
                      onChange={handleChange}
                      placeholder="e.g. 26"
                    />
                  </div>

                  {/* Max OT Hours Per Day */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Max OT Hours / Day for Attendance
                    </label>
                    <input
                      className={input}
                      type="number"
                      name="maxOTHoursPerDayForAttendance"
                      value={form.maxOTHoursPerDayForAttendance ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxOTHoursPerDayForAttendance:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  {/* Max Attendance Credit Per Day */}
                  {form.otAttendanceCreditMode === "ConvertToAttendance" && (
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Max Attendance Credit / Day
                      </label>
                      <input
                        className={input}
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        name="maxAttendanceCreditPerDay"
                        value={form.maxAttendanceCreditPerDay ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            maxAttendanceCreditPerDay:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 text-sm mt-2">
                  <input
                    type="checkbox"
                    name="includeOTInCompliance"
                    checked={form.includeOTInCompliance}
                    onChange={handleChange}
                  />
                  Include OT in Compliance Calculation
                </label>
              </div>
            </>
          )}
          {step === 3 && (
            <>
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

          {step === 4 && (
            <>
              <p className="text-[11px] text-gray-500 mb-2">
                These settings control how attendance data is captured and
                processed by the system.
              </p>
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

          {step === 5 && (
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

          {step === 6 && (
            <>
              <p className="text-[11px] text-gray-500 mb-2">
                These settings control how attendance data is captured and
                processed by the system.
              </p>

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
              className="bg-primary cursor-pointer text-white px-4 py-2 text-sm rounded"
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
