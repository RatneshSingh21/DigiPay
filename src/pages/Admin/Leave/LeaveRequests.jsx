import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StatusPill from "../../../components/StatusPill";

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    // Dummy fetch instead of API
    setTimeout(() => {
      setLeaveRequests([
        {
          id: 1,
          employeeName: "Nitish Yadav",
          type: "CL",
          from: "2025-08-25",
          to: "2025-08-26",
          reason: "Family function",
          status: "Pending",
        },
        {
          id: 2,
          employeeName: "Rahul Sharma",
          type: "SL",
          from: "2025-08-20",
          to: "2025-08-21",
          reason: "Fever",
          status: "Approved",
        },
      ]);
      setLoading(false);
    }, 500);

    // API Example (to be used later)
    // axiosInstance.get("/api/admin/leave-requests")
    //   .then(res => setLeaveRequests(res.data))
    //   .catch(() => toast.error("Failed to fetch leave requests"))
    //   .finally(() => setLoading(false));
  }, []);

  const handleApprove = (id) => {
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "Approved" } : req))
    );
    toast.success("Leave approved successfully");

    // API Example
    // axiosInstance.put(`/api/admin/leave-requests/${id}/approve`)
    //   .then(() => toast.success("Leave approved successfully"))
    //   .catch(() => toast.error("Failed to approve leave"));
  };

  const handleRejectClick = (id) => {
    setSelectedRequestId(id);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequestId
          ? { ...req, status: "Rejected", rejectReason }
          : req
      )
    );
    toast.success("Leave rejected successfully");

    // API Example
    // axiosInstance.put(`/api/admin/leave-requests/${selectedRequestId}/reject`, { reason: rejectReason })
    //   .then(() => toast.success("Leave rejected successfully"))
    //   .catch(() => toast.error("Failed to reject leave"));

    setRejectReason("");
    setShowRejectModal(false);
    setSelectedRequestId(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Leave Requests
      </h2>

      <div className="bg-white shadow rounded overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{req.employeeName}</td>
                  <td className="px-4 py-3">{req.type}</td>
                  <td className="px-4 py-3">{req.from}</td>
                  <td className="px-4 py-3">{req.to}</td>
                  <td className="px-4 py-3">{req.reason}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={req.status} />
                    {req.status === "Rejected" && req.rejectReason && (
                      <p className="text-xs text-red-500 mt-1">
                        Reason: {req.rejectReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {req.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(req.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {leaveRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Reject Leave Request
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedRequestId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Rejection
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none resize-none min-h-[100px]"
            />

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-5">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedRequestId(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
