import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const AddPunchTypeModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     
    try {
      const res = await axiosInstance.post("/PunchType", form);
      if (res.data.success) {
        toast.success("Punch Type added successfully!");
        onSuccess();
      } else {
        toast.error(res.data.message || "Failed to add punch type");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding punch type");
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-5 text-gray-800">
          Add Punch Type
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter code"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
               className={inputClass}
              placeholder="Enter name"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
               className={inputClass}
              placeholder="Enter category"
            />
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 cursor-pointer text-sm bg-primary text-white rounded-lg hover:bg-secondary transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPunchTypeModal;
