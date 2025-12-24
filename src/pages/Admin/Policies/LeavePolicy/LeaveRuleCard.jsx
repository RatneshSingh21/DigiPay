import React from "react";

const LeaveRuleCard = ({ leave, rule, onChange }) => {
  return (
    <div className="border rounded-lg p-4 mt-4 bg-gray-50">
      <h4 className="font-semibold text-lg mb-2">{leave.name || leave.leaveName}</h4>

      <div className="grid grid-cols-2 gap-4">

        {/* Max Leaves Per Year */}
        <div>
          <label className="text-xs">Max Leaves / Year</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={rule.maxLeavesPerYear}
            onChange={e => onChange("maxLeavesPerYear", +e.target.value)}
          />
        </div>

        {/* Max Days Per Application */}
        <div>
          <label className="text-xs">Max Days / Application</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={rule.maxDaysPerApplication}
            onChange={e => onChange("maxDaysPerApplication", +e.target.value)}
          />
        </div>

        {/* Min Days Per Application */}
        <div>
          <label className="text-xs">Min Days / Application</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={rule.minDaysPerApplication}
            onChange={e => onChange("minDaysPerApplication", +e.target.value)}
          />
        </div>

        {/* Min Service Months Required */}
        <div>
          <label className="text-xs">Min Service Months Required</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={rule.minServiceMonthsRequired}
            onChange={e => onChange("minServiceMonthsRequired", +e.target.value)}
          />
        </div>

        {/* Include Weekends */}
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={rule.includeWeekends}
            onChange={e => onChange("includeWeekends", e.target.checked)}
          />
          Include Weekends
        </label>

        {/* Include Holidays */}
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={rule.includeHolidays}
            onChange={e => onChange("includeHolidays", e.target.checked)}
          />
          Include Holidays
        </label>

        {/* Allow Half Day */}
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={rule.allowHalfDay}
            onChange={e => onChange("allowHalfDay", e.target.checked)}
          />
          Allow Half Day
        </label>

        {/* Half Day Cutoff Time */}
        {rule.allowHalfDay && (
          <div>
            <label className="text-xs">Half Day Cutoff Time</label>
            <input
              type="time"
              className="border p-2 rounded w-full"
              value={rule.halfDayCutoffTime || ""}
              onChange={e => onChange("halfDayCutoffTime", e.target.value)}
            />
          </div>
        )}

        {/* Carry Forward */}
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={rule.isCarryForwardAllowed}
            onChange={e => onChange("isCarryForwardAllowed", e.target.checked)}
          />
          Carry Forward Allowed
        </label>

        {/* Carry Forward Limit */}
        {rule.isCarryForwardAllowed && (
          <div>
            <label className="text-xs">Carry Forward Limit</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={rule.carryForwardLimit}
              onChange={e => onChange("carryForwardLimit", +e.target.value)}
            />
          </div>
        )}

        {/* Document Required */}
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={rule.isDocumentRequired}
            onChange={e => onChange("isDocumentRequired", e.target.checked)}
          />
          Document Required
        </label>

        {/* Document Required After Days */}
        {rule.isDocumentRequired && (
          <div>
            <label className="text-xs">Document Required After Days</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={rule.documentRequiredAfterDays}
              onChange={e => onChange("documentRequiredAfterDays", +e.target.value)}
            />
          </div>
        )}

        {/* Allow During Notice Period */}
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={rule.allowDuringNoticePeriod}
            onChange={e => onChange("allowDuringNoticePeriod", e.target.checked)}
          />
          Allow During Notice Period
        </label>

        {/* Gender Restriction */}
        <div>
          <label className="text-xs">Gender Restriction</label>
          <select
            className="border p-2 rounded w-full"
            value={rule.genderRestriction || ""}
            onChange={e => onChange("genderRestriction", e.target.value)}
          >
            <option value="">None</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LeaveRuleCard;
