import React, { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";


const EmpCategory = () => {
  const User = useAuthStore((state) => state.user);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    categoryName: "",
    description: "",
    isActive: true,
    createdBy: User.userId,
    createdAt: new Date().toISOString(),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/Category/create", form);
      toast.success(res.data.message || "Category created successfully");
      setShowModal(false);

      // Reset form
      setForm({
        categoryName: "",
        description: "",
        isActive: true,
        createdBy: User.userId,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create category");
      console.error(err);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div>
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Categories</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-xs"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
              Add Category
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              {/* Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-xs text-gray-700">Active</label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 cursor-pointer text-xs rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 cursor-pointer text-xs bg-primary text-white rounded-lg hover:bg-secondary transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpCategory;
