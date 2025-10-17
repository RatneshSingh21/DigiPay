import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import { fetchAllAttendancePolicyOptions } from "../../../services/attendancePolicyService";

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "36px",   // increased from 28px
    height: "36px",
    fontSize: "12px",
    padding: "0 4px",
    overflow: "hidden",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 4px",
    display: "flex",
    flexWrap: "wrap",
    gap: "2px",
    maxHeight: "80px",   // increased max height
    overflowY: "auto",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "36px",      // match control height
  }),
  option: (provided) => ({
    ...provided,
    fontSize: "12px",
    padding: "6px 8px",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    padding: "0 4px",
    fontSize: "12px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    padding: "0 2px",
    fontSize: "12px",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    fontSize: "12px",
    padding: "0 2px",
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    maxHeight: "200px",
    overflowY: "auto",
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "200px",
    overflowY: "auto",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};


const AttendancePolicyForm = ({ onClose, onSuccess }) => {
  const User = useAuthStore((state) => state.user);

  const [options, setOptions] = useState({
    shiftIds: [],
    workTypeIds: [],
    departmentIds: [],
    locationIds: [],
    latePolicyIds: [],
    otPolicyIds: [],
    otRateSlabIds: [],
    bonusPolicyIds: [],
    specialAllowancePolicyIds: [],
    holidayListIds: [],
    leaveTypeIds: [],
    complianceIds: [],
    complianceRuleIds: [],
    weekendPolicyIds: [],
    weekendPolicyMappingIds: [],
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await fetchAllAttendancePolicyOptions();
        setOptions(data);
      } catch (err) {
        toast.error("Failed to load attendance policy options");
        console.error(err);
      }
    };
    loadOptions();
  }, []);

  const [form, setForm] = useState({
    policyName: "",
    description: "",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: new Date().toISOString().split("T")[0],
    isActive: true,
    shiftIds: [],
    workTypeIds: [],
    departmentIds: [],
    locationIds: [],
    latePolicyIds: [],
    otPolicyIds: [],
    otRateSlabIds: [],
    bonusPolicyIds: [],
    specialAllowancePolicyIds: [],
    holidayListIds: [],
    leaveTypeIds: [],
    complianceIds: [],
    complianceRuleIds: [],
    weekendPolicyIds: [],
    weekendPolicyMappingIds: [],
    attendanceInputConfig: {
      enableBiometric: true,
      enableFaceRecognition: true,
      enableGeoFencing: true,
      allowMobilePunch: true,
      allowManualCorrection: true,
      manualCorrectionApprovalRequired: true,
    },
    escalationConfig: {
      lateEscalationLevel: 0,
      absentEscalationLevel: 0,
      otEscalationLevel: 0,
      notifyManager: true,
      notifyHR: true,
      notifyPayroll: true,
      autoWorkflowTrigger: true,
    },
    salaryIntegration: {
      autoCalculateOT: true,
      autoCalculateLateDeduction: true,
      autoAdjustLeaveEncashment: true,
      autoApplyBonus: true,
      autoApplySpecialAllowance: true,
    },
    exceptionHandling: {
      allowShiftSwap: true,
      allowWFHAdjustment: true,
      allowCompOffAdjustment: true,
      manualOverrideAllowed: true,
      auditRequired: true,
    },
    additionalMetadataJson: "{}",
    createdBy: User.userId,
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSelectChange = (name, selectedOptions) => {
    setForm((prev) => ({
      ...prev,
      [name]: selectedOptions ? selectedOptions.map((o) => o.value) : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/AttendancePolicy", form);
      toast.success(
        res.data.message || "Attendance policy created successfully"
      );
      onSuccess(); // refresh list in parent
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create Attendance Policy"
      );
      console.error(err);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative overflow-y-auto max-h-[90vh] animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
          Add Attendance Policy
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Policy Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Policy Name *
            </label>
            <input
              type="text"
              name="policyName"
              value={form.policyName}
              onChange={handleChange}
              placeholder="Policy Name..."
              required
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Policy Description..."
              className={inputClass}
              rows={2}
            />
          </div>

          {/* Dates */}
          <div className="flex gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-700">Effective From</label>
              <input
                type="date"
                name="effectiveFrom"
                value={form.effectiveFrom}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-700">Effective To</label>
              <input
                type="date"
                name="effectiveTo"
                value={form.effectiveTo}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="text-xs text-gray-700">Active</label>
          </div>

          {/* Multi-select fields */}
          
          {[
            "shiftIds",
            "workTypeIds",
            "departmentIds",
            "locationIds",
            "latePolicyIds",
            "otPolicyIds",
            "otRateSlabIds",
            "bonusPolicyIds",
            "specialAllowancePolicyIds",
            "holidayListIds",
            "leaveTypeIds",
            "complianceIds",
            "complianceRuleIds",
            "weekendPolicyIds",
            "weekendPolicyMappingIds",
          ].map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium capitalize text-gray-700 mb-1">
                {field}
              </label>
              <Select
                isMulti
                options={options[field] || []}
                onChange={(val) => handleSelectChange(field, val)}
                placeholder={`Select ${field}`}
                styles={customSelectStyles}
                className="text-xs"
                menuPortalTarget={document.body} // renders dropdown at body level
                menuPosition="fixed" // keeps menu fixed above other elements
              />
            </div>
          ))}

          {/* Checkbox groups for configs */}
          {[
            { key: "attendanceInputConfig", label: "Attendance Input Config" },
            { key: "escalationConfig", label: "Escalation Config" },
            { key: "salaryIntegration", label: "Salary Integration" },
            { key: "exceptionHandling", label: "Exception Handling" },
          ].map((config) => (
            <div key={config.key} className="border-t border-gray-200 pt-2">
              {/* Section Label */}
              <p className="text-xs font-medium text-gray-700 mb-1">
                {config.label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(form[config.key]).map((key) => {
                  const value = form[config.key][key];
                  if (typeof value === "boolean") {
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 capitalize text-xs"
                      >
                        <input
                          type="checkbox"
                          name={`${config.key}.${key}`}
                          checked={value}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        {key}
                      </label>
                    );
                  } else if (typeof value === "number") {
                    return (
                      <label
                        key={key}
                        className="flex flex-col text-xs capitalize"
                      >
                        {key}
                        <input
                          type="number"
                          name={`${config.key}.${key}`}
                          value={value}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </label>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            </div>
          ))}

          {/* Additional Metadata */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Additional Metadata (JSON)
            </label>
            <textarea
              name="additionalMetadataJson"
              value={form.additionalMetadataJson}
              onChange={handleChange}
              className={inputClass}
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer text-xs rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 cursor-pointer text-xs bg-primary text-white rounded-lg hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendancePolicyForm;
