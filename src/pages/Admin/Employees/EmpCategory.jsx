import React, { useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const EmpCategory = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    categoryName: "",
    description: "",
    isActive: true,
  });

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/Category/all");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        categoryName: form.categoryName,
        description: form.description,
        isActive: form.isActive,
      };

      const res = await axiosInstance.post("/Category/create", payload);
      toast.success(res.data.message || "Category created successfully");
      setShowModal(false);

      // Reset form
      setForm({
        categoryName: "",
        description: "",
        isActive: true,
      });

      // Refresh category list
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center rounded-md">
        <h2 className="font-semibold text-xl">Categories</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-6">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No categories found.
          </p>
        ) : (
          <table className="min-w-full divide-y text-xs text-center divide-gray-200">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Category Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr
                  key={cat.categoryId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {cat.categoryName}
                  </td>
                  <td className="px-4 py-2">{cat.description}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        cat.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(cat.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Category Modal */}
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
