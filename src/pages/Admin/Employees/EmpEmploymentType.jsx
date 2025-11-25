import React, { useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmpEmploymentType = () => {
  const [showModal, setShowModal] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    employmentTypeName: "",
    description: "",
    isActive: true,
  });

  // Fetch all Employment Types
  const fetchEmploymentTypes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/EmploymentType/all");
      setEmploymentTypes(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Employment Types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmploymentTypes();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employmentTypeName: form.employmentTypeName.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      };

      const res = await axiosInstance.post("/EmploymentType/create", payload);
      toast.success(res.data.message || "Employment Type created successfully");

      setShowModal(false);
      setForm({ employmentTypeName: "", description: "", isActive: true });
      fetchEmploymentTypes();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to create Employment Type"
      );
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center rounded-md">
        <h2 className="font-semibold text-xl">Employment Types</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center text-sm cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-6">Loading...</p>
        ) : employmentTypes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No Employment Types found.
          </p>
        ) : (
          <table className="min-w-full divide-y text-xs text-center divide-gray-200">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Employment Type Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {employmentTypes.map((type, index) => (
                <tr
                  key={type.employmentTypeId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {type.employmentTypeName}
                  </td>
                  <td className="px-4 py-2">{type.description ? type.description : "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        type.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {type.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {type.createdAt
                      ? new Date(type.createdAt).toLocaleString("en-IN")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employment Type Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
              Add Employment Type
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Employment Type Name */}
              <div>
                <label className="block mb-1">
                  Employment Type Name <span className="text-red-500">*</span>
                </label>
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
                <label className="block mb-1">
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

              {/* Active Checkbox */}
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

              {/* Buttons */}
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
