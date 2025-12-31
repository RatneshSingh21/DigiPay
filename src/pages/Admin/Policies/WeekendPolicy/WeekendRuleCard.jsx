import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const WeekendRuleCard = ({ rule, onChange, onRemove }) => {
  const [employees, setEmployees] = useState([]);

  const workDayOptions = [
    { value: "Sunday", label: "Sunday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const compensationOptions = [
    { value: "Salary", label: "Salary" },
    { value: "CompOff", label: "Comp-Off" },
    { value: "None", label: "Attendance Only" },
  ];

  const shiftOptions = [
    { value: 7, label: "Night Shift" },
    { value: 8, label: "Morning Shift" },
  ];

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
    <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
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
              name={`targetType-${rule.workDay}`}
              checked={rule.targetType === "Shift"}
              onChange={() =>
                onChange({ ...rule, targetType: "Shift", targetId: "" })
              }
            />
            Shift
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`targetType-${rule.workDay}`}
              checked={rule.targetType === "Employee"}
              onChange={() =>
                onChange({ ...rule, targetType: "Employee", targetId: "" })
              }
            />
            Employee
          </label>
        </div>
      </div>

      {/* Shift Section */}
      {rule.targetType === "Shift" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Shift</label>
            <Select
              value={
                shiftOptions.find((o) => o.value === rule.targetId) || null
              }
              onChange={(opt) =>
                onChange({ ...rule, targetId: opt?.value || "" })
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
      {rule.targetType === "Employee" && (
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
                onChange({ ...rule, targetId: opt?.value || "" })
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
                value={rule.startTime || ""}
                onChange={(e) =>
                  onChange({ ...rule, startTime: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-600">End Time</label>
              <input
                type="time"
                value={rule.endTime || ""}
                onChange={(e) => onChange({ ...rule, endTime: e.target.value })}
                className="w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
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
          step="0.5"
          value={rule.workingDayCredit}
          onChange={(e) =>
            onChange({ ...rule, workingDayCredit: Number(e.target.value) })
          }
          className="w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
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
      <div className="pt-2 border-t">
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 text-sm hover:underline"
        >
          Remove Rule
        </button>
      </div>
    </div>
  );
};

export default WeekendRuleCard;
