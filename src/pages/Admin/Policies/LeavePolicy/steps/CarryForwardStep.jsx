import React from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const CarryForwardStep = ({
  carryForwardRules,
  setCarryForwardRules,
  leaveTypes,
}) => {
  const addRule = () => {
    setCarryForwardRules([
      ...carryForwardRules,
      {
        leaveTypeId: 0,
        allowCarryForward: true,
        maxCarryForwardDays: 0,
        carryForwardExpiryInMonths: 0,
        carryForwardProrated: false,
        conditionsJson: "",
      },
    ]);
  };

  const updateRule = (index, field, value) => {
    setCarryForwardRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeRule = (index) => {
    setCarryForwardRules((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Add Rule Button */}
      <div
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-700 transition cursor-pointer"
        onClick={addRule}
      >
        + Add Carry Forward Rule
      </div>

      {carryForwardRules.map((rule, index) => (
        <div key={index} className="border p-3 rounded space-y-3">
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
                Max Carry Forward Days
              </label>
              <input
                type="number"
                value={rule.maxCarryForwardDays}
                onChange={(e) =>
                  updateRule(index, "maxCarryForwardDays", +e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry (Months)
              </label>
              <input
                type="number"
                value={rule.carryForwardExpiryInMonths}
                onChange={(e) =>
                  updateRule(
                    index,
                    "carryForwardExpiryInMonths",
                    +e.target.value
                  )
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allow Carry Forward
              </label>
              <input
                type="checkbox"
                checked={rule.allowCarryForward}
                onChange={(e) =>
                  updateRule(index, "allowCarryForward", e.target.checked)
                }
                className="h-4 w-4 mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prorate Carry Forward
              </label>
              <input
                type="checkbox"
                checked={rule.carryForwardProrated}
                onChange={(e) =>
                  updateRule(index, "carryForwardProrated", e.target.checked)
                }
                className="h-4 w-4 mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions JSON
              </label>
              <input
                type="text"
                placeholder='{"minBalance":10}'
                value={rule.conditionsJson}
                onChange={(e) =>
                  updateRule(index, "conditionsJson", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Remove */}
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

export default CarryForwardStep;
