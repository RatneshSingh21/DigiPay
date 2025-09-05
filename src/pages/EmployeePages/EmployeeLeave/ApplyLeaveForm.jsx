import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";

const ApplyLeaveForm = ({ leaveOptions, employeeOptions, onClose, showModal, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: null,
    from: "",
    to: "",
    reason: "",
    approvers: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const errorMsg = await onSubmit(formData);
    if (errorMsg) {
      setError(errorMsg);
    } else {
      setFormData({ type: null, from: "", to: "", reason: "", approvers: [] });
      onClose();
    }
    setLoading(false);
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
          {/* Leave Type */}
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
          {/* Date range */}
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
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              placeholder="Enter your reason for leave"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Approvers Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approvers
            </label>
            <Select
              options={employeeOptions}
              value={formData.approvers}
              onChange={(selected) =>
                setFormData({ ...formData, approvers: selected })
              }
              isMulti
              placeholder="Select approvers"
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
