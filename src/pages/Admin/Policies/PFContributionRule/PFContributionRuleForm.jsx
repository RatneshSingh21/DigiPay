import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

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
    }
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
          payload
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
    "w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  const calculationOptions = [{ value: "Percentage", label: "Percentage" }];

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white px-4 py-6 rounded-2xl w-full max-h-[75vh] overflow-y-auto max-w-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? "Edit Contribution Rule" : "Add Contribution Rule"}
          </h3>
          <button onClick={onClose} className="cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Component Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Component Name
            </label>
            <input
              type="text"
              name="componentName"
              placeholder="Enter component name"
              value={formData.componentName}
              onChange={handleChange}
              className={inputClass}
              autoFocus
              required
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              type="text"
              name="code"
              placeholder="Enter code (e.g., AC01 ,AC02)"
              value={formData.code}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Account Type
            </label>
            <input
              type="text"
              name="accountType"
              placeholder="Enter account type (e.g., EPF)"
              value={formData.accountType}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Calculation Type
            </label>
            <Select
              name="calculationType"
              value={calculationOptions.find(
                (opt) => opt.value === formData.calculationType
              )}
              onChange={(selectedOption) =>
                setFormData({
                  ...formData,
                  calculationType: selectedOption.value,
                })
              }
              options={calculationOptions}
              className="text-sm"
            />
          </div>

          {/* Percentage */}
          <div>
            <label className="block text-sm font-medium mb-1">Percentage</label>
            <input
              type="number"
              name="percentage"
              placeholder="Enter percentage"
              value={formData.percentage}
              onChange={handleChange}
              step="0.01"
              className={inputClass}
              required
            />
          </div>

          {/* Ceiling */}
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="hasCeiling"
                checked={formData.hasCeiling}
                onChange={handleChange}
                id="ceiling"
              />
              <label className="text-sm font-medium" htmlFor="ceiling">
                Has Ceiling
              </label>
              {formData.hasCeiling && (
                <input
                  type="number"
                  name="ceilingAmount"
                  placeholder="Enter ceiling amount"
                  value={formData.ceilingAmount}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                />
              )}
            </div>
          </div>

          {/* Max Contribution */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Contribution
            </label>
            <input
              type="number"
              name="maxContribution"
              placeholder="Enter max contribution"
              value={formData.maxContribution}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Employer Share */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isEmployerShare"
              checked={formData.isEmployerShare}
              onChange={handleChange}
              id="employeeshare"
            />
            <label
              className="block text-sm font-medium"
              htmlFor="employeeshare"
            >
              Employer Share
            </label>
          </div>

          {/* Effective Dates */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Effective From
              </label>
              <input
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Effective To
              </label>
              <input
                type="date"
                name="effectiveTo"
                value={formData.effectiveTo || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded cursor-pointer bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded cursor-pointer bg-primary text-white hover:bg-secondary"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PFContributionRuleForm;
