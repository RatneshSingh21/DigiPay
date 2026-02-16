import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    fontSize: "0.875rem",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const PFContributionRuleForm = ({ initialData, onClose, refreshList }) => {
  const [formData, setFormData] = useState(
    initialData || {
      componentName: "",
      code: "",
      accountType: "",
      percentage: "",
      isEmployerShare: true,
      calculationType: "Percentage",
      dependsOnRuleId: null,
      hasCeiling: false,
      ceilingAmount: 0,
      maxContribution: "",
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveTo: null,
      isActive: true,
    },
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
        effectiveTo: formData.effectiveTo
          ? new Date(formData.effectiveTo).toISOString()
          : null,
      };

      if (initialData) {
        await axiosInstance.patch(
          `/ContributionRule/${initialData.contributionRuleId}`,
          payload,
        );
        toast.success("Rule updated successfully!");
      } else {
        await axiosInstance.post("/ContributionRule", payload);
        toast.success("Rule created successfully!");
      }

      refreshList();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save rule");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const calculationOptions = [{ value: "Percentage", label: "Percentage" }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {initialData
              ? "Edit PF Contribution Rule"
              : "Create PF Contribution Rule"}
          </h3>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-1 overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Component Name *</label>
              <input
                name="componentName"
                value={formData.componentName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Code *</label>
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Account Type *</label>
            <input
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className={inputClass}
              placeholder="EPF"
              required
            />
          </div>

          {/* Calculation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Calculation Type</label>
              <Select
                options={calculationOptions}
                styles={selectStyles}
                menuPortalTarget={document.body}
                value={calculationOptions.find(
                  (o) => o.value === formData.calculationType,
                )}
                onChange={(o) =>
                  setFormData({ ...formData, calculationType: o.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Percentage (%) *</label>
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                className={inputClass}
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Ceiling */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="hasCeiling"
                checked={formData.hasCeiling}
                onChange={handleChange}
              />
              Has Ceiling
            </label>

            {formData.hasCeiling && (
              <input
                type="number"
                name="ceilingAmount"
                placeholder="Ceiling Amount"
                value={formData.ceilingAmount}
                onChange={handleChange}
                className={"w-40 " + inputClass}
              />
            )}
          </div>

          {/* Max Contribution */}
          <div>
            <label className="text-sm font-medium">Max Contribution</label>
            <input
              type="number"
              name="maxContribution"
              value={formData.maxContribution}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Share */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isEmployerShare"
              checked={formData.isEmployerShare}
              onChange={handleChange}
            />
            <span className="text-sm font-medium">Employer Share</span>
          </div>

          {/* Effective Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Effective From *</label>
              <input
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Effective To</label>
              <input
                type="date"
                name="effectiveTo"
                value={formData.effectiveTo || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 cursor-pointer text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-primary cursor-pointer hover:bg-secondary text-white text-sm"
          >
            {initialData ? "Update Rule" : "Create Rule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PFContributionRuleForm;
