import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


const WeekendRuleCard = ({ index, rule, onChange, onRemove }) => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const workDayOptions = [
    { value: 0, label: "Sunday" },
    { value: 6, label: "Saturday" }
  ];

  const compensationOptions = [
    { value: 1, label: "Salary (Counts as Working Day)" },
    { value: 2, label: "Comp-Off (Leave Credit)" },
    { value: 3, label: "Attendance Only" }
  ];



  useEffect(() => {
    const fetchShifts = async () => {
      const res = await axiosInstance.get("/Shift");
      setShifts(res.data || []);
    };
    fetchShifts();
  }, []);

  const shiftOptions = shifts.map(s => ({
    value: s.id,
    label: s.shiftName
  }));

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/Employee");
        setEmployees(res.data || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };

    fetchEmployees();
  }, []);

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-2">
      {/* Work Day */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Work Day</label>
        <Select
          value={workDayOptions.find((o) => o.value === rule.workDay)}
          onChange={(opt) => onChange({ ...rule, workDay: opt.value })}
          options={workDayOptions}
        />
      </div>

      {/* Target Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Apply Rule To
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`targetType-${index}`}
              checked={rule.targetType === 2}
              onChange={() =>
                onChange({ ...rule, targetType: 2, targetId: 0 })
              }
            />
            Shift
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`targetType-${index}`}
              checked={rule.targetType === 1}
              onChange={() =>
                onChange({ ...rule, targetType: 1, targetId: 0 })
              }
            />
            Employee
          </label>
        </div>
      </div>

      {/* Shift Section */}
      {rule.targetType === 2 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Shift</label>
            <Select
              value={
                shiftOptions.find((o) => o.value === rule.targetId) || null
              }
              onChange={(opt) =>
                onChange({ ...rule, targetId: opt?.value || 0 })
              }
              options={shiftOptions}
              placeholder="Select Shift"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rule.useShiftTiming}
              onChange={(e) =>
                onChange({ ...rule, useShiftTiming: e.target.checked })
              }
            />
            Use Shift Timing
          </label>
        </div>
      )}

      {/* Employee Section */}
      {rule.targetType === 1 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Employee
            </label>

            <Select
              options={employeeOptions}
              value={
                employeeOptions.find((opt) => opt.value === rule.targetId) ||
                null
              }
              onChange={(opt) =>
                onChange({ ...rule, targetId: opt?.value || 0 })
              }
              placeholder="Select Employee"
              isClearable
              classNames={{
                control: () => "border border-blue-300 min-h-[36px] text-sm",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Start Time</label>
              <input
                type="time"
                disabled={rule.useShiftTiming}
                value={rule.startTime || ""}
                onChange={(e) =>
                  onChange({ ...rule, startTime: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-600">End Time</label>
              <input
                type="time"
                value={rule.endTime || ""}
                onChange={(e) => onChange({ ...rule, endTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Compensation */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Compensation Type
        </label>
        <Select
          value={compensationOptions.find(
            (o) => o.value === rule.compensationType
          )}
          onChange={(opt) => onChange({ ...rule, compensationType: opt.value })}
          options={compensationOptions}
        />
      </div>

      {/* Credit */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Working Day Credit
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.5"
          value={rule.workingDayCredit}
          onChange={(e) =>
            onChange({ ...rule, workingDayCredit: Number(e.target.value) })
          }
          className={inputClass}
        />
      </div>

      {/* Govt Approval */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={rule.isGovernmentApproved}
          onChange={(e) =>
            onChange({ ...rule, isGovernmentApproved: e.target.checked })
          }
        />
        Government Approved
      </label>

      {/* Remove */}
      <div className="pt-2 border-t border-gray-400">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
        >
          Remove Rule
        </button>
      </div>
    </div>
  );
};

export default WeekendRuleCard;
