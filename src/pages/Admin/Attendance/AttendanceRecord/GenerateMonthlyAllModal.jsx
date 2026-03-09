import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ModalWrapper from "./ModalWrapper";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const labelClass = "block text-sm font-medium text-gray-700";

/* Month Options */
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

const GenerateMonthlyAllModal = ({ show, onClose, onSuccess }) => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!year || !month) return toast.error("Year and Month required");

    try {
      setLoading(true);

      await axiosInstance.post("/AttendanceRecord/generate-month-all", {
        year: Number(year),
        month: month.value,
      });

      toast.success("Monthly attendance generated for all employees");

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      title="Generate Monthly Attendance (All Employees)"
    >
      <div className="space-y-4">
        {/* Month */}
        <div>
          <label className={labelClass}>
            Month <span className="text-red-500">*</span>
          </label>
          <Select
            options={monthOptions}
            value={month}
            onChange={setMonth}
            placeholder="Select Month"
          />
        </div>

        {/* Year */}
        <div>
          <label className={labelClass}>
            Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="Enter year (e.g. 2026)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-purple-600 cursor-pointer hover:bg-purple-700 text-white py-2 rounded-lg"
        >
          {loading ? "Processing..." : "Generate For All Employees"}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default GenerateMonthlyAllModal;
