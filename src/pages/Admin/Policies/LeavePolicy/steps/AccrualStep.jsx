import React from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const AccrualStep = ({ accrualRules, setAccrualRules, leaveTypes }) => {
  const addRule = () => {
    setAccrualRules([
      ...accrualRules,
      {
        leaveTypeId: 0,
        policyCode: "",
        frequency: "Monthly",
        accrualValue: 0,
        prorateOnJoin: true,
        prorateOnLeave: true,
        accrualStartsAfterServiceMonths: 0,
        effectiveFrom: "",
        effectiveTo: "",
        extraJson: "",
      },
    ]);
  };

  const updateRule = (index, field, value) => {
    setAccrualRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeRule = (index) => {
    setAccrualRules((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Add Rule Button */}
      <div
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-700 transition cursor-pointer"
        onClick={addRule}
      >
        + Add Accrual Rule
      </div>

      {accrualRules.map((rule, index) => (
        <div key={index} className="border border-gray-200 p-3 rounded space-y-3">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select
                value={rule.leaveTypeId}
                onChange={(e) =>
                  updateRule(index, "leaveTypeId", +e.target.value)
                }
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Code
              </label>
              <input
                type="text"
                placeholder="Policy Code"
                value={rule.policyCode}
                onChange={(e) =>
                  updateRule(index, "policyCode", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={rule.frequency}
                onChange={(e) => updateRule(index, "frequency", e.target.value)}
                className={inputClass}
              >
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accrual Value
              </label>
              <input
                type="number"
                placeholder="Accrual Value"
                value={rule.accrualValue}
                onChange={(e) =>
                  updateRule(index, "accrualValue", +e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prorate On Join
              </label>
              <input
                type="checkbox"
                checked={rule.prorateOnJoin}
                onChange={(e) =>
                  updateRule(index, "prorateOnJoin", e.target.checked)
                }
                className="h-4 w-4 mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prorate On Leave
              </label>
              <input
                type="checkbox"
                checked={rule.prorateOnLeave}
                onChange={(e) =>
                  updateRule(index, "prorateOnLeave", e.target.checked)
                }
                className="h-4 w-4 mt-2"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accrual Starts After (Months)
              </label>
              <input
                type="number"
                placeholder="Months"
                value={rule.accrualStartsAfterServiceMonths}
                onChange={(e) =>
                  updateRule(
                    index,
                    "accrualStartsAfterServiceMonths",
                    +e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={rule.effectiveFrom}
                onChange={(e) =>
                  updateRule(index, "effectiveFrom", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective To
              </label>
              <input
                type="date"
                value={rule.effectiveTo}
                onChange={(e) =>
                  updateRule(index, "effectiveTo", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extra JSON
              </label>
              <input
                type="text"
                placeholder="Extra JSON"
                value={rule.extraJson}
                onChange={(e) => updateRule(index, "extraJson", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-end">
              <div
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                onClick={() => removeRule(index)}
              >
                Remove
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccrualStep;
