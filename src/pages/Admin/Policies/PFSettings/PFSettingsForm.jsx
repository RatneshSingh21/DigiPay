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
      percentage: 0,
      fixedAmount: 0,
      appliesOn: "Basic",
      customFormula: "",
      employeeShare: 0,
      employerShare: 0,
      wageLimit: 0,
      isRestrictedToWageLimit: true,
      minServiceMonths: 0,
      roundingMethod: "Up",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: true,
    }
  );

  const [activeTab, setActiveTab] = useState("overview");

  const calculationTypeOptions = [
    { value: "Percentage", label: "Percentage" },
    { value: "Fixed", label: "Fixed Amount" },
  ];

  const appliesOnOptions = [
    { value: "Basic", label: "Basic" },
    { value: "Gross", label: "Gross" },
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
      percentage: Number(formData.percentage),
      fixedAmount: Number(formData.fixedAmount),
      employeeShare: Number(formData.employeeShare),
      employerShare: Number(formData.employerShare),
      wageLimit: Number(formData.wageLimit),
      minServiceMonths: Number(formData.minServiceMonths),
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
      toast.error(err?.response?.data?.message || "Error saving PF Setting");
    }
  };

  // input class css
  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white overflow-hidden relative rounded-lg w-full max-w-2xl h-[80vh] flex flex-col shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold px-6 pt-6">
          {initialData ? "Edit PF Setting" : "Add PF Setting"}
        </h2>

        <div className="border-b px-6 flex space-x-6">
          {["overview", "advanced"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 cursor-pointer text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "advanced" && "Advanced"}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-3">
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
                  autoFocus
                  required
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
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                    className={inputClass}
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
                      setFormData({ ...formData, fixedAmount: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              )}

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
                  disabled={formData.appliesOn !== "CustomFormula"}
                  className={`w-full border rounded px-3 py-2 ${
                    formData.appliesOn !== "CustomFormula"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="e.g. (Basic + DA) * 12%"
                />
              </div>
            </div>
          )}

          {/* Advanced */}
          {activeTab === "advanced" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee Share %
                </label>
                <input
                  type="number"
                  value={formData.employeeShare}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeShare: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Employer Share %
                </label>
                <input
                  type="number"
                  value={formData.employerShare}
                  onChange={(e) =>
                    setFormData({ ...formData, employerShare: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Wage Limit
                </label>
                <input
                  type="number"
                  value={formData.wageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, wageLimit: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

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
                  className={inputClass}
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Effective From
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveFrom: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Effective To
                </label>
                <input
                  type="date"
                  value={formData.effectiveTo?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveTo: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex justify-start space-x-3 pt-4 col-span-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary cursor-pointer hover:bg-secondary text-white rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-gray-400 cursor-pointer text-white rounded"
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
