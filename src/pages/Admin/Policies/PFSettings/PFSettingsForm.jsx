import React, { useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    fontSize: "0.875rem",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999, // FIXES hidden dropdown
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    fontSize: "0.875rem",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "#eff6ff"
      : state.isSelected
        ? "#dbeafe"
        : "white",
    color: "#111827",
    cursor: "pointer",
    fontSize: "0.875rem",
  }),
};

const steps = [
  "Eligibility",
  "Base & Calculation",
  "Contribution",
  "Effective Period",
];

const PFSettingsForm = ({ initialData, onClose, refreshList }) => {
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState(
    initialData || {
      eligibilityRule: "AlwaysEligible",
      baseRule: "AttendanceBasedActual",
      calculationType: "Percentage",
      percentage: 12,
      fixedAmount: null,
      roundingMethod: "Up",
      employeeShare: 12,
      employerShare: 12,
      wageLimit: 15000,
      minServiceMonths: null,
      effectiveFrom: "",
      effectiveTo: "",
      isActive: true,
    },
  );

  const eligibilityOptions = [
    { value: "AlwaysEligible", label: "Always Eligible" },
    { value: "SalaryLessThanWageLimit", label: "Salary < Wage Limit" },
  ];

  const baseRuleOptions = [
    {
      value: "AttendanceBasedActual",
      label: "Attendance Based (Actual Salary)",
    },
    {
      value: "AttendanceBasedStatutoryCap",
      label: "Attendance Based (Statutory Cap)",
    },
    {
      value: "EmployeeFixedOverride",
      label: "Employee Fixed Override",
    },
  ];

  const calculationTypeOptions = [
    { value: "Percentage", label: "Percentage (%)" },
    { value: "Fixed", label: "Fixed Amount (₹)" },
  ];

  const roundingOptions = [
    { value: "Up", label: "Round Up" },
    { value: "Down", label: "Round Down" },
    { value: "Nearest", label: "Nearest Value" },
  ];

  const yesNoOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const handleSubmit = async () => {
    const payload = {
      eligibilityRule: formData.eligibilityRule,
      baseRule: formData.baseRule,
      calculationType: formData.calculationType,
      percentage:
        formData.calculationType === "Percentage"
          ? Number(formData.percentage)
          : null,
      fixedAmount:
        formData.calculationType === "Fixed"
          ? Number(formData.fixedAmount)
          : null,
      roundingMethod: formData.roundingMethod,
      employeeShare: Number(formData.employeeShare),
      employerShare: Number(formData.employerShare),
      wageLimit: Number(formData.wageLimit),
      minServiceMonths: formData.minServiceMonths
        ? Number(formData.minServiceMonths)
        : null,
      effectiveFrom: formData.effectiveFrom,
      effectiveTo: formData.effectiveTo || null,
      isActive: formData.isActive,
    };

    try {
      if (initialData) {
        await axiosInstance.put(
          `/PFSettings/${initialData.pfSettingsId}`,
          payload,
        );
        toast.success("PF Setting updated successfully");
      } else {
        await axiosInstance.post("/PFSettings", payload);
        toast.success("PF Setting created successfully");
      }
      refreshList();
      onClose();
    } catch {
      toast.error("Failed to save PF Setting");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit PF Rule" : "Create PF Rule"}
          </h2>
          <X onClick={onClose} className="cursor-pointer hover:text-red-500" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between px-6 py-3 bg-gray-50">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`text-sm font-medium ${
                i === step ? "text-primary" : "text-gray-400"
              }`}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* STEP 1 */}
          {step === 0 && (
            <>
              <div className="space-y-1">
                <span className="text-sm font-medium">PF Eligibility Rule</span>
                <p className="text-xs text-gray-500">
                  Decide who is eligible for PF
                </p>
                <Select
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  options={eligibilityOptions}
                  value={eligibilityOptions.find(
                    (o) => o.value === formData.eligibilityRule,
                  )}
                  onChange={(o) =>
                    setFormData({ ...formData, eligibilityRule: o.value })
                  }
                />
              </div>

              <label>
                <span className="font-medium">Wage Limit (₹)</span>
                <p className="text-xs text-gray-500">PF wage ceiling amount</p>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.wageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, wageLimit: e.target.value })
                  }
                />
              </label>

              <label>
                <span className="font-medium">Is Active?</span>
                <Select
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  options={yesNoOptions}
                  value={yesNoOptions.find(
                    (o) => o.value === formData.isActive,
                  )}
                  onChange={(o) =>
                    setFormData({ ...formData, isActive: o.value })
                  }
                />
              </label>
            </>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <>
              <label>
                <span className="font-medium">PF Base Rule</span>
                <p className="text-xs text-gray-500">
                  How PF base salary should be calculated
                </p>
                <Select
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  options={baseRuleOptions}
                  value={baseRuleOptions.find(
                    (o) => o.value === formData.baseRule,
                  )}
                  onChange={(o) =>
                    setFormData({ ...formData, baseRule: o.value })
                  }
                />
              </label>

              <label>
                <span className="font-medium">Calculation Type</span>
                <Select
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  options={calculationTypeOptions}
                  value={calculationTypeOptions.find(
                    (o) => o.value === formData.calculationType,
                  )}
                  onChange={(o) =>
                    setFormData({ ...formData, calculationType: o.value })
                  }
                />
              </label>

              {formData.calculationType === "Percentage" && (
                <label>
                  <span className="font-medium">PF Percentage (%)</span>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                  />
                </label>
              )}

              {formData.calculationType === "Fixed" && (
                <label>
                  <span className="font-medium">Fixed Amount (₹)</span>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.fixedAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fixedAmount: e.target.value,
                      })
                    }
                  />
                </label>
              )}
            </>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <>
              <label>
                <span className="font-medium">Employee Share (%)</span>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.employeeShare}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeShare: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span className="font-medium">Employer Share (%)</span>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.employerShare}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employerShare: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span className="font-medium">Rounding Method</span>
                <Select
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  options={roundingOptions}
                  value={roundingOptions.find(
                    (o) => o.value === formData.roundingMethod,
                  )}
                  onChange={(o) =>
                    setFormData({ ...formData, roundingMethod: o.value })
                  }
                />
              </label>

              <label>
                <span className="font-medium">Min Service Months</span>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.minServiceMonths || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minServiceMonths: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <>
              <label>
                <span className="font-medium">Effective From</span>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.effectiveFrom?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      effectiveFrom: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span className="font-medium">Effective To</span>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.effectiveTo?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      effectiveTo: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t text-sm border-gray-200 flex justify-between">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-primary hover:bg-secondary cursor-pointer text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary hover:bg-secondary cursor-pointer text-white rounded"
            >
              Save PF Rule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PFSettingsForm;
