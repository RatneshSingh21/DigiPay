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
      toast.success("Leave Type deleted successfully");
      fetchLeaves();
    } catch (error) {
      console.error("Error deleting leave type:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete leave type"
      );
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="bg-white p-6 pt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaves.length === 0 ? (
          <p className="text-gray-500">No leave types found.</p>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave.leaveTypeId}
              className="bg-white rounded-xl shadow-md p-6 relative"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">
                  {leave.leaveName}
                </h2>
                <div className="flex gap-2">
                  {/* Edit Button */}
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer">
                    <FiEdit2
                      size={16}
                      onClick={() => {
                        setIsEdit("Edit");
                        setSelectedLeave(leave);
                        openModal();
                      }}
                    />
                  </button>

                  {/* Delete Button */}
                  <button
                    className="p-2 bg-gray-100 rounded-full hover:bg-red-100 cursor-pointer"
                    onClick={() => setConfirmDeleteId(leave.leaveTypeId)}
                  >
                    <FiTrash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <p className="mt-4 text-gray-700">
                <span className="font-semibold">Code:</span> {leave.leaveCode}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Paid:</span>{" "}
                {leave.isPaid ? "Yes" : "No"}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Max Leaves/Year:</span>{" "}
                {leave.maxLeavesPerYear}
              </p>

              {/* Footer */}
              <div className="flex justify-between items-center mt-6">
                <span className="bg-secondary text-white text-xs px-3 py-1 rounded-md shadow-sm">
                  {leave.isCarryForwardAllowed
                    ? "Carry Forward"
                    : "No Carry Forward"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete?"
          message="Are you sure you want to delete this leave type? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default LeaveList;
