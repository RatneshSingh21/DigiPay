import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const PFSettingsForm = ({ initialData, onClose, refreshList }) => {
  const [formData, setFormData] = useState(
    initialData || {
      isPfEnabled: true,
      calculationType: "Percentage",
      percentage: "",
      fixedAmount: "",
      appliesOn: "Basic",
      customFormula: "",
      employeeShare: "",
      employerShare: "",
      wageLimit: "",
      isRestrictedToWageLimit: true,
      minServiceMonths: "",
      roundingMethod: "Up",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: true,
      appliesOnComponents: [],
    }
  );

  const [activeTab, setActiveTab] = useState("overview");

  const calculationTypeOptions = [
    { value: "Percentage", label: "Percentage" },
    { value: "Fixed", label: "Fixed Amount" },
  ];
  const appliesOnOptions = [
    { value: "Basic", label: "Basic" },
    { value: "CustomFormula", label: "Custom Formula" },
  ];

  const roundingOptions = [
    { value: "Up", label: "Up" },
    { value: "Down", label: "Down" },
    { value: "Nearest", label: "Nearest" },
  ];

  const yesNoOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      percentage: formData.percentage ? Number(formData.percentage) : 0,
      fixedAmount: formData.fixedAmount ? Number(formData.fixedAmount) : 0,
      employeeShare: formData.employeeShare
        ? Number(formData.employeeShare)
        : 0,
      employerShare: formData.employerShare
        ? Number(formData.employerShare)
        : 0,
      wageLimit: formData.wageLimit ? Number(formData.wageLimit) : 0,
      minServiceMonths: formData.minServiceMonths
        ? Number(formData.minServiceMonths)
        : 0,
    };

    try {
      if (initialData) {
        await axiosInstance.put(
          `/PFSettings/${initialData.pfSettingsId}`,
          payload
        );
        toast.success("PF Setting updated successfully!");
      } else {
        await axiosInstance.post("/PFSettings", payload);
        toast.success("PF Setting created successfully!");
      }
      refreshList();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error saving PF Setting");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white overflow-hidden relative rounded-lg w-full max-w-2xl h-[80vh] flex flex-col shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold px-6 pt-6">
          {initialData ? "Edit PF Setting" : "Add PF Setting"}
        </h2>

        {/* Tabs */}
        <div className="border-b px-6 flex space-x-6">
          {["overview", "advanced", "meta"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "advanced" && "Advanced"}
              {tab === "meta" && "Meta"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {/* ---------------- Overview Tab ---------------- */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-3">
              {/* PF Enabled */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  PF Enabled
                </label>
                <Select
                  options={yesNoOptions}
                  value={yesNoOptions.find(
                    (opt) => opt.value === formData.isPfEnabled
                  )}
                  onChange={(opt) =>
                    setFormData({ ...formData, isPfEnabled: opt.value })
                  }
                />
              </div>

              {/* Active */}
              <div>
                <label className="block text-sm font-medium mb-1">Active</label>
                <Select
                  options={yesNoOptions}
                  value={yesNoOptions.find(
                    (opt) => opt.value === formData.isActive
                  )}
                  onChange={(opt) =>
                    setFormData({ ...formData, isActive: opt.value })
                  }
                />
              </div>

              {/* Calculation Type */}
              <div className="col-span-2">
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

              {formData.calculationType === "Percentage" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Percentage
                  </label>
                  <input
                    type="number"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter Percentage"
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
                    value={formData.fixedAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fixedAmount: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter Fixed Amount"
                  />
                </div>
              )}

              {/* Applies On */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Applies On
                </label>
                <Select
                  options={appliesOnOptions}
                  value={appliesOnOptions.find(
                    (opt) => opt.value === formData.appliesOn
                  )}
                  onChange={(opt) =>
                    setFormData({ ...formData, appliesOn: opt.value })
                  }
                />
              </div>

              {/* Custom Formula */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Custom Formula
                </label>
                <input
                  type="text"
                  value={formData.customFormula}
                  onChange={(e) =>
                    setFormData({ ...formData, customFormula: e.target.value })
                  }
                  className={`w-full border rounded px-3 py-2 ${
                    formData.appliesOn !== "CustomFormula"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="e.g. (Basic + HRA) * 12%"
                  disabled={formData.appliesOn !== "CustomFormula"}
                />
              </div>
            </div>
          )}

          {/* ---------------- Advanced Tab ---------------- */}
          {activeTab === "advanced" && (
            <div className="grid grid-cols-2 gap-3">
              {/* Applies On Components */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Applies On Components (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.appliesOnComponents?.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appliesOnComponents: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Basic, HRA, DA"
                />
              </div>

              {/* Employee Share */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee Share
                </label>
                <input
                  type="number"
                  value={formData.employeeShare}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeShare: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter Employee Share"
                />
              </div>

              {/* Employer Share */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employer Share
                </label>
                <input
                  type="number"
                  value={formData.employerShare}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employerShare: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter Employer Share"
                />
              </div>

              {/* Wage Limit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Wage Limit
                </label>
                <input
                  type="number"
                  value={formData.wageLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wageLimit: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter Wage Limit"
                />
              </div>

              {/* Min Service Months */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Min Service Months
                </label>
                <input
                  type="number"
                  value={formData.minServiceMonths}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minServiceMonths: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter Minimum Service Months"
                />
              </div>
            </div>
          )}

          {/* ---------------- Meta Tab ---------------- */}
          {activeTab === "meta" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Restricted to Wage Limit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Restricted to Wage Limit
                </label>
                <Select
                  options={yesNoOptions}
                  value={yesNoOptions.find(
                    (opt) => opt.value === formData.isRestrictedToWageLimit
                  )}
                  onChange={(opt) =>
                    setFormData({
                      ...formData,
                      isRestrictedToWageLimit: opt.value,
                    })
                  }
                />
              </div>

              {/* Rounding */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rounding
                </label>
                <Select
                  options={roundingOptions}
                  value={roundingOptions.find(
                    (opt) => opt.value === formData.roundingMethod
                  )}
                  onChange={(opt) =>
                    setFormData({ ...formData, roundingMethod: opt.value })
                  }
                />
              </div>

              {/* Effective From */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Effective From
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      effectiveFrom: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Effective To */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Effective To
                </label>
                <input
                  type="date"
                  value={formData.effectiveTo?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      effectiveTo: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-start space-x-3 pt-4">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-secondary text-white rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PFSettingsForm;
