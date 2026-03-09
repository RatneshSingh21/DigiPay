import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { toast } from "react-toastify";

/* ================= ENUMS (API ALIGNED) ================= */

// Backend:
// ComponentType → 1 = Earning, 2 = Deduction
const componentTypes = [
  { label: "Earning", value: 1 },
  { label: "Deduction", value: 2 },
];

// Backend:
// CalculationType
// 1 = Fixed, 2 = Percentage, 3 = Tiered, 4 = Formula
const calculationTypes = [
  { label: "Fixed", value: 1 },
  { label: "Percentage", value: 2 },
  { label: "Tiered", value: 3 },
  { label: "Formula", value: 4 },
];

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

/* ================= DEFAULT FORM ================= */

const defaultForm = {
  componentCode: "",
  componentType: 1,
  calculationType: 1,

  fixedValue: null,
  percentageValue: null,
  formulaExpressionJson: "",
  tierConfigJson: "",

  activationRuleJson: "",
  thresholdRuleJson: "",

  executionOrder: 1,
  isAttendanceSensitive: false,

  minimumValue: null,
  maximumValue: null,

  isStatutory: false,
};

/* ================= COMPONENT ================= */

export default function DynamicSalaryComponentModal({
  isOpen,
  onClose,
  onSubmit,
  policyId,
}) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(defaultForm);
  }, [isOpen]);

  if (!isOpen) return null;

  /* ================= PAYLOAD BUILDER ================= */

  const buildPayload = () => ({
    policyId,

    componentCode: form.componentCode.trim().toUpperCase(),
    componentType: form.componentType,
    calculationType: form.calculationType,

    fixedValue: form.calculationType === 1 ? form.fixedValue : null,

    percentageValue: form.calculationType === 2 ? form.percentageValue : null,

    tierConfigJson:
      form.calculationType === 3 ? form.tierConfigJson || null : null,

    formulaExpressionJson:
      form.calculationType === 4 ? form.formulaExpressionJson || null : null,

    activationRuleJson: form.activationRuleJson || null,
    thresholdRuleJson: form.thresholdRuleJson || null,

    executionOrder: form.executionOrder,
    isAttendanceSensitive: form.isAttendanceSensitive,

    minimumValue: form.minimumValue,
    maximumValue: form.maximumValue,

    isStatutory: form.isStatutory,
  });

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.componentCode.trim()) {
      toast.error("Component Code is required");
      return;
    }

    if (!policyId) {
      toast.error("Policy not selected");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(buildPayload());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white min-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200"
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Create Salary Component</h2>
            <p className="text-sm text-gray-500">
              Define earning or deduction calculation logic
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-500 cursor-pointer hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
          {/* BASIC */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Component Code</label>
              <input
                className={inputClass}
                value={form.componentCode}
                onChange={(e) =>
                  setForm({ ...form, componentCode: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Execution Order</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.executionOrder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    executionOrder: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* TYPE */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Component Type</label>
              <Select
                options={componentTypes}
                value={componentTypes.find(
                  (o) => o.value === form.componentType,
                )}
                onChange={(o) => setForm({ ...form, componentType: o.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Calculation Type</label>
              <Select
                options={calculationTypes}
                value={calculationTypes.find(
                  (o) => o.value === form.calculationType,
                )}
                onChange={(o) => setForm({ ...form, calculationType: o.value })}
              />
            </div>
          </div>

          {/* CONDITIONAL VALUES */}
          {form.calculationType === 1 && (
            <div>
              <label className="text-sm font-medium">Fixed Value</label>
              <input
                type="number"
                className={inputClass}
                value={form.fixedValue ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fixedValue: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          )}

          {form.calculationType === 2 && (
            <div>
              <label className="text-sm font-medium">Percentage Value</label>
              <input
                type="number"
                className={inputClass}
                value={form.percentageValue ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    percentageValue: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </div>
          )}

          {form.calculationType === 3 && (
            <div>
              <label className="text-sm font-medium">Tier Config JSON</label>
              <textarea
                rows={4}
                className={inputClass}
                value={form.tierConfigJson}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tierConfigJson: e.target.value,
                  })
                }
              />
            </div>
          )}

          {form.calculationType === 4 && (
            <div>
              <label className="text-sm font-medium">
                Formula Expression JSON
              </label>
              <textarea
                rows={5}
                className={inputClass}
                value={form.formulaExpressionJson}
                onChange={(e) =>
                  setForm({
                    ...form,
                    formulaExpressionJson: e.target.value,
                  })
                }
              />
            </div>
          )}

          {/* LIMITS */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Minimum Value</label>
              <input
                type="number"
                className={inputClass}
                value={form.minimumValue ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minimumValue: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Maximum Value</label>
              <input
                type="number"
                className={inputClass}
                value={form.maximumValue ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maximumValue: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </div>
          </div>

          {/* RULE CONFIGURATION */}
          <div>
            <label className="text-sm font-medium">Activation Rule JSON</label>
            <textarea
              rows={3}
              className={inputClass}
              value={form.activationRuleJson}
              onChange={(e) =>
                setForm({
                  ...form,
                  activationRuleJson: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Threshold Rule JSON</label>
            <textarea
              rows={3}
              className={inputClass}
              value={form.thresholdRuleJson}
              onChange={(e) =>
                setForm({
                  ...form,
                  thresholdRuleJson: e.target.value,
                })
              }
            />
          </div>

          {/* FLAGS */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isAttendanceSensitive}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isAttendanceSensitive: e.target.checked,
                  })
                }
                className="accent-primary"
              />
              Attendance Sensitive
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isStatutory}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isStatutory: e.target.checked,
                  })
                }
                className="accent-primary"
              />
              Statutory Component
            </label>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border cursor-pointer border-gray-200 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-primary cursor-pointer hover:bg-secondary text-white shadow disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Component"}
          </button>
        </div>
      </div>
    </div>
  );
}
