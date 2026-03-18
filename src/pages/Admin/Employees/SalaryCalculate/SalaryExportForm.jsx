import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { X } from "lucide-react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const SalaryExportForm = ({ onClose }) => {
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

      const response = await axiosInstance.get(`/CalculatedSalary/export-monthly-payroll`, {
        params: {
          month: month.value,
          year: year,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const fileName = `CalculatedSalary_${month.value}_${year}.xlsx`;

      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Salary exported successfully");

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to export salary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[400px] shadow-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-200 px-4 py-2">
          <h2 className="font-semibold text-lg">Export Excel</h2>
          <button
            onClick={onClose}
            className="text-red-500 cursor-pointer font-bold"
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Month</label>
            <Select
              options={months}
              value={month}
              onChange={setMonth}
              placeholder="Select month"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm border border-gray-200 rounded-md cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="px-3 py-1 text-sm bg-primary hover:bg-secondary cursor-pointer text-white rounded-md"
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryExportForm;
