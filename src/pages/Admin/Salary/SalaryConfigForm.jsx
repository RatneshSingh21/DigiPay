import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";

const calculationTypeOptions = [
  { label: "Percentage", value: 1 },
  { label: "Fixed Amount", value: 2 },
];

const salaryComponentOptions = [
  { label: "Basic Salary", value: "basicSalary" },
  { label: "HRA", value: "hra" },
  { label: "Conveyance Allowance", value: "conveyanceAllowance" },
  { label: "Fixed Allowance", value: "fixedAllowance" },
  { label: "Bonus", value: "bonus" },
  { label: "Arrears", value: "arrears" },
  { label: "Overtime Hours", value: "overtimeHours" },
  { label: "Overtime Rate", value: "overtimeRate" },
  { label: "Leave Encashment", value: "leaveEncashment" },
  { label: "Special Allowance", value: "specialAllowance" },
  { label: "PF Employee", value: "pfEmployee" },
  { label: "ESIC Employee", value: "esicEmployee" },
  { label: "Professional Tax", value: "professionalTax" },
  { label: "TDS", value: "tds" },
  { label: "Loan Repayment", value: "loanRepayment" },
  { label: "Other Deductions", value: "otherDeductions" },
];

const SalaryConfigForm = ({
  orgId,
  fetchConfigs,
  editData,
  clearEdit,
  existingComponents = [],
}) => {
  const [formData, setFormData] = useState({
    componentName: null,
    isEnabled: true,
    calculationType: null,
    percentageValue: "",
    fixedAmount: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        componentName: salaryComponentOptions.find(
          (opt) => opt.value === editData.componentName,
        ),
        calculationType: calculationTypeOptions.find(
          (opt) => opt.value === editData.calculationType,
        ),
        isEnabled: editData.isEnabled ?? true,
        percentageValue: editData.percentageValue ?? "",
        fixedAmount: editData.fixedAmount ?? "",
      });
      setEditId(editData.componentConfigId);
    }
  }, [editData]);

  const resetForm = () => {
    setFormData({
      componentName: null,
      isEnabled: true,
      calculationType: null,
      percentageValue: "",
      fixedAmount: "",
    });
    setEditId(null);
    clearEdit?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.componentName || !formData.calculationType) {
      toast.error("Please select both component and calculation type.");
      return;
    }

    const payload = {
      ...formData,
      orgId,
      componentName: formData.componentName.value,
      calculationType: formData.calculationType.value,
      percentageValue: parseFloat(formData.percentageValue) || 0,
      fixedAmount: parseFloat(formData.fixedAmount) || 0,
    };

    if (payload.calculationType === 1) payload.fixedAmount = 0;
    else payload.percentageValue = 0;

    try {
      if (editId) {
        await axiosInstance.put(`/OrgComponentConfig/${editId}`, payload);
        toast.success("Config updated successfully.");
      } else {
        await axiosInstance.post("/OrgComponentConfig/save", [payload]);
        toast.success("Component added successfully.");
      }

      resetForm();
      fetchConfigs();
    } catch (err) {
      console.error(err?.response?.data?.message || "Error saving config", err);
      toast.error("Error saving component.");
    }
  };

  const usedComponentNames = existingComponents.map(
    (item) => item.componentName,
  );

  // Allow current component during edit
  const filteredSalaryComponentOptions = salaryComponentOptions.filter(
    (opt) =>
      !usedComponentNames.includes(opt.value) ||
      opt.value === editData?.componentName,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {/* Component */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Component Name
        </label>
        <Select
          options={filteredSalaryComponentOptions}
          value={formData.componentName}
          onChange={(option) =>
            setFormData({ ...formData, componentName: option })
          }
          placeholder="Select component"
          className="text-sm"
        />
      </div>

      {/* Calculation Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calculation Type
        </label>
        <Select
          options={calculationTypeOptions}
          value={formData.calculationType}
          onChange={(option) =>
            setFormData({ ...formData, calculationType: option })
          }
          placeholder="Select calculation type"
          className="text-sm"
        />
      </div>

      {/* Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.calculationType?.value === 1
            ? "Percentage Value (%)"
            : "Fixed Amount"}
        </label>
        <input
          type="number"
          value={
            formData.calculationType?.value === 1
              ? formData.percentageValue
              : formData.fixedAmount
          }
          onChange={(e) =>
            formData.calculationType?.value === 1
              ? setFormData({ ...formData, percentageValue: e.target.value })
              : setFormData({ ...formData, fixedAmount: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
          required
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-4 mt-6">
        <label className="text-sm font-medium text-gray-700">Status</label>

        <button
          type="button"
          onClick={() =>
            setFormData({ ...formData, isEnabled: !formData.isEnabled })
          }
          className={`relative inline-flex h-6 w-12 items-center cursor-pointer rounded-full transition ${
            formData.isEnabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              formData.isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        <span className="text-sm text-gray-600">
          {formData.isEnabled ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Buttons */}
      <div className="md:col-span-2 pt-6 border-t border-gray-200 flex justify-end gap-4">
        {editId && (
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2 text-sm border cursor-pointer border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="px-6 py-2 text-sm cursor-pointer bg-primary text-white rounded-md hover:bg-secondary transition font-medium"
        >
          {editId ? "Update Component" : "Add Component"}
        </button>
      </div>
    </form>
  );
};

export default SalaryConfigForm;
