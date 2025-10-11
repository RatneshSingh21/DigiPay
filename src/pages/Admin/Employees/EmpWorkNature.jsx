import React, { useEffect, useState } from "react";
import { FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmpWorkNature = () => {
  const [workNatures, setWorkNatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const User = useAuthStore((state) => state.user);
  const [form, setForm] = useState({
    workNatureName: "",
    description: "",
    isActive: true,
    createdDate: new Date().toISOString(),
    createdBy: "",
    updatedDate: new Date().toISOString(),
    updatedBy: "",
  });

  const fetchWorkNatures = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/WorkNatureMaster/list");
      setWorkNatures(res.data || []);
    } catch (err) {
      console.error(err?.response?.data?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkNatures();
  }, []);

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
      const res = await axiosInstance.post("/WorkNatureMaster/create", form);
      toast.success(res.data.message);
      setShowModal(false);
      setForm({
        workNatureName: "",
        description: "",
        isActive: true,
        createdDate: new Date().toISOString(),
        createdBy: "",
        updatedDate: new Date().toISOString(),
        updatedBy: "",
      });
      fetchWorkNatures();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create work nature"
      );
      console.error(err);
    }
  };

  return (
    <div>
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Work Natures</h2>
        <div className="flex items-center text-sm gap-3">
          <button
            onClick={fetchWorkNatures}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
          >
            <FiPlus /> Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-100 text-gray-600 text-center">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-4">
                  Loading...
                </td>
              </tr>
            ) : workNatures.length > 0 ? (
              workNatures.map((item, idx) => (
                <tr key={item.workNatureId} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{item.workNatureName}</td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    {new Date(item.createdDate).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4">
                  No work natures found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            {/* Title */}
            <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
              Add Work Nature
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="workNatureName"
                  value={form.workNatureName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter work nature name"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter description"
                  rows={3}
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

export default EmpWorkNature;
