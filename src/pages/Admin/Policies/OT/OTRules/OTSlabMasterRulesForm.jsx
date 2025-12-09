import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";

export default function OTSlabMasterRulesForm({
  onClose,
  onSuccess,
  isEdit,
  initialData,
}) {
  const [formData, setFormData] = useState({
    ruleCode: "",
    entityName: "",
    conditionExpression: "",
    errorMessage: "",
    isEnabled: true,
  });

  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full px-2.5 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({ ...initialData });
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit === "Edit") {
        await axiosInstance.put(
          `/OTRateSlabAssignmentRule/${formData.otRateSlabAssignmentRuleId}`,
          formData
        );
        toast.success("Rule updated successfully!");
      } else {
        await axiosInstance.post("/OTRateSlabAssignmentRule", formData);
        toast.success("Rule created successfully!");
      }

      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error(error.response?.data?.message || "Failed to save rule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl">
      <h2 className="text-base font-semibold text-gray-800 mb-3 text-center">
        {isEdit === "Edit"
          ? "Edit OT Rate Slab Assignment Rule"
          : "Add OT Rate Slab Assignment Rule"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2 text-sm">
        {/* Rule Code */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-0.5">Rule Code</label>
          <input
            type="text"
            name="ruleCode"
            value={formData.ruleCode}
            onChange={handleChange}
            required
            className={inputClass}
            autoFocus
            placeholder="Enter Rule Code eg. OTR001,OTR002,.."
          />
        </div>

        {/* Entity Name */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-0.5">
            Entity Name
          </label>
          <input
            type="text"
            name="entityName"
            value={formData.entityName}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Condition Expression */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-0.5">
            Condition Expression
          </label>
          <textarea
            name="conditionExpression"
            value={formData.conditionExpression}
            onChange={handleChange}
            rows={2}
            required
            className={inputClass}
          />
        </div>

        {/* Error Message */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-0.5">
            Error Message
          </label>
          <input
            type="text"
            name="errorMessage"
            value={formData.errorMessage}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Is Enabled */}
        <div className="flex items-center gap-1 mt-1">
          <input
            type="checkbox"
            name="isEnabled"
            checked={formData.isEnabled}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 accent-primary rounded"
          />
          <label className="font-medium text-gray-700">Is Enabled</label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-3 py-1.5 rounded text-white text-sm ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {loading ? "Saving..." : isEdit === "Edit" ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
