import { useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const ExportAttendanceModal = ({ onClose }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From Date and To Date");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.get("/Attendance/export-datewise", {
        params: { fromDate, toDate },
        responseType: "blob",
      });

      // Success → download file
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Attendance_${fromDate}_to_${toDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Attendance exported successfully");
      onClose();
    } catch (error) {
      console.error(error);

      // Handle 404 JSON error returned as Blob
      if (
        error.response &&
        error.response.data instanceof Blob &&
        error.response.data.type === "application/json"
      ) {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        toast.error(json.message || "No records found");
      } else {
        toast.error("Failed to export attendance");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Export Attendance
          </h3>

          <button
            onClick={onClose}
            className="rounded-md p-1 cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="rounded-md bg-green-600 px-5 py-2 text-sm cursor-pointer font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportAttendanceModal;
