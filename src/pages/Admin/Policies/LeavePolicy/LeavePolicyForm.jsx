import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

import PolicyStep from "./steps/PolicyStep";
import LeaveRulesStep from "./steps/LeaveRulesStep";
import CompOffStep from "./steps/CompOffStep";
import EncashmentStep from "./steps/EncashmentStep";
import AccrualStep from "./steps/AccrualStep";
import CarryForwardStep from "./steps/CarryForwardStep";
import BlackoutStep from "./steps/BlackoutStep";
import { FiX } from "react-icons/fi";

/* ================= STEPS CONFIG ================= */
const steps = [
  { key: "policy", label: "Policy Information", component: PolicyStep },
  { key: "leave", label: "Leave Rules", component: LeaveRulesStep },
  { key: "compOff", label: "Comp Off Rules", component: CompOffStep },
  { key: "encashment", label: "Encashment Rules", component: EncashmentStep },
  { key: "accrual", label: "Accrual Rules", component: AccrualStep },
  {
    key: "carryForward",
    label: "Carry Forward Rules",
    component: CarryForwardStep,
  },
  { key: "blackout", label: "Blackout Dates", component: BlackoutStep },
];

const LeavePolicyForm = ({ policyId, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= STATE ================= */
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [policy, setPolicy] = useState({
    policyName: "",
    description: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
    allowBackdatedLeave: false,
    backdatedLimitInDays: 0,
    allowFutureDatedLeave: false,
    futureDatedLimitInDays: 0,
    minNoticePeriodInDays: 0,
    allowMixedLeaveTypes: false,
    blockLeaveIfAttendanceMissing: false,
  });

  const [sandwichRule, setSandwichRule] = useState({
    enabled: false,
    bridgeGapDays: true,
    includeWeekends: true,
    includeHolidays: true,
    maxGapDays: 1,
    applyAcrossLeaveTypes: false,
  });

  const [selectedLeaveTypeIds, setSelectedLeaveTypeIds] = useState([]);
  const [leaveRules, setLeaveRules] = useState({});
  const [compOffRule, setCompOffRule] = useState({
    isEnabled: false,
    expiryInDays: 0,
    allowOnHoliday: false,
    allowOnWeekend: false,
  });
  const [encashmentRules, setEncashmentRules] = useState([]);
  const [accrualRules, setAccrualRules] = useState([]);
  const [carryForwardRules, setCarryForwardRules] = useState([]);
  const [blackoutDates, setBlackoutDates] = useState([]);

  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    axiosInstance
      .get("/LeaveType")
      .then((res) => setLeaveTypes(res.data || []))
      .catch(() => toast.error("Failed to load leave types"));
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/Department")
      .then((res) => setDepartments(res.data || []))
      .catch(() => toast.error("Failed to load departments"));
  }, []);

  /* ================= LOAD POLICY ================= */
  useEffect(() => {
    if (!policyId) return;

    setLoading(true);
    axiosInstance
      .get(`/LeavePolicy/${policyId}`)
      .then((res) => {
        const data = res.data?.data; // ✅ FIX

        if (!data) {
          toast.error("Invalid policy data received");
          return;
        }

        setPolicy({
          policyName: data.policyName || "",
          description: data.description || "",
          effectiveFrom: data.effectiveFrom
            ? data.effectiveFrom.split("T")[0]
            : "",
          effectiveTo: data.effectiveTo ? data.effectiveTo.split("T")[0] : "",
          isActive: data.isActive ?? true,
          allowBackdatedLeave: data.allowBackdatedLeave ?? false,
          backdatedLimitInDays: data.backdatedLimitInDays ?? 0,
          allowFutureDatedLeave: data.allowFutureDatedLeave ?? false,
          futureDatedLimitInDays: data.futureDatedLimitInDays ?? 0,
          minNoticePeriodInDays: data.minNoticePeriodInDays ?? 0,
          allowMixedLeaveTypes:
            data.allowMixedLeaveTypesInSingleApplication ?? false,
          blockLeaveIfAttendanceMissing:
            data.blockLeaveIfAttendanceMissing ?? false,
        });

     setSandwichRule({
  enabled: data.sandwichRule?.enabled ?? false,
  bridgeGapDays: data.sandwichRule?.bridgeGapDays ?? true,
  includeWeekends: data.sandwichRule?.includeWeekends ?? true,
  includeHolidays: data.sandwichRule?.includeHolidays ?? true,
  maxGapDays: data.sandwichRule?.maxGapDays ?? 1,
  applyAcrossLeaveTypes: data.sandwichRule?.applyAcrossLeaveTypes ?? false,
});


        setSelectedLeaveTypeIds(
          data.leaveTypeRules?.map((r) => r.leaveTypeId) || []
        );

        setLeaveRules(
          data.leaveTypeRules?.reduce(
            (acc, r) => ({ ...acc, [r.leaveTypeId]: r }),
            {}
          ) || {}
        );

        setCompOffRule(data.compOffRule || compOffRule);
        setEncashmentRules(data.encashmentRules || []);
        setAccrualRules(data.accrualRules || []);
        setCarryForwardRules(data.carryForwardRules || []);
        setBlackoutDates(
          (data.blackoutDates || []).map((b) => ({
            title: b.title || "",
            fromDate: b.fromDate ? b.fromDate.split("T")[0] : "",
            toDate: b.toDate ? b.toDate.split("T")[0] : "",
            isFullBlock: b.isFullBlock ?? true,

            // ✅ MATCH UI FIELD NAMES
            applicableLeaveTypeIds: Array.isArray(b.applicableLeaveTypeIds)
              ? b.applicableLeaveTypeIds
              : [],

            applicableDepartmentIds: Array.isArray(b.applicableDepartmentIds)
              ? b.applicableDepartmentIds
              : [],
          }))
        );
      })
      .catch(() => toast.error("Failed to fetch leave policy"))
      .finally(() => setLoading(false));
  }, [policyId]);

  /* ================= SUBMIT ================= */
 const handleSubmit = async () => {
  if (!policy.policyName || !policy.effectiveFrom) {
    toast.error("Policy Name and Effective From are required");
    return;
  }

  const payload = {
    // ================= BASIC POLICY =================
    ...policy,

    departmentId: policy.departmentId ?? 0,
    designationId: 0,
    gradeId: 0,
    roleId: 0,
    workLocationId: 0,
    shiftId: 0,
    employmentTypeId: 0,

    effectiveFrom: new Date(policy.effectiveFrom).toISOString(),
    ...(policy.effectiveTo && {
      effectiveTo: new Date(policy.effectiveTo).toISOString(),
    }),

    // ================= SANDWICH RULE =================
    sandwichRule: {
      enabled: sandwichRule.enabled,
      bridgeGapDays: sandwichRule.bridgeGapDays,
      includeWeekends: sandwichRule.includeWeekends,
      includeHolidays: sandwichRule.includeHolidays,
      maxGapDays: sandwichRule.enabled ? sandwichRule.maxGapDays : 0,
      applyAcrossLeaveTypes: sandwichRule.applyAcrossLeaveTypes,
    },

    // ================= LEAVE TYPE RULES =================
    leaveTypeRules: Object.values(leaveRules).map((r) => ({
      leaveTypeId: r.leaveTypeId,
      maxLeavesPerYear: r.maxLeavesPerYear ?? 0,
      maxDaysPerApplication: r.maxDaysPerApplication ?? 0,
      minDaysPerApplication: r.minDaysPerApplication ?? 0,
      minServiceMonthsRequired: r.minServiceMonthsRequired ?? 0,
      includeWeekends: r.includeWeekends ?? true,
      includeHolidays: r.includeHolidays ?? true,
      allowHalfDay: r.allowHalfDay ?? false,

      // 🔥 CRITICAL FIX (TimeSpan-safe)
      halfDayCutoffTime:
        r.allowHalfDay && r.halfDayCutoffTime
          ? r.halfDayCutoffTime.length === 5
            ? `${r.halfDayCutoffTime}:00`
            : r.halfDayCutoffTime
          : null,

      isCarryForwardAllowed: r.isCarryForwardAllowed ?? false,
      carryForwardLimit: r.carryForwardLimit ?? 0,
      isDocumentRequired: r.isDocumentRequired ?? false,
      documentRequiredAfterDays: r.documentRequiredAfterDays ?? 0,
      allowDuringNoticePeriod: r.allowDuringNoticePeriod ?? false,
      genderRestriction: r.genderRestriction || null,
    })),

    // ================= COMP OFF =================
    compOffRule: {
      isEnabled: compOffRule.isEnabled,
      expiryInDays: compOffRule.expiryInDays ?? 0,
      allowOnHoliday: compOffRule.allowOnHoliday,
      allowOnWeekend: compOffRule.allowOnWeekend,
    },

    // ================= ENCASHMENT =================
    encashmentRules: encashmentRules
      .filter((r) => r.leaveTypeId && r.leaveTypeId > 0)
      .map((r) => ({
        leaveTypeId: r.leaveTypeId,
        isEncashmentAllowed: r.isEncashmentAllowed ?? false,
        maxEncashableDaysPerYear: r.maxEncashableDaysPerYear ?? 0,
        minBalanceRequired: r.minBalanceRequired ?? 0,
        allowAtYearEnd: r.allowAtYearEnd ?? false,
        allowDuringResignation: r.allowDuringResignation ?? false,
        allowDuringRetirement: r.allowDuringRetirement ?? false,
        encashmentCalculationType: r.encashmentCalculationType || null,
      })),

    // ================= ACCRUAL =================
    accrualRules: accrualRules.map((r) => ({
      leaveTypeId: r.leaveTypeId,
      policyCode: r.policyCode || "",
      frequency: r.frequency,
      accrualValue: r.accrualValue ?? 0,
      prorateOnJoin: r.prorateOnJoin ?? true,
      prorateOnLeave: r.prorateOnLeave ?? true,
      accrualStartsAfterServiceMonths:
        r.accrualStartsAfterServiceMonths ?? 0,
      effectiveFrom: r.effectiveFrom
        ? new Date(r.effectiveFrom).toISOString()
        : null,
      effectiveTo: r.effectiveTo
        ? new Date(r.effectiveTo).toISOString()
        : null,
      extraJson: r.extraJson || null,
    })),

    // ================= CARRY FORWARD =================
    carryForwardRules: carryForwardRules.map((r) => ({
      leaveTypeId: r.leaveTypeId,
      allowCarryForward: r.allowCarryForward ?? false,
      maxCarryForwardDays: r.maxCarryForwardDays ?? 0,
      carryForwardExpiryInMonths:
        r.carryForwardExpiryInMonths ?? 0,
      carryForwardProrated: r.carryForwardProrated ?? false,
      conditionsJson: r.conditionsJson || null,
    })),

    // ================= BLACKOUT =================
    blackoutDates: blackoutDates.map((bd) => ({
      title: bd.title || "",
      fromDate: new Date(bd.fromDate).toISOString(),
      toDate: new Date(bd.toDate).toISOString(),
      isFullBlock: bd.isFullBlock ?? true,
      applicableLeaveTypeIds: bd.applicableLeaveTypeIds || [],
      applicableDepartmentIds: bd.applicableDepartmentIds || [],
    })),
  };

  try {
    setLoading(true);
    policyId
      ? await axiosInstance.put(`/LeavePolicy/update/${policyId}`, payload)
      : await axiosInstance.post("/LeavePolicy/create", payload);

    toast.success("Leave policy saved successfully");
    onSuccess?.();
    onClose?.();
  } catch (err) {
    toast.error(err?.response?.data?.message || "Save failed");
  } finally {
    setLoading(false);
  }
};


  const CurrentStepComponent = steps[currentStep].component;

  /* ================= UI ================= */
  return (
    <div>
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border">
        {/* Header */}
        <div className="flex relative justify-between items-center px-6 py-2 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Leave Policy
            </h2>
            <p className="text-sm text-gray-500">
              Configure leave rules step by step
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 cursor-pointer hover:text-red-500 right-4 text-gray-500"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {steps.map((step, index) => (
              <span
                key={step.key}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  index === currentStep
                    ? "bg-blue-600 text-white"
                    : index < currentStep
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6 min-h-[420px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {steps[currentStep].label}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Fill in the required details for this step
          </p>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <CurrentStepComponent
              leaveTypes={leaveTypes}
              departments={departments}
              policy={policy}
              setPolicy={setPolicy}
              sandwichRule={sandwichRule}
              setSandwichRule={setSandwichRule}
              selectedLeaveTypeIds={selectedLeaveTypeIds}
              setSelectedLeaveTypeIds={setSelectedLeaveTypeIds}
              leaveRules={leaveRules}
              setLeaveRules={setLeaveRules}
              compOffRule={compOffRule}
              setCompOffRule={setCompOffRule}
              encashmentRules={encashmentRules}
              setEncashmentRules={setEncashmentRules}
              accrualRules={accrualRules}
              setAccrualRules={setAccrualRules}
              carryForwardRules={carryForwardRules}
              setCarryForwardRules={setCarryForwardRules}
              blackoutDates={blackoutDates}
              setBlackoutDates={setBlackoutDates}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          {/* Back */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2 rounded border cursor-pointer bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-100"
            >
              Back
            </button>
          </div>

          {/* Next / Save */}
          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !policy.policyName || !policy.effectiveFrom}
              className={`px-6 py-2 rounded text-white font-medium flex items-center gap-2
        ${
          loading || !policy.policyName || !policy.effectiveFrom
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-primary hover:bg-secondary cursor-pointer"
        }`}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Saving..." : "Save Policy"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary cursor-pointer"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyForm;
