import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ModalWrapper from "./ModalWrapper";

const GenerateDateModal = ({ show, onClose, onSuccess }) => {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!date) return toast.error("Select date");

    try {
      setLoading(true);
      await axiosInstance.post(`/AttendanceRecord/GenerateForDate?date=${date}`);

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
    <ModalWrapper show={show} onClose={onClose} title="Generate Attendance for Date">
      <div className="space-y-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default GenerateDateModal;
