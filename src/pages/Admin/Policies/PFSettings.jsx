import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit, X } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";

const PFSettings = () => {
  const [settings, setSettings] = useState([]);
  const [formData, setFormData] = useState({
    calculationType: "Percentage",
    percentage: 0,
    fixedAmount: 0,
    appliesOn: "Basic",
    employeeShare: 0,
    employerShare: 0,
    wageLimit: 0,
    isRestrictedToWageLimit: true,
    minServiceMonths: 0,
    roundingMethod: "Up",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Options for Calculation Type
  const calculationTypeOptions = [
    { value: "Percentage", label: "Percentage" },
    { value: "Fixed", label: "Fixed Amount" },
  ];

  // Fetch PF Settings
  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("/PFSettings");
      setSettings(res.data.data || []);
    } catch (err) {
      console.log(err);
      // toast.error("Failed to load PF Settings");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`/PFSettings/${editId}`, formData);
        toast.success("PF Setting updated successfully!");
      } else {
        await axiosInstance.post("/PFSettings", formData);
        toast.success("PF Setting created successfully!");
      }
      setIsModalOpen(false);
      fetchSettings();
    } catch (err) {
      toast.error("Error saving PF Setting");
    }
  };

  return (
    <>
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">PF Settings</h2>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({
              calculationType: "Percentage",
              percentage: "",
              fixedAmount: "",
              appliesOn: "Basic",
              employeeShare: "",
              employerShare: "",
              wageLimit: "",
              isRestrictedToWageLimit: true,
              minServiceMonths: "",
              roundingMethod: "Up",
              effectiveFrom: "",
              effectiveTo: "",
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2" size={16} /> Add PF Setting
        </button>
      </div>

      {/* Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Calculation Type</th>
            <th className="p-2 border">Percentage</th>
            <th className="p-2 border">Fixed Amount</th>
            <th className="p-2 border">Applies On</th>
            <th className="p-2 border">Employee Share</th>
            <th className="p-2 border">Employer Share</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((s) => (
            <tr key={s.pfSettingsId}>
              <td className="p-2 border">{s.pfSettingsId}</td>
              <td className="p-2 border">{s.calculationType}</td>
              <td className="p-2 border">{s.percentage}</td>
              <td className="p-2 border">{s.fixedAmount}</td>
              <td className="p-2 border">{s.appliesOn}</td>
              <td className="p-2 border">{s.employeeShare}</td>
              <td className="p-2 border">{s.employerShare}</td>
              <td className="p-2 border">
                <button
                  className="text-blue-600 flex items-center"
                  onClick={() => {
                    setFormData(s);
                    setEditId(s.pfSettingsId);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit size={16} className="mr-1" /> Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl h-[83vh] overflow-y-auto relative shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-4">
              {editId ? "Edit PF Setting" : "Add PF Setting"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Calculation Type
                </label>
                <Select
                  options={calculationTypeOptions}
                  value={calculationTypeOptions.find(
                    (opt) => opt.value === formData.calculationType
                  )}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      calculationType: selected.value,
                    })
                  }
                />
              </div>

              {/* Conditional fields */}
              {formData.calculationType === "Percentage" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Percentage
                  </label>
                  <input
                    type="number"
                    placeholder="Percentage"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}

              {formData.calculationType === "Fixed" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fixed Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Fixed Amount"
                    value={formData.fixedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, fixedAmount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Applies On
                </label>
                <input
                  type="text"
                  placeholder="Applies On"
                  value={formData.appliesOn}
                  onChange={(e) =>
                    setFormData({ ...formData, appliesOn: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee Share
                </label>
                <input
                  type="number"
                  placeholder="Employee Share"
                  value={formData.employeeShare}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeShare: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Employer Share
                </label>
                <input
                  type="number"
                  placeholder="Employer Share"
                  value={formData.employerShare}
                  onChange={(e) =>
                    setFormData({ ...formData, employerShare: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md w-1/2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md w-1/2"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PFSettings;
