import React, { useState, useEffect } from "react";
import { createESIRule } from "../../../../../services/esiService";
import { toast } from "react-toastify";
import Select from "react-select";
import { X } from "lucide-react";

const ESIRulesForm = ({ editData, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeContributionRate: "",
    employerContributionRate: "",
    wageCeiling: "",
    disabledWageCeiling: "",
    dailyWageExemption: "",
    esiApplicableComponents: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
  });

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const componentOptions = [
    { value: "None", label: "None" },
    { value: "Basic", label: "Basic" },
    { value: "HRA", label: "HRA" },
    { value: "Conveyance", label: "Conveyance" },
    { value: "SpecialAllowance", label: "SpecialAllowance" },
    { value: "Bonus", label: "Bonus" },
    { value: "DA", label: "DA" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert array to comma-separated string for API
      const payload = {
        ...form,
        esiApplicableComponents: Array.isArray(form.esiApplicableComponents)
          ? form.esiApplicableComponents.join(",")
          : form.esiApplicableComponents,
      };

      await createESIRule(payload);
      toast.success("ESI Rule saved successfully");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save ESI Rule");
      console.log(err);
    }
  };

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white relative p-6 rounded-lg shadow-lg w-full h-[75%] overflow-y-scroll max-w-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-red-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold mb-4">
          {editData ? "Edit ESI Rule" : "Add ESI Rule"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Employee Rate (%)</label>
              <input
                type="number"
                name="employeeContributionRate"
                value={form.employeeContributionRate}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter employee contribution rate"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-sm">Employer Rate (%)</label>
              <input
                type="number"
                name="employerContributionRate"
                value={form.employerContributionRate}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter employer contribution rate"
                required
              />
            </div>
            <div>
              <label className="text-sm">Wage Ceiling Amount</label>
              <input
                type="number"
                name="wageCeiling"
                value={form.wageCeiling}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter wage ceiling amount"
              />
            </div>
            <div>
              <label className="text-sm">Disabled Wage Ceiling Amount</label>
              <input
                type="number"
                name="disabledWageCeiling"
                value={form.disabledWageCeiling}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter disabled wage ceiling amount"
              />
            </div>
            <div>
              <label className="text-sm">Daily Wage Exemption</label>
              <input
                type="number"
                name="dailyWageExemption"
                value={form.dailyWageExemption}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter daily wage exemption"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm">Applicable Components</label>
              <Select
                isMulti
                options={componentOptions}
                value={componentOptions.filter((option) => {
                  const selected = Array.isArray(form.esiApplicableComponents)
                    ? form.esiApplicableComponents
                    : form.esiApplicableComponents?.split(",") || [];
                  return selected.includes(option.value);
                })}
                onChange={(selectedOptions) => {
                  const values = selectedOptions.map((option) => option.value);
                  setForm({
                    ...form,
                    esiApplicableComponents: values,
                  });
                }}
                className="mt-1 text-sm"
                placeholder="Select applicable components"
              />
            </div>
            <div>
              <label className="text-sm">Effective From</label>
              <input
                type="date"
                name="effectiveFrom"
                value={form.effectiveFrom?.split("T")[0] || ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="text-sm">Effective To</label>
              <input
                type="date"
                name="effectiveTo"
                value={form.effectiveTo?.split("T")[0] || ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between border-t pt-4">
            <label className="text-sm font-medium">Active</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`w-12 h-6 flex items-center cursor-pointer rounded-full p-1 transition-colors duration-300 ${
                form.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  form.isActive ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 cursor-pointer rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary cursor-pointer text-white rounded hover:bg-secondary"
            >
              {editData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ESIRulesForm;
