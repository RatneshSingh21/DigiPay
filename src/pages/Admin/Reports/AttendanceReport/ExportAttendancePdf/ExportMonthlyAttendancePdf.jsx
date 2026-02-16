import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../../components/Spinner";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const ExportMonthlyAttendancePdfModal = ({ isOpen, onClose }) => {
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!month || !year) {
      toast.warning("Please select month and year");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/Attendance/export-monthly-pdf`,
        {
          params: { month: month.value, year: Number(year) },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Attendance_${month.value}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setLoading(false);
    }
  };

  const months = [
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Export Monthly Attendance</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-md cursor-pointer hover:bg-red-100 hover:text-red-500 bg-gray-100 transition"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Month
            </label>
            <Select
              options={months}
              value={month}
              onChange={setMonth}
              placeholder="Choose month"
              className="text-sm"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Year
            </label>
            <input
              type="number"
              min="2000"
              max="2100"
              className={inputClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border cursor-pointer border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-md cursor-pointer bg-primary text-white hover:bg-secondary transition flex items-center justify-center min-w-[120px]"
          >
            {loading ? <Spinner size="sm" /> : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportMonthlyAttendancePdfModal;
