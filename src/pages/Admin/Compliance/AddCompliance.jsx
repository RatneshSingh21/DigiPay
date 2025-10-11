import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";

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
      setFormData({ ...initialData });
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

    try {
      const payload = {
        ...formData,
        createdBy: user?.name,
      };

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

    setFormData({
      complianceName: "",
      complianceCode: "",
      isEnabled: false,
      description: "",
      applicableStates: "",
      ruleCount: 0,
      status: "",
    });
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Applicable States
            </label>
            <input
              type="text"
              name="applicableStates"
              value={formData.applicableStates}
              onChange={handleChange}
              placeholder="Enter states (comma separated)"
              className={inputClass}
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
