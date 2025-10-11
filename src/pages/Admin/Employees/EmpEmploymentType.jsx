import React, { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";


const EmpEmploymentType = () => {
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    employmentTypeName: "",
    description: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "",
    updatedBy: "",
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
      const res = await axiosInstance.post("/EmploymentType/create", form);
      toast.success(res.data.message || "Employment Type created successfully");
      setShowModal(false);
      setForm({
        employmentTypeName: "",
        description: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "",
        updatedBy: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create Employment Type");
      console.error(err);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div>
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Employment Types</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center text-sm cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg cursor-pointer font-semibold mb-5 text-gray-800 text-center">
              Add Employment Type
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Employment Type Name */}
              <div>
                <label className="block mb-1">Employment Type Name *</label>
                <input
                  type="text"
                  name="employmentTypeName"
                  value={form.employmentTypeName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Enter employment type name"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1">Description *</label>
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-xs">Active</label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
};

export default EmpEmploymentType;
