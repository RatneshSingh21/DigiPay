import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../../components/Spinner";

const ExportMonthlyAttendanceEmployeewisePdfModal = ({ isOpen, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filter, setFilter] = useState({
    value: "month",
    label: "Current Month",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get("/Employee");

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid employee response");
        }

        const formattedEmployees = res.data
          .map((emp) => ({
            value: emp.id,
            label: `${emp.fullName} (${emp.employeeCode})`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setEmployees(formattedEmployees);
      } catch (error) {
        console.error("Employee fetch error:", error);
        toast.error("Failed to fetch employees");
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isOpen]);

  const handleExport = async () => {
    if (!selectedEmployee || !filter) {
      toast.warning("Please select employee and filter");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/Attendance/employee/${selectedEmployee.value}/export-pdf`,
        {
          params: {
            filter: filter.value,
          },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Attendance_${selectedEmployee.label}_${filter.value}.pdf`;
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

  const filterOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Current Month" },
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
          <h2 className="text-lg font-semibold">Export Daily Attendance Employee-Wise PDF</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-md cursor-pointer hover:bg-red-100 hover:text-red-500 bg-gray-100 transition"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Employee
            </label>
            <Select
              options={employees}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder={loading ? "Loading employees..." : "Choose employee"}
              isLoading={loading}
              className="text-sm"
            />
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Duration
            </label>
            <Select
              options={filterOptions}
              value={filter}
              onChange={setFilter}
              className="text-sm"
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

export default ExportMonthlyAttendanceEmployeewisePdfModal;
