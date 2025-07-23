import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Select from "react-select";

const SalaryConfig = () => {
  const user = useAuthStore((state) => state.user);
  const orgId = user?.orgId || user?.userId;

  const [componentConfigs, setComponentConfigs] = useState([]);
  const [formData, setFormData] = useState({
    componentName: null,
    isEnabled: true,
    calculationType: null,
    percentageValue: "",
    fixedAmount: "",
  });
  const [editId, setEditId] = useState(null);

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

  const fetchConfigs = async () => {
    try {
      const res = await axiosInstance.get("/OrgComponentConfig/by-org", {
        params: { orgId },
      });
      setComponentConfigs(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching configs", err);
    }
  };

  useEffect(() => {
    if (orgId) fetchConfigs();
  }, [orgId]);

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
      console.error("Error saving config", err);
      toast.error("Error saving component.");
    }
  };

  const resetForm = () => {
    setFormData({
      componentName: null,
      isEnabled: true,
      calculationType: null,
      percentageValue: "",
      fixedAmount: "",
    });
    setEditId(null);
  };

  const handleEdit = (config) => {
    setFormData({
      componentName: salaryComponentOptions.find(
        (opt) => opt.value === config.componentName
      ),
      calculationType: calculationTypeOptions.find(
        (opt) => opt.value === config.calculationType
      ),
      isEnabled: config.isEnabled ?? true,
      percentageValue: config.percentageValue ?? "",
      fixedAmount: config.fixedAmount ?? "",
    });
    setEditId(config.componentConfigId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this component?"))
      return;

    try {
      await axiosInstance.delete(`/OrgComponentConfig/${id}`);
      toast.success("Component deleted successfully.");
      fetchConfigs();
    } catch (err) {
      console.error("Delete error", err);
      toast.error("Error deleting component.");
    }
  };

  return (
    <div className="p-4">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow"
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
              required
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Status</label>
          <button
            type="button"
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${
              formData.isEnabled ? "bg-green-500" : "bg-gray-300"
            }`}
            onClick={() =>
              setFormData({ ...formData, isEnabled: !formData.isEnabled })
            }
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                formData.isEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm">
            {formData.isEnabled ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
        >
          {editId ? "Update" : "Add"} Component
        </button>
      </form>

      <div className="mt-8">
        <h3 className="font-semibold mb-2">Current Configs</h3>
        <table className="w-full text-left border mt-4">
          <thead>
            <tr>
              <th className="border p-2">Component Name</th>
              <th className="border p-2">Calculation Type</th>
              <th className="border p-2">Value</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {componentConfigs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No components found.
                </td>
              </tr>
            ) : (
              componentConfigs.map((item) => (
                <tr key={item.componentConfigId}>
                  <td className="border p-2">{item.componentName}</td>
                  <td className="border p-2">
                    {item.calculationType === 1 ? "Percentage" : "Fixed Amount"}
                  </td>
                  <td className="border p-2">
                    {item.calculationType === 1
                      ? `${item.percentageValue}%`
                      : `₹${item.fixedAmount}`}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        item.isEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isEnabled ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.componentConfigId)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryConfig;
