import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";

const indianStates = [
  { value: "AN", label: "Andaman & Nicobar (AN)" },
  { value: "AP", label: "Andhra Pradesh (AP)" },
  { value: "AR", label: "Arunachal Pradesh (AR)" },
  { value: "AS", label: "Assam (AS)" },
  { value: "BR", label: "Bihar (BR)" },
  { value: "CH", label: "Chandigarh (CH)" },
  { value: "CT", label: "Chhattisgarh (CT)" },
  { value: "DL", label: "Delhi (DL)" },
  { value: "DN", label: "Dadra & Nagar Haveli (DN)" },
  { value: "DD", label: "Daman & Diu (DD)" },
  { value: "GA", label: "Goa (GA)" },
  { value: "GJ", label: "Gujarat (GJ)" },
  { value: "HR", label: "Haryana (HR)" },
  { value: "HP", label: "Himachal Pradesh (HP)" },
  { value: "JK", label: "Jammu & Kashmir (JK)" },
  { value: "JH", label: "Jharkhand (JH)" },
  { value: "KA", label: "Karnataka (KA)" },
  { value: "KL", label: "Kerala (KL)" },
  { value: "LA", label: "Ladakh (LA)" },
  { value: "LD", label: "Lakshadweep (LD)" },
  { value: "MP", label: "Madhya Pradesh (MP)" },
  { value: "MH", label: "Maharashtra (MH)" },
  { value: "MN", label: "Manipur (MN)" },
  { value: "ML", label: "Meghalaya (ML)" },
  { value: "MZ", label: "Mizoram (MZ)" },
  { value: "NL", label: "Nagaland (NL)" },
  { value: "OR", label: "Odisha (OR)" },
  { value: "PB", label: "Punjab (PB)" },
  { value: "PY", label: "Puducherry (PY)" },
  { value: "RJ", label: "Rajasthan (RJ)" },
  { value: "SK", label: "Sikkim (SK)" },
  { value: "TN", label: "Tamil Nadu (TN)" },
  { value: "TS", label: "Telangana (TS)" },
  { value: "TR", label: "Tripura (TR)" },
  { value: "UP", label: "Uttar Pradesh (UP)" },
  { value: "UK", label: "Uttarakhand (UK)" },
  { value: "WB", label: "West Bengal (WB)" },
];
const selectAllOption = { value: "ALL", label: "Select All States" };
const stateOptions = [selectAllOption, ...indianStates];

const AddCompliance = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    complianceName: "",
    complianceCode: "",
    isEnabled: false,
    description: "",
    applicableStates: "",
    ruleCount: 0,
    status: "",
  });

  const { user } = useAuthStore();

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        ...initialData,
        applicableStates: initialData.applicableStates
          ? initialData.applicableStates.split(",")
          : [],
      });
    }
  }, [isEdit, initialData]);

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Pending", label: "Pending" },
    { value: "Inactive", label: "Inactive" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      complianceName: formData.complianceName,
      complianceCode: formData.complianceCode,
      isEnabled: formData.isEnabled,
      description: formData.description,
      applicableStates: formData.applicableStates.join(","), // Convert array to string
      ruleCount: Number(formData.ruleCount),
      status: formData.status,
    };

    try {
      if (isEdit === "Edit") {
        await axiosInstance.put(
          `/Compliance/update/${formData.complianceId}`,
          payload
        );
        toast.success("Compliance Updated Successfully");
      } else {
        await axiosInstance.post("/Compliance/create", payload);
        toast.success("Compliance Created Successfully");
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving Compliance");
    } finally {
      setLoading(false);
    }

    // reset only for add mode
    if (isEdit !== "Edit") {
      setFormData({
        complianceName: "",
        complianceCode: "",
        isEnabled: false,
        description: "",
        applicableStates: "",
        ruleCount: 0,
        status: "",
      });
    }
  };

  const handleStatesChange = (selectedOptions) => {
    if (!selectedOptions) {
      setFormData({ ...formData, applicableStates: [] });
      return;
    }

    // When 'Select All' is clicked
    if (selectedOptions.some((opt) => opt.value === "ALL")) {
      setFormData({
        ...formData,
        applicableStates: indianStates.map((s) => s.value), // Only state codes
      });
    } else {
      setFormData({
        ...formData,
        applicableStates: selectedOptions.map((opt) => opt.value),
      });
    }
  };

  const inputClass =
    "w-full px-4 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-2xl shadow-xl relative p-8 sm:p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {isEdit === "Edit" ? "Edit Compliance" : "Add Compliance"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Compliance Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Compliance Name
            </label>
            <input
              type="text"
              name="complianceName"
              value={formData.complianceName}
              onChange={handleChange}
              placeholder="Enter compliance name"
              className={inputClass}
              required
              autoFocus
            />
          </div>

          {/* Compliance Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Compliance Code
            </label>
            <input
              type="text"
              name="complianceCode"
              value={formData.complianceCode}
              onChange={handleChange}
              placeholder="Enter compliance code"
              className={inputClass}
            />
          </div>

          {/* Applicable States */}
          {/* Applicable States */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Applicable States
            </label>

            <Select
              isMulti
              options={stateOptions}
              value={[
                ...stateOptions.filter((opt) =>
                  formData.applicableStates.includes(opt.value)
                ),
              ]}
              onChange={handleStatesChange}
              placeholder="Select applicable states..."
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#93c5fd",
                  minHeight: "36px",
                  "&:hover": { borderColor: "#60a5fa" },
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 6px",
                }),
              }}
            />
          </div>

          {/* Rule Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Rule Count
            </label>
            <input
              type="number"
              name="ruleCount"
              value={formData.ruleCount}
              onChange={handleChange}
              min="0"
              className={inputClass}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Status
            </label>
            <Select
              options={statusOptions}
              value={
                statusOptions.find((opt) => opt.value === formData.status) ||
                null
              }
              onChange={(selectedOption) =>
                setFormData({
                  ...formData,
                  status: selectedOption?.value || "",
                })
              }
              placeholder="Select status..."
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#93c5fd",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#60a5fa" },
                  minHeight: "36px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 6px",
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: "2px",
                }),
              }}
            />
          </div>

          {/* Is Enabled */}
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="isEnabled"
              checked={formData.isEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enabled</label>
          </div>

          {/* Description — full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a short description..."
              rows={3}
              className={inputClass}
            />
          </div>

          {/* Submit Button — full width */}
          <div className="pt-4 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full cursor-pointer py-2 px-4 rounded-lg shadow text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? (
                <Spinner />
              ) : isEdit === "Edit" ? (
                "Update Compliance"
              ) : (
                "Save Compliance"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompliance;
