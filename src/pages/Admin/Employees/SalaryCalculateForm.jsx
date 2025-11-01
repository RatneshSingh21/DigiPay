import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const SalaryCalculateForm = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeCode: "",
    employeeName: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axiosInstance.get("/Employee");
        const options = data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
        }));
        setEmployees(options);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch employees");
      }
    };

    fetchEmployees();
  }, []);

  // Handle react-select change
  const handleEmployeeChange = (option) => {
    setSelectedEmployee(option);
    setFormData((prev) => ({
      ...prev,
      employeeId: option.value,
      employeeCode: option.employeeCode,
      employeeName: option.fullName,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    try {
      await axiosInstance.post("/CalculatedSalary/Generate", formData);
      toast.success("Salary generated successfully!");
      onSuccess(); // refresh list
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to generate salary");
    }
  };












  

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <FiX size={20} />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
          Generate Salary
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <Select
              options={employees}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              placeholder="Select Employee..."
              className="text-sm"
            />
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="month"
              min={1}
              max={12}
              value={formData.month}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter Month"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter Year"
            />
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
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryCalculateForm;
