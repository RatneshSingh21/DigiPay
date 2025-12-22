import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";
import axiosInstance from "../axiosInstance/axiosInstance";

const AddCompanyModal = ({ isOpen, onClose }) => {
  const { companyId, setCompanyId, updateUser, updateToken } = useAuthStore();

  const [formData, setFormData] = useState({
    companyName: "",
    companyCode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyId) onClose();
  }, [companyId, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/Company/create", formData);

      if (res.data) {
        const newCompanyId = res.data.company.companyId;
        const newToken = res.data.token;

        updateToken(newToken);
        setCompanyId(newCompanyId);
        updateUser({ companyId: newCompanyId });

        toast.success("Company created successfully!");
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  if (companyId) return null;

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm transition-opacity duration-300 ease-in-out" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">
            Add Company
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                autoFocus
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Code</label>
              <input
                type="text"
                name="companyCode"
                value={formData.companyCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secondary disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddCompanyModal;
