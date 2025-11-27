import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const SalaryCalculateGenerateAllForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        "/CalculatedSalary/GenerateAll",
        {},
        { params: form }
      );

      toast.success("All salaries generated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to generate salary");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-5 text-center text-gray-800">
          Generate All Salaries
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="number"
              name="month"
              min={1}
              max={12}
              value={form.month}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 cursor-pointer rounded-lg text-sm hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-primary cursor-pointer hover:bg-secondary text-white rounded-lg text-sm"
            >
              Generate All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryCalculateGenerateAllForm;
