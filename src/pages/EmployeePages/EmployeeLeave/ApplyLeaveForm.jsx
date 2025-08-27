import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance"; // adjust path
import { toast } from "react-toastify";
import useAuthStore from "../../../store/authStore"; // assuming you store employeeId here

const ApplyLeaveForm = ({ 
  leaveOptions, 
  onClose, 
  showModal,
  onSuccess
}) => {
  const { user } = useAuthStore(); // contains employeeId
  const [formData, setFormData] = useState({
    type: null,
    from: "",
    to: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type) {
      setError("Please select a leave type.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const payload = {
        employeeId: user?.employeeId || 0,
        leaveTypeId: formData.type.value,  // assuming leaveOptions has {value, label}
        leaveName: formData.type.label,
        leaveCode: formData.type.code || "", // if available in options
        fromDate: new Date(formData.from).toISOString(),
        toDate: new Date(formData.to).toISOString(),
        reason: formData.reason,
        status: "Pending",
        approvedBy: 0,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
      };

      const res = await axiosInstance.post("/api/EmployeeLeave", payload);

      toast.success("Leave request submitted successfully!");
      setFormData({ type: null, from: "", to: "", reason: "" });
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit leave request!");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md animate-fade-in">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-800">Apply Leave</h3>
          <button onClick={onClose}>
            <FaTimes className="text-gray-600 hover:text-red-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <Select
              options={leaveOptions}
              value={formData.type}
              onChange={(selected) =>
                setFormData({ ...formData, type: selected })
              }
              placeholder="Select Leave Type"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your reason for leave"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveForm;
