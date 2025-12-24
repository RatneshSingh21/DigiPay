import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import WeekendRuleCard from "./WeekendRuleCard";

/* ===================== TOGGLE ===================== */
const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <Switch
      checked={value}
      onChange={onChange}
      className={`${
        value ? "bg-primary" : "bg-gray-300"
      } relative inline-flex h-5 w-10 items-center rounded-full transition`}
    >
      <span
        className={`${
          value ? "translate-x-5" : "translate-x-1"
        } inline-block h-4 w-4 transform bg-white rounded-full transition`}
      />
    </Switch>
  </div>
);

/* ===================== COMPONENT ===================== */
const AddWeekendPolicy = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  /* ===================== POLICY STATE ===================== */
  const [policy, setPolicy] = useState({
    policyName: "",

    sundayOff: true,
    mondayOff: false,
    tuesdayOff: false,
    wednesdayOff: false,
    thursdayOff: false,
    fridayOff: false,
    saturdayOff: false,

    isAlternateSaturdayOff: false,
    firstSaturdayOff: false,
    secondSaturdayOff: false,
    thirdSaturdayOff: false,
    fourthSaturdayOff: false,
    fifthSaturdayOff: false,

    isHalfDayApplicable: false,
    halfDayOn: null,
    halfDayStartTime: null,
    halfDayEndTime: null,

    allowWeekendOverride: false,
    allowShiftOverride: false,
    allowEmployeeOverride: false,

    isActive: true,
  });

  /* ===================== RULES ===================== */
  const [rules, setRules] = useState([]);

  const updatePolicy = (key, value) =>
    setPolicy((p) => ({ ...p, [key]: value }));

  /* ===================== ADD RULE ===================== */
  const addRule = () => {
    setRules((r) => [
      ...r,
      {
        workDay: "Sunday",
        targetType: "Shift",
        targetId: 0,
        useShiftTiming: true,
        startTime: null,
        endTime: null,
        compensationType: "Salary",
        workingDayCredit: 1,
        isGovernmentApproved: true,
        effectiveFrom: new Date().toISOString(),
        effectiveTo: null,
        isActive: true,
      },
    ]);
  };

  /* ===================== VALIDATION ===================== */
  const validate = () => {
    if (!policy.policyName.trim()) {
      toast.error("Policy name is required");
      return false;
    }

    if (policy.isHalfDayApplicable) {
      if (!policy.halfDayOn) return toast.error("Select half-day day"), false;

      if (!policy.halfDayStartTime || !policy.halfDayEndTime)
        return toast.error("Half-day timings required"), false;
    }

    if (policy.allowWeekendOverride && rules.length === 0) {
      toast.error("At least one weekend work rule is required");
      return false;
    }

    return true;
  };

  /* ===================== SUBMIT ===================== */
  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await axiosInstance.post("/WeekendPolicy/insert-Weekend-policy", {
        ...policy,
        weekendWorkRules: rules,
      });

      toast.success("Weekend policy created successfully");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl rounded-xl p-5 max-h-[95vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Weekend Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* POLICY NAME */}
        <input
          className="input w-full mb-4"
          placeholder="Policy Name"
          value={policy.policyName}
          onChange={(e) => updatePolicy("policyName", e.target.value)}
        />

        {/* WEEKLY OFF */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <Toggle
              key={day}
              label={`${day} Off`}
              value={policy[`${day.toLowerCase()}Off`]}
              onChange={(v) => updatePolicy(`${day.toLowerCase()}Off`, v)}
            />
          ))}
        </div>

        {/* HALF DAY */}
        <Toggle
          label="Half Day Applicable"
          value={policy.isHalfDayApplicable}
          onChange={(v) => updatePolicy("isHalfDayApplicable", v)}
        />

        {policy.isHalfDayApplicable && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            <select
              className="input"
              onChange={(e) => updatePolicy("halfDayOn", e.target.value)}
            >
              <option value="">Select Day</option>
              <option>Sunday</option>
              <option>Saturday</option>
            </select>

            <input
              type="time"
              className="input"
              onChange={(e) =>
                updatePolicy("halfDayStartTime", `${e.target.value}:00`)
              }
            />

            <input
              type="time"
              className="input"
              onChange={(e) =>
                updatePolicy("halfDayEndTime", `${e.target.value}:00`)
              }
            />
          </div>
        )}

        {/* ALTERNATE SATURDAY */}
        <div className="mt-4">
          <Toggle
            label="Alternate Saturday Off"
            value={policy.isAlternateSaturdayOff}
            onChange={(v) => updatePolicy("isAlternateSaturdayOff", v)}
          />

          {policy.isAlternateSaturdayOff && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[
                ["firstSaturdayOff", "1st Saturday"],
                ["secondSaturdayOff", "2nd Saturday"],
                ["thirdSaturdayOff", "3rd Saturday"],
                ["fourthSaturdayOff", "4th Saturday"],
                ["fifthSaturdayOff", "5th Saturday"],
              ].map(([key, label]) => (
                <Toggle
                  key={key}
                  label={label}
                  value={policy[key]}
                  onChange={(v) => updatePolicy(key, v)}
                />
              ))}
            </div>
          )}
        </div>

        {/* OVERRIDES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <Toggle
            label="Weekend Override"
            value={policy.allowWeekendOverride}
            onChange={(v) => updatePolicy("allowWeekendOverride", v)}
          />
          <Toggle
            label="Shift Override"
            value={policy.allowShiftOverride}
            onChange={(v) => updatePolicy("allowShiftOverride", v)}
          />
          <Toggle
            label="Employee Override"
            value={policy.allowEmployeeOverride}
            onChange={(v) => updatePolicy("allowEmployeeOverride", v)}
          />
        </div>

        {/* RULE ENGINE */}
        {policy.allowWeekendOverride && (
          <>
            <button
              type="button"
              onClick={addRule}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md"
            >
              + Add Weekend Rule
            </button>

            <div className="space-y-3 mt-4">
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
            </div>
          </>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="bg-primary text-white px-6 py-2 rounded-md"
          >
            {loading ? "Saving..." : "Save Policy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWeekendPolicy;
