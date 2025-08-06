import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { format, isBefore, isAfter, parseISO } from "date-fns";
import Select from "react-select";
import { toast } from "react-toastify";
import StatusPill from "../../../components/StatusPill";

const mockLeaveBalance = {
  CL: 5,
  SL: 3,
  EL: 8,
};

const mockLeaveHistory = [
  {
    id: 1,
    type: "CL",
    from: "2025-07-12",
    to: "2025-07-13",
    status: "Approved",
  },
  {
    id: 2,
    type: "SL",
    from: "2025-06-18",
    to: "2025-06-18",
    status: "Rejected",
  },
];

const EmpLeaveRequest = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: null,
    from: "",
    to: "",
    reason: "",
  });
  const [error, setError] = useState("");

  const leaveOptions = Object.entries(mockLeaveBalance).map(
    ([type, count]) => ({
      label: `${type} (${count} left)`,
      value: type,
    })
  );

  const handleOpenModal = () => {
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ type: null, from: "", to: "", reason: "" });
    setError("");
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const checkOverlap = (from, to) => {
    return mockLeaveHistory.some((leave) => {
      const existingFrom = parseISO(leave.from);
      const existingTo = parseISO(leave.to);
      return (
        (isBefore(parseISO(from), existingTo) &&
          isAfter(parseISO(from), existingFrom)) ||
        (isBefore(parseISO(to), existingTo) &&
          isAfter(parseISO(to), existingFrom)) ||
        from === leave.from ||
        to === leave.to
      );
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { type, from, to, reason } = formData;
    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1;

    const today = new Date();
    if (!type || !from || !to || !reason) {
      setError("Please complete all fields.");
      return;
    }

    if (isBefore(new Date(to), new Date(from))) {
      setError("To date cannot be before From date.");
      return;
    }

    if (isBefore(new Date(from), today)) {
      setError("You cannot apply for backdated leave.");
      return;
    }

    if (checkOverlap(from, to)) {
      setError("You already have a leave applied in this date range.");
      return;
    }

    if (mockLeaveBalance[type.value] < days) {
      setError("Insufficient leave balance.");
      return;
    }

    toast.success(`Leave Applied Successfully for ${days} day(s)!`);
    handleCloseModal();
  };

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800">Leave Requests</h2>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
        >
          <FaPlus /> Apply Leave
        </button>
      </div>

      {/* Leave Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6">
        {Object.entries(mockLeaveBalance).map(([type, balance]) => (
          <div
            key={type}
            className="bg-white shadow rounded p-4 border border-gray-200"
          >
            <p className="text-sm text-gray-600">{type}</p>
            <h3 className="text-2xl font-bold text-blue-600">{balance}</h3>
            <p className="text-xs text-gray-400">Available</p>
          </div>
        ))}
      </div>

      {/* Leave History Table */}
      <div className="bg-white shadow rounded mt-6 mx-6 p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Leave History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="text-gray-600 bg-gray-50">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockLeaveHistory.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-t hover:bg-gray-50 transition text-center"
                >
                  <td className="px-4 py-2">{leave.type}</td>
                  <td className="px-4 py-2">
                    {format(new Date(leave.from), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-2">
                    {format(new Date(leave.to), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-2">
                    <StatusPill status={leave.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded shadow w-full max-w-md animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Apply Leave
              </h3>
              <button onClick={handleCloseModal}>
                <FaTimes className="text-gray-600 hover:text-red-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your reason for leave"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition"
              >
                Submit Leave Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpLeaveRequest;
