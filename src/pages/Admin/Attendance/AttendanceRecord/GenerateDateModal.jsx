import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ModalWrapper from "./ModalWrapper";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const labelClass = "block text-sm font-medium text-gray-700";

const GenerateDateModal = ({ show, onClose, onSuccess }) => {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!date) return toast.error("Select date");

    try {
      setLoading(true);

      await axiosInstance.post(
        `/AttendanceRecord/GenerateForDate?date=${date}`,
      );

      toast.success("Generated successfully");
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
      title="Generate Attendance for Date"
    >
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className={labelClass}>
            Select Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 cursor-pointer text-white py-2 rounded-lg"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default GenerateDateModal;
