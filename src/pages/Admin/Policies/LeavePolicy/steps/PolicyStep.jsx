import React, { useEffect, useState } from "react";
import Select from "react-select";
import { fetchMasterLookups } from "../leaveService";

/* ================= SECTION ================= */
const Section = ({ title, description, children }) => (
  <div className="border rounded-lg p-4 bg-white space-y-3">
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

/* ================= INPUT ================= */
const InputField = ({
  label,
  helper,
  type = "text",
  value,
  onChange,
  disabled,
}) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <input
      type={type}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
    {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
  </div>
);

/* ================= REACT SELECT ================= */
const SelectField = ({ label, helper, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Select
      value={options.find((o) => o.value === value) || null}
      onChange={(opt) => onChange(opt ? opt.value : null)}
      options={options}
      isClearable
      placeholder="All"
      classNamePrefix="react-select"
    />
    {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
  </div>
);

/* ================= MAIN ================= */
const PolicyStep = ({ policy, setPolicy, sandwichRule, setSandwichRule }) => {
  const [lookups, setLookups] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterLookups()
      .then(setLookups)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading policy settings…</p>;
  }

  /* Convert lookup maps to react-select options */
  const mapToOptions = (map) =>
    Object.entries(map || {}).map(([id, name]) => ({
      value: Number(id),
      label: name,
    }));

  return (
    <div className="space-y-6">
      {/* ================= BASIC ================= */}
      <Section
        title="Basic Policy Information"
        description="General information used to identify and activate this policy."
      >
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Policy Name *"
            value={policy.policyName}
            onChange={(v) => setPolicy({ ...policy, policyName: v })}
            helper="Example: Default Leave Policy 2026"
          />

          <InputField
            label="Description"
            value={policy.description}
            onChange={(v) => setPolicy({ ...policy, description: v })}
            helper="Short explanation for internal reference"
          />

          <InputField
            label="Effective From *"
            type="datetime-local"
            value={
              policy.effectiveFrom ? policy.effectiveFrom.substring(0, 16) : ""
            }
            onChange={(v) => setPolicy({ ...policy, effectiveFrom: v })}
            helper="Date from which this policy becomes active"
          />

          <InputField
            label="Effective To"
            type="datetime-local"
            value={
              policy.effectiveTo ? policy.effectiveTo.substring(0, 16) : ""
            }
            onChange={(v) => setPolicy({ ...policy, effectiveTo: v })}
            helper="Leave empty if policy has no end date"
          />
        </div>

        <div className="flex flex-wrap gap-6 text-sm pt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={policy.isActive}
              onChange={(e) =>
                setPolicy({ ...policy, isActive: e.target.checked })
              }
            />
            Activate this policy immediately
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={policy.allowMixedLeaveTypes}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  allowMixedLeaveTypes: e.target.checked,
                })
              }
            />
            Allow combining different leave types
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={policy.blockLeaveIfAttendanceMissing}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  blockLeaveIfAttendanceMissing: e.target.checked,
                })
              }
            />
            Block leave if attendance is missing
          </label>
        </div>
      </Section>

      {/* ================= DATE RULES ================= */}
      <Section
        title="Leave Date Rules"
        description="Control when employees can apply for leave."
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={policy.allowBackdatedLeave}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  allowBackdatedLeave: e.target.checked,
                })
              }
            />
            Allow employees to apply leave for past dates
          </label>

          <InputField
            label="Backdated Limit (Days)"
            type="number"
            value={policy.backdatedLimitInDays}
            disabled={!policy.allowBackdatedLeave}
            onChange={(v) => setPolicy({ ...policy, backdatedLimitInDays: +v })}
            helper="Maximum days in the past leave can be applied"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={policy.allowFutureDatedLeave}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  allowFutureDatedLeave: e.target.checked,
                })
              }
            />
            Allow employees to apply leave in advance
          </label>

          <InputField
            label="Future Dated Limit (Days)"
            type="number"
            value={policy.futureDatedLimitInDays}
            disabled={!policy.allowFutureDatedLeave}
            onChange={(v) =>
              setPolicy({ ...policy, futureDatedLimitInDays: +v })
            }
            helper="How many days in advance leave can be applied"
          />

          <InputField
            label="Minimum Notice Period (Days)"
            type="number"
            value={policy.minNoticePeriodInDays}
            onChange={(v) =>
              setPolicy({ ...policy, minNoticePeriodInDays: +v })
            }
            helper="Minimum days before leave start that employee must apply"
          />
        </div>
      </Section>

      {/* ================= SANDWICH ================= */}
      <Section
        title="Sandwich Leave Rule"
        description="Decide whether gap days between two leave applications are also deducted."
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sandwichRule.enabled}
            onChange={(e) =>
              setSandwichRule({ ...sandwichRule, enabled: e.target.checked })
            }
          />
          Enable sandwich rule
        </label>

        {sandwichRule.enabled && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sandwichRule.bridgeGapDays}
                onChange={(e) =>
                  setSandwichRule({
                    ...sandwichRule,
                    bridgeGapDays: e.target.checked,
                  })
                }
              />
              Treat gap days as leave
            </label>

            <InputField
              label="Maximum Gap Days"
              type="number"
              value={sandwichRule.maxGapDays}
              onChange={(v) =>
                setSandwichRule({ ...sandwichRule, maxGapDays: +v })
              }
              helper="If gap is within this limit, sandwich applies"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sandwichRule.includeWeekends}
                onChange={(e) =>
                  setSandwichRule({
                    ...sandwichRule,
                    includeWeekends: e.target.checked,
                  })
                }
              />
              Include weekends
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sandwichRule.includeHolidays}
                onChange={(e) =>
                  setSandwichRule({
                    ...sandwichRule,
                    includeHolidays: e.target.checked,
                  })
                }
              />
              Include holidays
            </label>

            <label className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                checked={sandwichRule.applyAcrossLeaveTypes}
                onChange={(e) =>
                  setSandwichRule({
                    ...sandwichRule,
                    applyAcrossLeaveTypes: e.target.checked,
                  })
                }
              />
              Apply across different leave types
            </label>
          </div>
        )}
      </Section>

      {/* ================= APPLICABILITY ================= */}
      <Section
        title="Applicability Filters"
        description="Restrict this policy to specific employee groups."
      >
        <div className="grid grid-cols-3 gap-4">
          <SelectField
            label="Department"
            helper="Applies only to selected department"
            value={policy.departmentId}
            options={mapToOptions(lookups.departmentMap)}
            onChange={(v) => setPolicy({ ...policy, departmentId: v })}
          />
          <SelectField
            label="Designation"
            value={policy.designationId}
            options={mapToOptions(lookups.designationMap)}
            onChange={(v) => setPolicy({ ...policy, designationId: v })}
          />
          <SelectField
            label="Category / Grade"
            value={policy.gradeId}
            options={mapToOptions(lookups.categoryMap)}
            onChange={(v) => setPolicy({ ...policy, gradeId: v })}
          />
          <SelectField
            label="Role"
            value={policy.roleId}
            options={mapToOptions(lookups.roleMap)}
            onChange={(v) => setPolicy({ ...policy, roleId: v })}
          />
          <SelectField
            label="Work Location"
            value={policy.workLocationId}
            options={mapToOptions(lookups.locationMap)}
            onChange={(v) => setPolicy({ ...policy, workLocationId: v })}
          />
          <SelectField
            label="Shift"
            value={policy.shiftId}
            options={mapToOptions(lookups.shiftMap)}
            onChange={(v) => setPolicy({ ...policy, shiftId: v })}
          />
          <SelectField
            label="Employment Type"
            value={policy.employmentTypeId}
            options={mapToOptions(lookups.employmentTypeMap)}
            onChange={(v) => setPolicy({ ...policy, employmentTypeId: v })}
          />
        </div>
      </Section>
    </div>
  );
};

export default PolicyStep;
