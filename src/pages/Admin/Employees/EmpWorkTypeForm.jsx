import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";
import { fetchAllHROptions } from "../../../services/workTypeService";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const EmpWorkTypeForm = ({ user, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    workTypeName: "",
    description: "",
    categoryId: null,
    employmentTypeId: null,
    workNatureId: null,
    shiftId: null,
    workHoursPerDay: "",
    breakHours: "",
    overtimeApplicable: true,
    otRateSlabId: null,
    weekendPolicyId: null,
    payScheduleId: null,
    minWageRate: "",
    isPieceRateApplicable: true,
    pieceRateFormulaId: null,
    complianceGroupId: null,
    unionApplicable: true,
    factoryActCoverage: true,
    pfApplicable: true,
    esiApplicable: true,
    leavePolicyId: null,
    isActive: true,
    createdBy: user?.userId,
    createdDate: new Date().toISOString(),
    updatedBy: user?.userId,
    updatedDate: new Date().toISOString(),
  });

  const [dropdowns, setDropdowns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const data = await fetchAllHROptions();
        setDropdowns(data);
      } catch (err) {
        toast.error("Failed to load dropdowns");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (field, selected) => {
    setForm((prev) => ({
      ...prev,
      [field]: selected ? selected.value : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/WorkTypeMaster/create", form);
      toast.success(res.data.message || "Work Type created successfully");
      onClose();
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create Work Type");
      console.error(err);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  if (loading) return <Spinner />; // show spinner while loading

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative overflow-y-auto max-h-[75vh]">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
          Add Work Type
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Text Inputs */}
          <Input
            label="Work Type Name *"
            name="workTypeName"
            value={form.workTypeName}
            onChange={handleChange}
            required
          />
          <Textarea
            label="Description *"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-2">
            <SelectField
              label="Category"
              options={dropdowns.categoryIds}
              value={form.categoryId}
              onChange={(v) => handleSelectChange("categoryId", v)}
            />
            <SelectField
              label="Employment Type"
              options={dropdowns.employmentTypeIds}
              value={form.employmentTypeId}
              onChange={(v) => handleSelectChange("employmentTypeId", v)}
            />
            <SelectField
              label="Work Nature"
              options={dropdowns.workNatureIds}
              value={form.workNatureId}
              onChange={(v) => handleSelectChange("workNatureId", v)}
            />
            <SelectField
              label="Shift"
              options={dropdowns.shiftIds}
              value={form.shiftId}
              onChange={(v) => handleSelectChange("shiftId", v)}
            />
            <SelectField
              label="OT Rate Slab"
              options={dropdowns.otRateSlabIds}
              value={form.otRateSlabId}
              onChange={(v) => handleSelectChange("otRateSlabId", v)}
            />
            <SelectField
              label="Weekend Policy"
              options={dropdowns.weekendPolicyIds}
              value={form.weekendPolicyId}
              onChange={(v) => handleSelectChange("weekendPolicyId", v)}
            />
            <SelectField
              label="Pay Schedule"
              options={dropdowns.payScheduleIds}
              value={form.payScheduleId}
              onChange={(v) => handleSelectChange("payScheduleId", v)}
            />
          </div>

          {/* Numeric Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Work Hours Per Day *"
              name="workHoursPerDay"
              type="number"
              value={form.workHoursPerDay}
              onChange={handleChange}
              required
            />
            <Input
              label="Break Hours"
              name="breakHours"
              type="number"
              value={form.breakHours}
              onChange={handleChange}
            />
            <Input
              label="Minimum Wage Rate"
              name="minWageRate"
              type="number"
              value={form.minWageRate}
              onChange={handleChange}
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Overtime Applicable", "overtimeApplicable"],
              ["Piece Rate Applicable", "isPieceRateApplicable"],
              ["Union Applicable", "unionApplicable"],
              ["Factory Act Coverage", "factoryActCoverage"],
              ["PF Applicable", "pfApplicable"],
              ["ESI Applicable", "esiApplicable"],
              ["Active", "isActive"],
            ].map(([label, key]) => (
              <CheckboxField
                key={key}
                label={label}
                checked={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 cursor-pointer text-sm bg-primary text-white rounded-lg hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Reusable Inputs ---
const Input = ({ label, ...props }) => (
  <div>
    <label>{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label>{label}</label>
    <textarea
      {...props}
      rows={2}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div>
    <label>{label}</label>
    <Select
      options={options}
      value={value ? options.find((o) => o.value === value) : null}
      onChange={onChange}
      styles={{
        menu: (base) => ({ ...base, fontSize: "12px" }),
        control: (base) => ({ ...base, fontSize: "12px" }),
      }}
    />
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 accent-primary border-gray-300 rounded"
    />
    <span className="text-xs">{label}</span>
  </div>
);

export default EmpWorkTypeForm;
