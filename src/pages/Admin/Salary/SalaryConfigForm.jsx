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

const SalaryConfigForm = ({ orgId, fetchConfigs, editData, clearEdit }) => {
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
          (opt) => opt.value === editData.componentName
        ),
        calculationType: calculationTypeOptions.find(
          (opt) => opt.value === editData.calculationType
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

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 text-sm gap-4 bg-white p-4 rounded shadow"
    >
      <div>
        <label className="block mb-1">Component Name</label>
        <Select
          options={salaryComponentOptions}
          value={formData.componentName}
          onChange={(option) =>
            setFormData({ ...formData, componentName: option })
          }
          placeholder="Select Component"
          isSearchable
          autoFocus
        />
      </div>

      <div>
        <label className="block mb-1">Calculation Type</label>
        <Select
          options={calculationTypeOptions}
          value={formData.calculationType}
          onChange={(option) =>
            setFormData({ ...formData, calculationType: option })
          }
          placeholder="Select Type"
        />
      </div>

      {formData.calculationType?.value === 1 ? (
        <div>
          <label>Percentage Value (%)</label>
          <input
            type="number"
            min={0}
            value={formData.percentageValue}
            onChange={(e) =>
              setFormData({ ...formData, percentageValue: e.target.value })
            }
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
      ) : (
        <div>
          <label>Fixed Amount</label>
          <input
            type="number"
            min={0}
            value={formData.fixedAmount}
            onChange={(e) =>
              setFormData({ ...formData, fixedAmount: e.target.value })
            }
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter Amount"
            required
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Status</label>
        <button
          type="button"
          className={`relative inline-flex items-center cursor-pointer h-6 rounded-full w-11 transition-colors duration-300 ${
            formData.isEnabled ? "bg-green-500" : "bg-gray-300"
          }`}
          onClick={() =>
            setFormData({ ...formData, isEnabled: !formData.isEnabled })
          }
        >
          <span
            className={`inline-block w-4 h-4 transform cursor-pointer bg-white rounded-full transition-transform duration-300 ${
              formData.isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm">
          {formData.isEnabled ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-primary text-white cursor-pointer px-4 py-2 rounded hover:bg-secondary"
        >
          {editId ? "Update" : "Add"} Component
        </button>
        {editId && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-300 text-black cursor-pointer px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SalaryConfigForm;
