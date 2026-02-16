import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ModalWrapper from "./ModalWrapper";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const GenerateMonthlyModal = ({ show, onClose, employees, onSuccess }) => {
  const [employee, setEmployee] = useState(null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!employee || !year || !month) return toast.error("All fields required");

    try {
      setLoading(true);
      await axiosInstance.post("/AttendanceRecord/generateMonthlyAttendance", {
        employeeId: employee.value,
        year: Number(year),
        month: Number(month),
      });

      toast.success("Monthly attendance generated");
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
      title="Generate Monthly Attendance"
    >
      <div className="space-y-4">
        <Select options={employees} value={employee} onChange={setEmployee} />

        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={inputClass}
        />

        <input
          type="number"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={inputClass}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-primary cursor-pointer hover:bg-secondary text-white py-2 rounded-lg"
        >
          {loading ? "Processing..." : "Generate"}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default GenerateMonthlyModal;
