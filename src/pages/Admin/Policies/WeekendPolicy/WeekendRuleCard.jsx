const WeekendRuleCard = ({ rule, onChange, onRemove }) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">

      {/* Work Day */}
      <select
        value={rule.workDay}
        onChange={e => onChange({ ...rule, workDay: e.target.value })}
        className="w-full border rounded px-3 py-2"
      >
        <option value="Sunday">Sunday</option>
        <option value="Saturday">Saturday</option>
      </select>

      {/* Target Type */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`targetType-${rule.workDay}`}
            checked={rule.targetType === "Shift"}
            onChange={() => onChange({ ...rule, targetType: "Shift", targetId: "" })}
          />
          Shift
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`targetType-${rule.workDay}`}
            checked={rule.targetType === "Employee"}
            onChange={() => onChange({ ...rule, targetType: "Employee", targetId: "" })}
          />
          Employee
        </label>
      </div>

      {/* Shift */}
      {rule.targetType === "Shift" && (
        <div className="space-y-2">
          <select
            value={rule.targetId || ""}
            onChange={e =>
              onChange({ ...rule, targetId: Number(e.target.value) })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Shift</option>
            <option value={7}>Night Shift</option>
            <option value={8}>Morning Shift</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rule.useShiftTiming}
              onChange={e =>
                onChange({ ...rule, useShiftTiming: e.target.checked })
              }
            />
            Use Shift Timing
          </label>
        </div>
      )}

      {/* Employee */}
      {rule.targetType === "Employee" && (
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Employee ID"
            value={rule.targetId || ""}
            onChange={e =>
              onChange({ ...rule, targetId: Number(e.target.value) })
            }
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex gap-2">
            <input
              type="time"
              value={rule.startTime || ""}
              onChange={e =>
                onChange({ ...rule, startTime: e.target.value })
              }
              className="border rounded px-2 py-1"
            />
            <input
              type="time"
              value={rule.endTime || ""}
              onChange={e =>
                onChange({ ...rule, endTime: e.target.value })
              }
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
      )}

      {/* Compensation */}
      <select
        value={rule.compensationType}
        onChange={e =>
          onChange({ ...rule, compensationType: e.target.value })
        }
        className="w-full border rounded px-3 py-2"
      >
        <option value="Salary">Salary</option>
        <option value="CompOff">Comp-Off</option>
        <option value="None">Attendance Only</option>
      </select>

      {/* Credit */}
      <input
        type="number"
        step="0.5"
        value={rule.workingDayCredit}
        onChange={e =>
          onChange({ ...rule, workingDayCredit: Number(e.target.value) })
        }
        className="w-full border rounded px-3 py-2"
      />

      {/* Govt */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={rule.isGovernmentApproved}
          onChange={e =>
            onChange({ ...rule, isGovernmentApproved: e.target.checked })
          }
        />
        Government Approved
      </label>

      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 text-sm"
      >
        Remove Rule
      </button>
    </div>
  );
};

export default WeekendRuleCard;
