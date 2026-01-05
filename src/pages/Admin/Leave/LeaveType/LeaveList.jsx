import React, { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../../components/ConfirmModal";

const LeaveList = ({
  fetchLeaves,
  leaves = [],
  setIsEdit,
  setSelectedLeave,
  openModal,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/LeaveType/${id}`);
      toast.success("Leave type deleted successfully");
      fetchLeaves();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete leave type"
      );
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaves.map((leave) => (
          <div
            key={leave.leaveTypeId}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6 relative"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-primary">
                  {leave.leaveName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Code: <span className="font-semibold">{leave.leaveCode}</span>
                </p>
              </div>

              <div className="flex gap-2">
                {/* Edit */}
                <button
                  className="p-2 bg-indigo-100 text-primary cursor-pointer rounded-full hover:bg-indigo-200 transition-colors shadow-sm"
                  onClick={() => {
                    setIsEdit("Edit");
                    setSelectedLeave(leave);
                    openModal();
                  }}
                >
                  <FiEdit2 size={16} />
                </button>

                {/* Delete */}
                <button
                  disabled={leave.isSystemDefined}
                  className={`p-2 rounded-full ${
                    leave.isSystemDefined
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-red-100 text-red-600 cursor-pointer hover:bg-red-200 transition-colors shadow-sm"
                  }`}
                  onClick={() =>
                    !leave.isSystemDefined &&
                    setConfirmDeleteId(leave.leaveTypeId)
                  }
                >
                  <FiTrash2
                    size={16}
                    className={leave.isSystemDefined ? "text-gray-400" : ""}
                  />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    leave.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {leave.isActive ? "Active" : "Inactive"}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <span className="font-semibold">Type:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    leave.isSystemDefined
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {leave.isSystemDefined ? "System Defined" : "Custom"}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <span className="font-semibold">Created On:</span>
                <span className="text-gray-800 font-medium">
                  {new Date(leave.createdOn).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm delete */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Leave Type?"
          message="Are you sure you want to delete this leave type? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default LeaveList;
