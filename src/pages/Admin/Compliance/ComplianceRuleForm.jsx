import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";

const ComplianceRuleForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

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
    scopeLevel: "",
    tags: "",
    policyId: "",
    penaltyType: "",
    status: "",
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
    "policyId",
  ];

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        complianceId: String(initialData.complianceId || ""),
      }));
    }
  }, [isEdit, initialData]);

  useEffect(() => {
    axiosInstance
      .get("/Compliance/get-all")
      .then((res) => setCompliances(res.data || []))
      .catch((err) => console.error("Error fetching compliances:", err));
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

      payload.complianceId = payload.complianceId
        ? Number(payload.complianceId)
        : null;

      Object.keys(payload).forEach(
        (key) => payload[key] === "" && delete payload[key]
      );

      if (isEdit === "Edit") {
        payload.updatedBy = user?.userId;
        await axiosInstance.patch(
          `/ComplianceRule/update/${formData.complianceRuleDetailId}`,
          payload
        );
        toast.success("Compliance Rule Updated Successfully");
      } else {
        payload.createdBy = user?.userId;
        payload.isEnabled = true;
        await axiosInstance.post("/ComplianceRule/create", payload);
        toast.success("Compliance Rule Created Successfully");
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save rule. Check required fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";

  const labelClass = "block text-sm font-medium text-gray-700 mb-0.5";

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-xl shadow-lg relative p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute cursor-pointer top-3 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          {isEdit === "Edit" ? "Edit Compliance Rule" : "Add Compliance Rule"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* --- Section 1: Basic Info --- */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase">
              Basic Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Compliance Select */}
              <div>
                <label className={labelClass}>Compliance</label>
                <Select
                  name="complianceId"
                  value={
                    compliances
                      .map((c) => ({
                        value: String(c.complianceId),
                        label: c.complianceName,
                      }))
                      .find(
                        (opt) => opt.value === String(formData.complianceId)
                      ) || null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      complianceId: opt ? String(opt.value) : "",
                    }))
                  }
                  options={compliances.map((c) => ({
                    value: String(c.complianceId),
                    label: c.complianceName,
                  }))}
                  placeholder="Select Compliance"
                  isClearable
                  isDisabled={isEdit === "Edit"}
                />
              </div>

              <div>
                <label className={labelClass}>Rule Name</label>
                <input
                  type="text"
                  name="ruleName"
                  value={formData.ruleName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Rule Code</label>
                <input
                  type="text"
                  name="ruleCode"
                  value={formData.ruleCode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Rule Type</label>
                <input
                  type="text"
                  name="ruleType"
                  value={formData.ruleType}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Operator</label>
                <input
                  type="text"
                  name="operator"
                  value={formData.operator}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Value</label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* --- Section 2: Time & Shift --- */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase">
              Time & Shift
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "maxHoursPerDay",
                "maxHoursPerWeek",
                "maxHoursPerMonth",
                "shiftHourCap",
                "breakHourCap",
                "weeklyOffCap",
              ].map((field) => (
                <input
                  key={field}
                  type="number"
                  name={field}
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              ))}
            </div>
          </div>

          {/* --- Section 3: Overtime --- */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase">
              Overtime & Policy
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input
                type="number"
                name="maxOvertimeHours"
                placeholder="Max Overtime Hours"
                value={formData.maxOvertimeHours}
                onChange={handleChange}
                className={inputClass}
              />
              <input
                type="number"
                name="otMultiplier"
                placeholder="OT Multiplier"
                value={formData.otMultiplier}
                onChange={handleChange}
                className={inputClass}
              />
              <input
                type="text"
                name="penaltyType"
                placeholder="Penalty Type"
                value={formData.penaltyType}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {[
                { name: "allowMultipleShifts", label: "Allow Multiple Shifts" },
                {
                  name: "isOTAllowedOnHoliday",
                  label: "OT Allowed on Holiday",
                },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={name}
                    checked={formData[name]}
                    onChange={handleChange}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* --- Section 4: Applicability --- */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase">
              Applicability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Applicable For</label>
                <input
                  type="text"
                  name="ruleApplicableFor"
                  value={formData.ruleApplicableFor}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Applicable States</label>
                <input
                  type="text"
                  name="applicableStates"
                  value={formData.applicableStates}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Effective From</label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom?.split("T")[0] || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Effective To</label>
                <input
                  type="date"
                  name="effectiveTo"
                  value={formData.effectiveTo?.split("T")[0] || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Scope Level</label>
                <input
                  type="text"
                  name="scopeLevel"
                  value={formData.scopeLevel}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* --- Section 5: System Fields --- */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase">
              System Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Policy ID</label>
                <input
                  type="number"
                  name="policyId"
                  value={formData.policyId}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Pending", label: "Pending" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                  value={
                    [
                      { value: "Active", label: "Active" },
                      { value: "Pending", label: "Pending" },
                      { value: "Inactive", label: "Inactive" },
                    ].find((opt) => opt.value === formData.status) || null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: opt?.value || "",
                    }))
                  }
                  placeholder="Select Status"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          {/* --- Submit Button --- */}
          <div className="pt-4 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 cursor-pointer rounded-md font-medium text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? (
                <Spinner />
              ) : isEdit === "Edit" ? (
                "Update Rule"
              ) : (
                "Create Rule"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplianceRuleForm;
