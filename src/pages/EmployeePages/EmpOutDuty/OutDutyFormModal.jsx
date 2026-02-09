import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import { FiX } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";

const OutDutyFormModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    inDateTime: "",
    outDateTime: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Handle Input ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Validation ----------------
  const validateForm = () => {
    const { inDateTime, outDateTime, reason } = formData;

    if (!inDateTime || !outDateTime || !reason) {
      return "Please complete all fields.";
    }

    const now = new Date();
    const inDate = new Date(inDateTime);
    const outDate = new Date(outDateTime);

    if (inDate < now) {
      return "In Date & Time cannot be in the past.";
    }

    if (outDate <= inDate) {
      return "Out Date & Time must be later than In Date & Time.";
    }

    if (reason.trim().length < 3) {
      return "Reason must be at least 3 characters long.";
    }

    return null;
  };

  // ---------------- Handle Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        inDateTime: formData.inDateTime,
        outDateTime: formData.outDateTime,
        reason: formData.reason.trim(),
        isActive: true,
        customApproverIds: [], // ✅ ALWAYS EMPTY
      };

      await axiosInstance.post("/OnDuty", payload);

      toast.success("Out Duty request submitted successfully!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          "Failed to submit request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg animate-fade-in">
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Out Duty Request
          </h3>
          <button onClick={onClose}>
            <FaTimes className="text-gray-500 hover:text-red-500 transition cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 px-6 py-4">
          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-100 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {/* In Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              In Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="inDateTime"
              value={formData.inDateTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Out Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Out Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="outDateTime"
              value={formData.outDateTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              rows={4}
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explain the reason for Out Duty"
              className={inputClass}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 cursor-pointer rounded-lg py-2.5 text-white font-medium transition ${
              loading
                ? "bg-primary/70 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {loading ? <Spinner /> : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OutDutyFormModal;
