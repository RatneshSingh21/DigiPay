import React, { useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Select from "react-select";

const ManualSalaryCalculateForm = ({ onClose, onSuccess }) => {
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!month || !year) {
      toast.error("Please select month and enter year");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        `/CalculatedSalary/CalculateFromAttendance?month=${month.value}&year=${year}`
      );
      toast.success("Salary calculated successfully from attendance!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to calculate salary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[400px] animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Manual Salary from Attendance
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 cursor-pointer hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month */}
          <div>
            <label className="text-sm font-medium">Month</label>
            <Select
              options={monthOptions}
              value={month}
              onChange={setMonth}
              placeholder="Select Month"
              isSearchable
              required
            />
          </div>

          {/* Year */}
          <div>
            <label className="text-sm font-medium">Year</label>
            <input
              type="number"
              className="border px-2 py-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Enter Year"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4 text-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border cursor-pointer rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-secondary cursor-pointer text-white rounded-lg"
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualSalaryCalculateForm;
