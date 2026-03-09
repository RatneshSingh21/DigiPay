import React, { useEffect, useState } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function AttendanceVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [departments, setDepartments] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

  /* ================= FETCH DEPARTMENTS ================= */
  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/Department");
      setDepartments(res.data || []);
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  /* ================= FETCH AUTHORITIES ================= */
  const fetchAuthorities = async () => {
    try {
      const res = await axiosInstance.get("/hierarchy/department-authority");
      if (res.data.success) {
        setAuthorities(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load authorities");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchAuthorities();
    }
  }, [isOpen]);

  /* ================= GET AUTHORIZED PERSON ================= */
  const getAuthorizedPerson = () => {
    const auth = authorities.find(
      (a) => a.departmentId === selectedDept?.value && a.isPrimary,
    );
    return auth ? auth.employeeName : "No primary authority found";
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedDept?.value || !fromDate || !toDate) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        `/Attendance/department/${selectedDept.value}/send-verification`,
        null,
        {
          params: {
            fromDate,
            toDate,
          },
          responseType: "blob", // 🔥 REQUIRED for file download
        },
      );

      // 🔥 Create file download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Attendance_${fromDate}_${toDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Attendance file downloaded successfully");

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to download attendance file");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-gray-200">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-800">
            Send Attendance Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 space-y-4">
          {/* Department */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Department
            </label>
            <Select
              options={departmentOptions}
              value={selectedDept}
              onChange={(option) => setSelectedDept(option)}
              placeholder="Select Department"
            />
          </div>

          {/* Authorized Person */}
          {selectedDept && (
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-md">
              <p className="text-sm text-indigo-700">
                <span className="font-medium">Authorized Person:</span>{" "}
                {getAuthorizedPerson()}
              </p>
            </div>
          )}

          {/* From Date */}
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

          {/* To Date */}
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

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-secondary cursor-pointer disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
