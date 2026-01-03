import React from "react";
import { normalizeLeaveTypeKey } from "../normalizeLeaveTypeKey";
import { LEAVE_TYPE_CAPABILITIES } from "../leaveTypeCapabilities";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

/* ================= CREATE DEFAULT RULE BASED ON CAPABILITIES ================= */
const createDefaultRule = (leave) => {
  const key = normalizeLeaveTypeKey(leave);
  const caps = LEAVE_TYPE_CAPABILITIES[key] || {};

  return {
    leaveTypeId: leave.leaveTypeId,
    maxLeavesPerYear: 0,
    maxDaysPerApplication: 0,
    minDaysPerApplication: 0,
    minServiceMonthsRequired: 0,
    includeWeekends: caps.includeWeekends ?? true,
    includeHolidays: caps.includeHolidays ?? true,
    allowHalfDay: caps.halfDay ?? false,
    halfDayCutoffTime: "",
    isCarryForwardAllowed: caps.carryForward ?? false,
    carryForwardLimit: 0,
    isDocumentRequired: caps.documentRequired ?? false,
    documentRequiredAfterDays: 0,
    allowDuringNoticePeriod: true,
    genderRestriction: caps.genderRestriction || null,
  };
};

/* ================= LEAVE RULES STEP ================= */
const LeaveRulesStep = ({
  leaveTypes = [],
  selectedLeaveTypeIds = [],
  setSelectedLeaveTypeIds,
  leaveRules = {},
  setLeaveRules,
}) => {
  /* ===== TOGGLE LEAVE TYPE SELECTION ===== */
  const toggleLeaveType = (leave) => {
    const id = leave.leaveTypeId;
    setSelectedLeaveTypeIds((prev) => {
      if (prev.includes(id)) {
        const updated = { ...leaveRules };
        delete updated[id];
        setLeaveRules(updated);
        return prev.filter((x) => x !== id);
      }
      setLeaveRules((r) => ({
        ...r,
        [id]: createDefaultRule(leave), // use capability-based defaults
      }));
      return [...prev, id];
    });
  };

  /* ===== UPDATE RULE ===== */
  const updateRule = (id, changes) => {
    setLeaveRules((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...changes,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* ===== LEAVE TYPE SELECTION ===== */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">
          Applicable Leave Types
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {leaveTypes.map((lt) => (
            <label
              key={lt.leaveTypeId}
              className="flex gap-2 items-center text-sm text-gray-700"
            >
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selectedLeaveTypeIds.includes(lt.leaveTypeId)}
                onChange={() => toggleLeaveType(lt)}
              />
              {lt.leaveName}
            </label>
          ))}
        </div>
      </div>

      {/* ===== RULES FOR SELECTED TYPES ===== */}
      {selectedLeaveTypeIds.map((id) => {
        const leaveType = leaveTypes.find((lt) => lt.leaveTypeId === id);
        const rule = leaveRules[id] || createDefaultRule(leaveType);

        return (
          <div
            key={id}
            className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {leaveType?.leaveName || "Leave Type"} Rule
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Max Leaves / Year
                </label>
                <input
                  type="number"
                  value={rule.maxLeavesPerYear}
                  onChange={(e) =>
                    updateRule(id, { maxLeavesPerYear: +e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Max Days / Application
                </label>
                <input
                  type="number"
                  value={rule.maxDaysPerApplication}
                  onChange={(e) =>
                    updateRule(id, { maxDaysPerApplication: +e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Min Days / Application
                </label>
                <input
                  type="number"
                  value={rule.minDaysPerApplication}
                  onChange={(e) =>
                    updateRule(id, { minDaysPerApplication: +e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Min Service (Months)
                </label>
                <input
                  type="number"
                  value={rule.minServiceMonthsRequired}
                  onChange={(e) =>
                    updateRule(id, {
                      minServiceMonthsRequired: +e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* ===== CHECKBOXES ===== */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={rule.includeWeekends}
                  onChange={(e) =>
                    updateRule(id, { includeWeekends: e.target.checked })
                  }
                />
                Include Weekends
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={rule.includeHolidays}
                  onChange={(e) =>
                    updateRule(id, { includeHolidays: e.target.checked })
                  }
                />
                Include Holidays
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={rule.allowDuringNoticePeriod}
                  onChange={(e) =>
                    updateRule(id, {
                      allowDuringNoticePeriod: e.target.checked,
                    })
                  }
                />
                Allowed During Notice
              </label>
            </div>

            {/* ===== HALF DAY ===== */}
            <div className="mt-5">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={rule.allowHalfDay}
                  onChange={(e) =>
                    updateRule(id, {
                      allowHalfDay: e.target.checked,
                      halfDayCutoffTime: e.target.checked
                        ? rule.halfDayCutoffTime
                        : "",
                    })
                  }
                />
                Allow Half Day
              </label>
              {rule.allowHalfDay && (
                <input
                  type="time"
                  value={rule.halfDayCutoffTime}
                  onChange={(e) =>
                    updateRule(id, { halfDayCutoffTime: e.target.value })
                  }
                  className={`${inputClass} mt-2 w-48`}
                />
              )}
            </div>

            {/* ===== CARRY FORWARD ===== */}
            <div className="mt-5">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={rule.isCarryForwardAllowed}
                  onChange={(e) =>
                    updateRule(id, {
                      isCarryForwardAllowed: e.target.checked,
                      carryForwardLimit: e.target.checked
                        ? rule.carryForwardLimit
                        : 0,
                    })
                  }
                />
                Allow Carry Forward
              </label>
              {rule.isCarryForwardAllowed && (
                <input
                  type="number"
                  value={rule.carryForwardLimit}
                  onChange={(e) =>
                    updateRule(id, { carryForwardLimit: +e.target.value })
                  }
                  className={`${inputClass} mt-2 w-48`}
                />
              )}
            </div>

            {/* ===== DOCUMENT ===== */}
            <div className="mt-5">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={rule.isDocumentRequired}
                  onChange={(e) =>
                    updateRule(id, {
                      isDocumentRequired: e.target.checked,
                      documentRequiredAfterDays: e.target.checked
                        ? rule.documentRequiredAfterDays
                        : 0,
                    })
                  }
                />
                Document Required
              </label>
              {rule.isDocumentRequired && (
                <input
                  type="number"
                  value={rule.documentRequiredAfterDays}
                  onChange={(e) =>
                    updateRule(id, {
                      documentRequiredAfterDays: +e.target.value,
                    })
                  }
                  className={`${inputClass} mt-2 w-48`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaveRulesStep;
