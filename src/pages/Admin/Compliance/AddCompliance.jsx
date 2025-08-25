import React, { useEffect, useState } from "react";
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

        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {isEdit === "Edit" ? "Edit Compliance" : "Add Compliance"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Compliance Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Compliance Name
            </label>
            <input
              type="text"
              name="complianceName"
              value={formData.complianceName}
              onChange={handleChange}
              placeholder="Enter compliance name"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              required
            />
          </div>

          {/* Compliance Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Compliance Code
            </label>
            <input
              type="text"
              name="complianceCode"
              value={formData.complianceCode}
              onChange={handleChange}
              placeholder="Enter compliance code"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a short description..."
              rows={3}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Applicable States */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Applicable States
            </label>
            <input
              type="text"
              name="applicableStates"
              value={formData.applicableStates}
              onChange={handleChange}
              placeholder="Enter states (comma separated)"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Rule Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rule Count
            </label>
            <input
              type="number"
              name="ruleCount"
              value={formData.ruleCount}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Is Enabled */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isEnabled"
              checked={formData.isEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enabled</label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg shadow text-white transition ${
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
