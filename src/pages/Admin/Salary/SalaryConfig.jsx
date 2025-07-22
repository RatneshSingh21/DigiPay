// src/pages/AdminPages/SalaryConfig.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const SalaryConfig = () => {
  const user = useAuthStore((state) => state.user);
  const orgId = user?.orgId || user?.userId; // 👈 adjust based on your backend's org ID

  const [componentConfigs, setComponentConfigs] = useState([]);
  const [formData, setFormData] = useState({
    componentName: "",
    isEnabled: true,
    calculationType: 1,
    percentageValue: "",
    fixedAmount: "",
  });
  const [editId, setEditId] = useState(null);

  // Load configs from API
  const fetchConfigs = async () => {
    try {
      const response = await axiosInstance.get("/OrgComponentConfig/by-org", {
        params: { orgId: orgId },
      });
      setComponentConfigs(response.data.data || []); // fix: access .data inside response
    } catch (err) {
      console.error("Error fetching config", err);
    }
  };

  useEffect(() => {
    if (orgId) fetchConfigs();
  }, [orgId]);

  // Submit form for Add/Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orgId) {
      toast.error("Missing organization ID");
      return;
    }

    const payload = {
      ...formData,
      orgId,
      calculationType: parseInt(formData.calculationType),
      percentageValue: parseFloat(formData.percentageValue) || 0,
      fixedAmount: parseFloat(formData.fixedAmount) || 0,
    };

    if (payload.calculationType === 1) {
      payload.fixedAmount = 0;
    } else {
      payload.percentageValue = 0;
    }

    try {
      if (editId) {
        await axiosInstance.put(`/OrgComponentConfig/${editId}`, payload);
        toast.success("Config updated");
      } else {
        await axiosInstance.post("/OrgComponentConfig/save", [payload]);
        toast.success("Config added");
      }

      setFormData({
        componentName: "",
        isEnabled: true,
        calculationType: 1,
        percentageValue: "",
        fixedAmount: "",
      });
      setEditId(null);
      fetchConfigs();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Error saving config");
    }
  };

  // Prefill form on Edit
  const handleEdit = (config) => {
    setFormData({
      componentName: config.componentName || "",
      isEnabled: config.isEnabled ?? true,
      calculationType: config.calculationType,
      percentageValue: config.percentageValue ?? "",
      fixedAmount: config.fixedAmount ?? "",
    });
    setEditId(config.componentConfigId);
  };

  // Delete config
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;

    try {
      await axiosInstance.delete(`/OrgComponentConfig/${id}`);
      toast.success("Deleted");
      fetchConfigs();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting config");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Salary Component Configuration</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow max-w-md"
      >
        <div>
          <label>Component Name</label>
          <input
            type="text"
            value={formData.componentName}
            onChange={(e) =>
              setFormData({ ...formData, componentName: e.target.value })
            }
            required
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label>Calculation Type</label>
          <select
            value={formData.calculationType}
            onChange={(e) =>
              setFormData({
                ...formData,
                calculationType: parseInt(e.target.value),
              })
            }
            className="border p-2 w-full"
          >
            <option value={1}>Percentage</option>
            <option value={2}>Fixed Amount</option>
          </select>
        </div>

        {formData.calculationType === 1 ? (
          <div>
            <label>Percentage Value (%)</label>
            <input
              type="number"
              min={0}
              value={formData.percentageValue}
              onChange={(e) =>
                setFormData({ ...formData, percentageValue: e.target.value })
              }
              className="border p-2 w-full"
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
              className="border p-2 w-full"
              required
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) =>
              setFormData({ ...formData, isEnabled: e.target.checked })
            }
          />
          <label>Enabled</label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
            </tr>
          </thead>
          <tbody>
            {componentConfigs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
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
                    {item.isEnabled ? "Enabled" : "Disabled"}
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
