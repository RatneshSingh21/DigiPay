import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";


const ComplianceRuleForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    complianceId: "",
    ruleName: "",
    ruleCode: "",
    ruleType: "",
    description: "",
    operator: "",
    value: "",
    message: "",
    isEnabled: false,
    maxHoursPerDay: "",
    maxHoursPerWeek: "",
    maxHoursPerMonth: "",
    shiftHourCap: "",
    breakHourCap: "",
    weeklyOffCap: "",
    maxOvertimeHours: "",
    allowMultipleShifts: false,
    isOTAllowedOnHoliday: false,
    otMultiplier: "",
    ruleApplicableFor: "",
    applicableStates: "",
    effectiveFrom: "",
    effectiveTo: "",
    gracePeriodInMinutes: "",
    toleranceLimit: "",
    parentRuleId: "",
    ruleGroupCode: "",
    actionType: "",
    autoTriggerWorkflow: false,
    requiresAudit: false,
    exceptionHandlingMode: "",
    notificationTemplateId: "",
    penaltyType: "",
    additionalMetadataJson: "",
    executionOrder: "",
    validationType: "",
    appliesToEntity: "",
    isUserEditable: false,
    scopeLevel: "",
    tags: "",
    policyId: "",
    status: "",
    createdBy: "",
    updatedBy: "",
  });

  const numericFields = [
    "maxHoursPerDay",
    "maxHoursPerWeek",
    "maxHoursPerMonth",
    "shiftHourCap",
    "breakHourCap",
    "weeklyOffCap",
    "maxOvertimeHours",
    "otMultiplier",
    "gracePeriodInMinutes",
    "toleranceLimit",
    "notificationTemplateId",
    "executionOrder",
    "policyId",
    
  ];

  const { user } = useAuthStore(); 

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        ...formData,
        ...initialData,
        complianceId: String(initialData.complianceId || ""),
      });
    }
  }, [isEdit, initialData]);

  useEffect(() => {
    axiosInstance
      .get("/Compliance/get-all")
      .then((res) => {
        console.log("Compliances data:", res.data);
        setCompliances(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching compliances:", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : numericFields.includes(name)
          ? value === ""
            ? null
            : Number(value)
          : value || "",
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);

    const payload = { ...formData };

    numericFields.forEach((field) => {
      if (payload[field] === "" || payload[field] === null) {
        payload[field] = null;
      } else {
        payload[field] = Number(payload[field]);
      }
    });

    payload.complianceId = payload.complianceId ? Number(payload.complianceId) : null;
    Object.keys(payload).forEach((key) => payload[key] === "" && delete payload[key]);
    if (isEdit === "Edit") {
      payload.updatedBy = user?.userId; 
    } else {
      payload.createdBy = user?.userId;
      payload.isEnabled = true; 
    }

    if (isEdit === "Edit") {
      await axiosInstance.patch(
        `/ComplianceRule/update/${formData.complianceRuleDetailId}`,
        payload
      );
      toast.success("Compliance Updated Successfully");
    } else {
      await axiosInstance.post("/ComplianceRule/create", payload);
      toast.success("Compliance Created Successfully");
    }

    onSuccess && onSuccess();
    onClose();
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Failed to save rule. Check required fields."
    );
  } finally {
    setLoading(false);
  }
  console.log("Payload being sent:", payload);

};


  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-2xl shadow-xl relative p-8 sm:p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEdit === "Edit" ? "Edit Compliance Rule" : "Add Compliance Rule"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  name="complianceId"
                  value={
                    compliances
                      .map((comp) => ({
                        value: String(comp.complianceId),
                        label: comp.complianceName,
                      }))
                      .find(
                        (option) =>
                          option.value === String(formData.complianceId)
                      ) || null
                  }
                  onChange={(selectedOption) =>
                    setFormData((prev) => ({
                      ...prev,
                      complianceId: selectedOption
                        ? String(selectedOption.value)
                        : "",
                    }))
                  }
                  options={compliances.map((comp) => ({
                    value: String(comp.complianceId),
                    label: comp.complianceName,
                  }))}
                  placeholder="Select Compliance"
                  isClearable
                  isDisabled={isEdit === "Edit"} 
                />
              </div>
              <input
                type="text"
                name="ruleName"
                placeholder="Rule Name"
                value={formData.ruleName}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="ruleCode"
                placeholder="Rule Code"
                value={formData.ruleCode}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="ruleType"
                placeholder="Rule Type"
                value={formData.ruleType}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="operator"
                placeholder="Operator"
                value={formData.operator}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="value"
                placeholder="Value"
                value={formData.value}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="p-3 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400 col-span-2"
              />
              <input
                type="text"
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400 col-span-2"
              />
            </div>
          </div>

          {/* Section 2: Time & Shift Limits */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Time & Shift Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                name="maxHoursPerDay"
                placeholder="Max Hours / Day"
                value={formData.maxHoursPerDay}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="maxHoursPerWeek"
                placeholder="Max Hours / Week"
                value={formData.maxHoursPerWeek}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="maxHoursPerMonth"
                placeholder="Max Hours / Month"
                value={formData.maxHoursPerMonth}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="shiftHourCap"
                placeholder="Shift Hour Cap"
                value={formData.shiftHourCap}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="breakHourCap"
                placeholder="Break Hour Cap"
                value={formData.breakHourCap}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="weeklyOffCap"
                placeholder="Weekly Off Cap"
                value={formData.weeklyOffCap}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Section 3: Overtime & Policy */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Overtime & Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                name="maxOvertimeHours"
                placeholder="Max Overtime Hours"
                value={formData.maxOvertimeHours}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="otMultiplier"
                placeholder="OT Multiplier"
                value={formData.otMultiplier}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="penaltyType"
                placeholder="Penalty Type"
                value={formData.penaltyType}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-6 mt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="allowMultipleShifts"
                  checked={formData.allowMultipleShifts}
                  onChange={handleChange}
                />
                Allow Multiple Shifts
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOTAllowedOnHoliday"
                  checked={formData.isOTAllowedOnHoliday}
                  onChange={handleChange}
                />
                OT Allowed on Holiday
              </label>
            </div>
          </div>

          {/* Section 4: Applicability */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Applicability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="ruleApplicableFor"
                placeholder="Applicable For"
                value={formData.ruleApplicableFor}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="applicableStates"
                placeholder="Applicable States"
                value={formData.applicableStates}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="date"
                name="effectiveFrom"
                value={
                  formData.effectiveFrom
                    ? formData.effectiveFrom.split("T")[0]
                    : ""
                }
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="date"
                name="effectiveTo"
                value={
                  formData.effectiveTo ? formData.effectiveTo.split("T")[0] : ""
                }
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="text"
                name="scopeLevel"
                placeholder="Scope Level"
                value={formData.scopeLevel}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="tags"
                placeholder="Tags"
                value={formData.tags}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Section 5: Advanced Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="gracePeriodInMinutes"
                placeholder="Grace Period (Minutes)"
                value={formData.gracePeriodInMinutes}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="toleranceLimit"
                placeholder="Tolerance Limit"
                value={formData.toleranceLimit}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="ruleGroupCode"
                placeholder="Rule Group Code"
                value={formData.ruleGroupCode}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="actionType"
                placeholder="Action Type"
                value={formData.actionType}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="exceptionHandlingMode"
                placeholder="Exception Handling Mode"
                value={formData.exceptionHandlingMode}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="validationType"
                placeholder="Validation Type"
                value={formData.validationType}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="appliesToEntity"
                placeholder="Applies To Entity"
                value={formData.appliesToEntity}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="notificationTemplateId"
                placeholder="Notification Template Id"
                value={formData.notificationTemplateId}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="executionOrder"
                placeholder="Execution Order"
                value={formData.executionOrder}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="additionalMetadataJson"
                placeholder="Additional Metadata JSON"
                value={formData.additionalMetadataJson}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400 col-span-2"
              />
            </div>
            <div className="flex gap-6 mt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isEnabled"
                  checked={formData.isEnabled}
                  onChange={handleChange}
                />
                Enabled
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="autoTriggerWorkflow"
                  checked={formData.autoTriggerWorkflow}
                  onChange={handleChange}
                />
                Auto Trigger Workflow
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="requiresAudit"
                  checked={formData.requiresAudit}
                  onChange={handleChange}
                />
                Requires Audit
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isUserEditable"
                  checked={formData.isUserEditable}
                  onChange={handleChange}
                />
                User Editable
              </label>
            </div>
          </div>

          {/* Section 6: Audit & System */}
          <div>
            <h3 className="text-lg font-semibold mb-4">System Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                name="policyId"
                placeholder="Policy Id"
                value={formData.policyId}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="status"
                placeholder="Status"
                value={formData.status}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg shadow text-white transition cursor-pointer ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {loading ? (
              <Spinner />
            ) : isEdit === "Edit" ? (
              "Update Compliance Rule"
            ) : (
              "Create Compliance Rule"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplianceRuleForm;
