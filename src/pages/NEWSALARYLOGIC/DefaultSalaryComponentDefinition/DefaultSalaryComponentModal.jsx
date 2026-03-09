import React, { useEffect, useState } from "react";

export default function DefaultSalaryComponentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingComponents = [],
}) {
  const [form, setForm] = useState({
    componentCode: "",
    componentType: "Earning",
    calculationType: "Fixed",
    fixedValue: 0,
    percentageValue: 0,
    dependsOn: [],
    executionOrder: 1,
    isAttendanceSensitive: false,
    isStatutory: false,
    isActive: true,
    tierRules: [],
    minimumValue: 0,
    maximumValue: 0,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const addTier = () => {
    setForm({
      ...form,
      tierRules: [...form.tierRules, { upperLimit: 0, multiplier: 0 }],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white w-[700px] p-6 rounded-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Component" : "Create Component"}
        </h2>

        <input
          placeholder="Component Code"
          className="w-full border p-2 rounded"
          value={form.componentCode}
          onChange={(e) =>
            setForm({ ...form, componentCode: e.target.value })
          }
        />

        <select
          className="w-full border p-2 rounded"
          value={form.componentType}
          onChange={(e) =>
            setForm({ ...form, componentType: e.target.value })
          }
        >
          <option value="Earning">Earning</option>
          <option value="Deduction">Deduction</option>
        </select>

        <select
          className="w-full border p-2 rounded"
          value={form.calculationType}
          onChange={(e) =>
            setForm({ ...form, calculationType: e.target.value })
          }
        >
          <option value="Fixed">Fixed</option>
          <option value="Percentage">Percentage</option>
          <option value="Aggregate">Aggregate</option>
          <option value="Service">Service</option>
        </select>

        {form.calculationType === "Fixed" && (
          <input
            type="number"
            placeholder="Fixed Value"
            className="w-full border p-2 rounded"
            value={form.fixedValue}
            onChange={(e) =>
              setForm({ ...form, fixedValue: Number(e.target.value) })
            }
          />
        )}

        {form.calculationType === "Percentage" && (
          <>
            <input
              type="number"
              placeholder="Percentage"
              className="w-full border p-2 rounded"
              value={form.percentageValue}
              onChange={(e) =>
                setForm({
                  ...form,
                  percentageValue: Number(e.target.value),
                })
              }
            />

            <select
              multiple
              className="w-full border p-2 rounded"
              value={form.dependsOn}
              onChange={(e) =>
                setForm({
                  ...form,
                  dependsOn: Array.from(
                    e.target.selectedOptions,
                    (o) => o.value
                  ),
                })
              }
            >
              {existingComponents.map((c) => (
                <option key={c.id} value={c.componentCode}>
                  {c.componentCode}
                </option>
              ))}
            </select>
          </>
        )}

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isAttendanceSensitive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isAttendanceSensitive: e.target.checked,
                })
              }
            />
            Attendance Sensitive
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isStatutory}
              onChange={(e) =>
                setForm({ ...form, isStatutory: e.target.checked })
              }
            />
            Statutory
          </label>
        </div>

        <div>
          <h4 className="font-medium mb-2">Tier Rules</h4>
          {form.tierRules.map((tier, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="number"
                placeholder="Upper Limit"
                className="border p-2 rounded w-1/2"
                value={tier.upperLimit}
                onChange={(e) => {
                  const updated = [...form.tierRules];
                  updated[index].upperLimit = Number(e.target.value);
                  setForm({ ...form, tierRules: updated });
                }}
              />
              <input
                type="number"
                placeholder="Multiplier"
                className="border p-2 rounded w-1/2"
                value={tier.multiplier}
                onChange={(e) => {
                  const updated = [...form.tierRules];
                  updated[index].multiplier = Number(e.target.value);
                  setForm({ ...form, tierRules: updated });
                }}
              />
            </div>
          ))}

          <button
            onClick={addTier}
            className="text-indigo-600 text-sm"
          >
            + Add Tier
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}