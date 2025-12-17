import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

/* ===== DEFAULT FORM ===== */
const DEFAULT_FORM = {
  prorateByAttendance: true,
  netSalaryRoundingPolicy: "",
  roundingNearestValue: 0,
  allowNegativeSalary: false,
  fullMonthDays: 30,
  minHoursForFullDay: 0,
  minHoursForHalfDay: 0,
  components: [
    {
      componentName: "",
      isAttendanceSensitive: true,
      calculationFormula: "",
    },
  ],
};

const DynamicComponentBased = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [ruleId, setRuleId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  /* ===== FETCH EXISTING RULE ===== */
  useEffect(() => {
    if (!open) return;

    const fetchRule = async () => {
      try {
        setLoadingExisting(true);
        const res = await axiosInstance.get("/DynamicSalaryRule");
        const rule = res.data?.data?.[0];

        if (rule) {
          setRuleId(rule.id);
          setForm({
            prorateByAttendance: rule.prorateByAttendance,
            netSalaryRoundingPolicy: rule.netSalaryRoundingPolicy || "",
            roundingNearestValue: rule.roundingNearestValue || 0,
            allowNegativeSalary: rule.allowNegativeSalary,
            fullMonthDays: rule.fullMonthDays || 30,
            minHoursForFullDay: rule.minHoursForFullDay || 0,
            minHoursForHalfDay: rule.minHoursForHalfDay || 0,
            components:
              rule.components?.length > 0
                ? rule.components.map((c) => ({
                    componentName: c.componentName,
                    isAttendanceSensitive: c.isAttendanceSensitive,
                    calculationFormula: c.calculationFormula,
                  }))
                : DEFAULT_FORM.components,
          });
        } else {
          setRuleId(null);
          setForm(DEFAULT_FORM);
        }
      } catch {
        toast.error("Failed to load dynamic salary rule");
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchRule();
  }, [open]);

  /* ===== HANDLERS ===== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...form.components];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, components: updated }));
  };

  const addComponent = () => {
    setForm((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        {
          componentName: "",
          isAttendanceSensitive: true,
          calculationFormula: "",
        },
      ],
    }));
  };

  const removeComponent = (index) => {
    setForm((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  /* ===== SAVE ===== */

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (ruleId) {
        await axiosInstance.put(`/DynamicSalaryRule/${ruleId}`, form);
        toast.success("Dynamic salary rule updated");
      } else {
        await axiosInstance.post("/DynamicSalaryRule", form);
        toast.success("Dynamic salary rule created");
      }

      onClose();
    } catch {
      toast.error("Failed to save dynamic salary rule");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-4 relative text-sm">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 cursor-pointer text-gray-500"
        >
          <X size={18} />
        </button>

        <h2 className="text-base font-semibold mb-3">
          Dynamic Component Based Salary Rules
        </h2>

        {/* ===== GENERAL RULES ===== */}
        <Section title="General Rules">
          <Toggle
            label="Prorate By Attendance"
            name="prorateByAttendance"
            value={form.prorateByAttendance}
            onChange={handleChange}
          />
          <Toggle
            label="Allow Negative Salary"
            name="allowNegativeSalary"
            value={form.allowNegativeSalary}
            onChange={handleChange}
          />

          <TextInput
            label="Net Salary Rounding Policy"
            name="netSalaryRoundingPolicy"
            value={form.netSalaryRoundingPolicy}
            onChange={handleChange}
          />

          <NumberInput
            label="Rounding Nearest Value"
            value={form.roundingNearestValue}
            onChange={(v) => handleNumberChange("roundingNearestValue", v)}
          />
        </Section>

        {/* ===== ATTENDANCE ===== */}
        <Section title="Attendance & Hours">
          <NumberInput
            label="Full Month Days"
            value={form.fullMonthDays}
            onChange={(v) => handleNumberChange("fullMonthDays", v)}
          />
          <NumberInput
            label="Min Hours For Full Day"
            value={form.minHoursForFullDay}
            onChange={(v) => handleNumberChange("minHoursForFullDay", v)}
          />
          <NumberInput
            label="Min Hours For Half Day"
            value={form.minHoursForHalfDay}
            onChange={(v) => handleNumberChange("minHoursForHalfDay", v)}
          />
        </Section>

        {/* ===== COMPONENTS ===== */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Salary Components</h3>
            <button
              onClick={addComponent}
              className="flex items-center gap-1 text-xs cursor-pointer bg-primary text-white px-2 py-1 rounded"
            >
              <Plus size={14} /> Add Component
            </button>
          </div>

          {form.components.map((comp, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-end border rounded p-2 mb-2"
            >
              <div className="col-span-3">
                <Label>Component Name</Label>
                <input
                  type="text"
                  value={comp.componentName}
                  onChange={(e) =>
                    handleComponentChange(
                      index,
                      "componentName",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="col-span-5">
                <Label>Calculation Formula</Label>
                <input
                  type="text"
                  value={comp.calculationFormula}
                  onChange={(e) =>
                    handleComponentChange(
                      index,
                      "calculationFormula",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Basic * 0.40"
                  className="w-full px-3 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={comp.isAttendanceSensitive}
                  onChange={(e) =>
                    handleComponentChange(
                      index,
                      "isAttendanceSensitive",
                      e.target.checked
                    )
                  }
                />
                <span className="text-xs">Attendance Sensitive</span>
              </div>

              <div className="col-span-1">
                {form.components.length > 1 && (
                  <button
                    onClick={() => removeComponent(index)}
                    className="text-red-500 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border cursor-pointer rounded"
          >
            Cancel
          </button>
          <button
            disabled={loading || loadingExisting}
            onClick={handleSubmit}
            className="px-5 py-1.5 bg-primary text-white cursor-pointer rounded"
          >
            {loading ? "Saving..." : "Save Rules"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===== UI HELPERS ===== */

const Section = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="font-medium mb-2">{title}</h3>
    <div className="grid grid-cols-2 gap-3">{children}</div>
  </div>
);

const TextInput = ({ label, name, value, onChange }) => (
  <div>
    <Label>{label}</Label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const NumberInput = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const Toggle = ({ label, name, value, onChange }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" name={name} checked={value} onChange={onChange} />
    <span className="text-xs">{label}</span>
  </label>
);

const Label = ({ children }) => (
  <label className="text-xs text-gray-600">{children}</label>
);

export default DynamicComponentBased;
