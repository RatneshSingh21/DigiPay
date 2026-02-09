import React from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const EncashmentStep = ({ encashmentRules, setEncashmentRules, leaveTypes }) => {
  const addRule = () => {
    setEncashmentRules([
      ...encashmentRules,
      {
        leaveTypeId: 0,
        isEncashmentAllowed: true,
        maxEncashableDaysPerYear: 0,
        minBalanceRequired: 0,
        allowAtYearEnd: true,
        allowDuringResignation: true,
        allowDuringRetirement: true,
        encashmentCalculationType: "",
      },
    ]);
  };

  const updateRule = (index, field, value) => {
    setEncashmentRules(prev =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeRule = (index) => {
    setEncashmentRules(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Add Rule Button */}
      <div
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-700 transition cursor-pointer"
        onClick={addRule}
      >
        + Add Encashment Rule
      </div>

      {encashmentRules.map((rule, index) => (
        <div key={index} className="border border-gray-200 p-3 rounded space-y-3">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select
                value={rule.leaveTypeId}
                onChange={(e) => updateRule(index, "leaveTypeId", +e.target.value)}
                className={inputClass}
              >
                <option value={0}>Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.leaveTypeId} value={lt.leaveTypeId}>
                    {lt.leaveName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rule.isEncashmentAllowed}
                onChange={(e) => updateRule(index, "isEncashmentAllowed", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-gray-700">Encashment Allowed</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Type
              </label>
              <input
                type="text"
                placeholder="Calculation Type"
                value={rule.encashmentCalculationType}
                onChange={(e) => updateRule(index, "encashmentCalculationType", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Encashable Days
              </label>
              <input
                type="number"
                value={rule.maxEncashableDaysPerYear}
                onChange={(e) => updateRule(index, "maxEncashableDaysPerYear", +e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Balance Required
              </label>
              <input
                type="number"
                value={rule.minBalanceRequired}
                onChange={(e) => updateRule(index, "minBalanceRequired", +e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rule.allowAtYearEnd}
                  onChange={(e) => updateRule(index, "allowAtYearEnd", e.target.checked)}
                  className="h-4 w-4"
                />
                Allow at Year End
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rule.allowDuringResignation}
                  onChange={(e) => updateRule(index, "allowDuringResignation", e.target.checked)}
                  className="h-4 w-4"
                />
                During Resignation
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rule.allowDuringRetirement}
                  onChange={(e) => updateRule(index, "allowDuringRetirement", e.target.checked)}
                  className="h-4 w-4"
                />
                During Retirement
              </label>
            </div>
          </div>

          {/* Remove Button */}
          <div className="flex justify-end">
            <div
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
              onClick={() => removeRule(index)}
            >
              Remove
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EncashmentStep;
