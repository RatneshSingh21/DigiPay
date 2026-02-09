import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import Select from "react-select";
import { FiX, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import WeekendRuleCard from "./WeekendRuleCard";

/* ===================== TOGGLE CARD ===================== */
const SettingCard = ({ title, description, children, warning }) => (
  <div
    className={`rounded-lg border border-gray-200 p-4 space-y-3 ${
      warning ? "bg-yellow-50 border-yellow-300" : "bg-gray-50"
    }`}
  >
    <div className="space-y-1">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        {warning && <FiAlertTriangle className="text-yellow-600" />}
        {title}
      </h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    {children}
  </div>
);

const Toggle = ({ label, value, onChange, hint }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
    <Switch
      checked={value}
      onChange={onChange}
      className={`${
        value ? "bg-primary" : "bg-gray-300"
      } relative inline-flex h-5 w-10 items-center rounded-full`}
    >
      <span
        className={`${
          value ? "translate-x-5" : "translate-x-1"
        } inline-block h-4 w-4 transform bg-white rounded-full`}
      />
    </Switch>
  </div>
);

/* ===================== COMPONENT ===================== */
const AddWeekendPolicy = ({ onClose, onSuccess, isEdit, initialData }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [govtApproved, setGovtApproved] = useState(false);
  const [halfDayCredit, setHalfDayCredit] = useState(0.5);

  const [policy, setPolicy] = useState({
    policyName: "",
    sundayOff: true,
    mondayOff: false,
    tuesdayOff: false,
    wednesdayOff: false,
    thursdayOff: false,
    fridayOff: false,
    saturdayOff: false,
    isHalfDayApplicable: false,
    allowWeekendOverride: false,
    allowShiftOverride: false,
    allowEmployeeOverride: false,
    isActive: true,
  });

  const [rules, setRules] = useState([]);

  const updatePolicy = (k, v) => setPolicy((p) => ({ ...p, [k]: v }));

  const addRule = () => {
    setRules((r) => [
      ...r,
      {
        workDay: "Sunday",
        targetType: policy.allowEmployeeOverride ? "Employee" : "Shift",
        targetId: 0,
        useShiftTiming: true,
        compensationType: "Salary",
        workingDayCredit: 1,
        isGovernmentApproved: govtApproved,
        effectiveFrom: new Date().toISOString(),
        effectiveTo: null,
        isActive: true,
      },
    ]);
  };

  const submit = async () => {
    if (policy.allowWeekendOverride && !govtApproved)
      return toast.error("Government approval must be confirmed");

    if (policy.allowWeekendOverride && rules.length === 0)
      return toast.error("At least one weekend rule is required");

    setLoading(true);

    try {
      const payload = {
        ...policy,
        weekendWorkRules: rules.map((r) => ({
          ...r,
          workingDayCredit: policy.isHalfDayApplicable
            ? halfDayCredit
            : r.workingDayCredit,
        })),
      };

      if (isEdit === "Edit" && initialData?.weekendPolicyId) {
        // UPDATE
        await axiosInstance.put(
          `/WeekendPolicy/${initialData.weekendPolicyId}`,
          payload
        );
        toast.success("Weekend policy updated successfully");
      } else {
        // CREATE
        await axiosInstance.post(
          "/WeekendPolicy/insert-Weekend-policy",
          payload
        );
        toast.success("Weekend policy activated successfully");
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error("Failed to save policy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setPolicy({
        policyName: initialData.policyName || "",
        sundayOff: initialData.sundayOff,
        mondayOff: initialData.mondayOff,
        tuesdayOff: initialData.tuesdayOff,
        wednesdayOff: initialData.wednesdayOff,
        thursdayOff: initialData.thursdayOff,
        fridayOff: initialData.fridayOff,
        saturdayOff: initialData.saturdayOff,
        isHalfDayApplicable: initialData.isHalfDayApplicable,
        allowWeekendOverride: initialData.allowWeekendOverride,
        allowShiftOverride: initialData.allowShiftOverride,
        allowEmployeeOverride: initialData.allowEmployeeOverride,
        isActive: initialData.isActive,
      });

      setRules(initialData.weekendWorkRules || []);

      // restore half-day credit safely
      const credit = initialData.weekendWorkRules?.[0]?.workingDayCredit;
      if (credit) setHalfDayCredit(credit);

      setGovtApproved(
        initialData.weekendWorkRules?.some((r) => r.isGovernmentApproved) ||
          false
      );
    }
  }, [isEdit, initialData]);

  const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-xl relative p-6 space-y-6 max-h-[80vh] overflow-y-scroll">
        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">Weekend Policy Setup</h2>
            <p className="text-xs text-gray-500">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 cursor-pointer hover:text-red-500 right-4 text-gray-500"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* ===================== STEP 1 ===================== */}
        {step === 1 && (
          <SettingCard
            title="Base Weekend Rules"
            description="Define which days are considered non-working by default."
          >
            <input
              className={inputClass}
              placeholder="Policy Name (e.g. IT Support - Sunday Allowed)"
              value={policy.policyName}
              onChange={(e) => updatePolicy("policyName", e.target.value)}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((d) => (
                <Toggle
                  key={d}
                  label={`${d} Off`}
                  value={policy[`${d.toLowerCase()}Off`]}
                  onChange={(v) => updatePolicy(`${d.toLowerCase()}Off`, v)}
                />
              ))}
            </div>
          </SettingCard>
        )}

        {/* ===================== STEP 2 ===================== */}
        {step === 2 && (
          <SettingCard
            title="Workday Modifiers"
            description="Control how special working days affect attendance and payroll."
          >
            <Toggle
              label="Half-Day Working"
              hint="Common in factories, logistics, operations"
              value={policy.isHalfDayApplicable}
              onChange={(v) => updatePolicy("isHalfDayApplicable", v)}
            />

            {policy.isHalfDayApplicable && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Half-Day Credit Calculation
                </label>

                <Select
                  value={[
                    { value: 0.5, label: "Count as Half Day (0.5)" },
                    { value: 1, label: "Count as Full Day (1.0)" },
                  ].find((opt) => opt.value === halfDayCredit)}
                  onChange={(opt) => setHalfDayCredit(Number(opt.value))}
                  options={[
                    { value: 0.5, label: "Count as Half Day (0.5)" },
                    { value: 1, label: "Count as Full Day (1.0)" },
                  ]}
                  isSearchable={false}
                  classNames={{
                    control: () =>
                      "border border-blue-300 min-h-[36px] text-sm rounded",
                  }}
                />

                <p className="text-xs text-gray-500">
                  Defines how attendance is credited when half-day working is
                  enabled.
                </p>
              </div>
            )}

            <Toggle
              label="Shift-Based Rules"
              hint="Apply weekend rules using shift timings"
              value={policy.allowShiftOverride}
              onChange={(v) => updatePolicy("allowShiftOverride", v)}
            />

            <Toggle
              label="Employee-Specific Rules"
              hint="Apply weekend rules only to selected employees"
              value={policy.allowEmployeeOverride}
              onChange={(v) => updatePolicy("allowEmployeeOverride", v)}
            />
          </SettingCard>
        )}

        {/* ===================== STEP 3 ===================== */}
        {step === 3 && (
          <SettingCard
            title="Allow Weekend Work"
            description="Enable only when weekend work is legally permitted."
            warning
          >
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={govtApproved}
                onChange={(e) => setGovtApproved(e.target.checked)}
              />
              <span>
                I confirm that weekend work under this policy complies with
                applicable labor and government regulations.
              </span>
            </label>

            <Toggle
              label="Allow Weekend Work"
              hint="This enables exception-based weekend attendance"
              value={policy.allowWeekendOverride}
              onChange={(v) => updatePolicy("allowWeekendOverride", v)}
            />

            {policy.allowWeekendOverride && (
              <>
                <button
                  onClick={addRule}
                  className="bg-primary cursor-pointer text-white px-4 py-2 text-sm rounded"
                >
                  + Add Weekend Rule
                </button>

                {rules.map((rule, idx) => (
                  <WeekendRuleCard
                    key={idx}
                    rule={rule}
                    onChange={(r) =>
                      setRules((all) => all.map((x, i) => (i === idx ? r : x)))
                    }
                    onRemove={() =>
                      setRules((r) => r.filter((_, i) => i !== idx))
                    }
                  />
                ))}
              </>
            )}

            {policy.allowWeekendOverride && (
              <div className="bg-green-50 p-3 rounded-md text-xs text-green-700 flex gap-2">
                <FiCheckCircle />
                This policy will dynamically count weekend work in payroll.
              </div>
            )}
          </SettingCard>
        )}

        {/* FOOTER */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-gray-500 cursor-pointer text-white px-4 py-2 text-sm rounded"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-primary cursor-pointer text-white px-4 py-2 text-sm rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="bg-primary cursor-pointer text-white px-4 py-2 text-sm rounded"
            >
              {loading ? "Activating..." : "Activate Policy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddWeekendPolicy;
