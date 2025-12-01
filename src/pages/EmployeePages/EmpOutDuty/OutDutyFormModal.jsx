import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import Select from "react-select";

const OutDutyFormModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    inDateTime: "",
    outDateTime: "",
    reason: "",
    approvers: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [error, setError] = useState("");
  const [approverOptions, setApproverOptions] = useState([]);

  // ---------------- Handle Input ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Fetch Approvers ----------------
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoadingApprovers(true);
        const res = await axiosInstance.get(
          "/EmployeeRoleMapping/approvers/all"
        );

        if (Array.isArray(res.data)) {
          const outDutyRule = res.data.find(
            (rule) => rule.requestType?.toLowerCase() === "onduty"
          );

          if (outDutyRule?.approvers?.length) {
            const formatted = outDutyRule.approvers.map((a) => ({
              value: a.employeeId,
              label: `${a.employeeName} (${a.roleName})`,
              role: a.roleName,
            }));
            setApproverOptions(formatted);

            // Auto-select Admin(s)
            const adminApprovers = formatted.filter(
              (emp) => emp.role?.toLowerCase() === "admin"
            );
            if (adminApprovers.length > 0) {
              setFormData((prev) => ({ ...prev, approvers: adminApprovers }));
            }
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load approvers");
      } finally {
        setLoadingApprovers(false);
      }
    };

    fetchApprovers();
  }, []);

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
        customApproverIds: formData.approvers?.map((a) => a.value) || [],
      };

      await axiosInstance.post("/OnDuty", payload);

      toast.success("Out Duty request submitted successfully!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          "Failed to submit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center px-2 sm:px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-xl p-4 sm:p-6 relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 cursor-pointer text-gray-500 hover:text-red-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-5 text-gray-800">
          Submit Out Duty Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* 🔹 Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* In Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              In Date & Time
            </label>
            <input
              type="datetime-local"
              name="inDateTime"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
              value={formData.inDateTime}
              onChange={handleChange}
              required
            />
          </div>

          {/* Out Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Out Date & Time
            </label>
            <input
              type="datetime-local"
              name="outDateTime"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
              value={formData.outDateTime}
              onChange={handleChange}
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
              rows={3}
              placeholder="Reason for Out Duty"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          {/* Approvers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approvers
            </label>
            <Select
              options={approverOptions}
              value={formData.approvers}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, approvers: val || [] }))
              }
              isMulti
              isLoading={loadingApprovers}
              placeholder="Select approvers"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`bg-primary flex items-center justify-center text-white px-4 sm:px-6 py-2 rounded transition w-full sm:w-auto ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-secondary cursor-pointer"
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
