import React, { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../components/ConfirmModal";

const ShiftList = ({
  shifts = [],
  fetchShifts,
  setIsEdit,
  setSelectedShift,
  openModal,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/shift/${id}`);
      toast.success("Shift deleted successfully");
      fetchShifts();
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete shift"
      );
    } finally {
      setConfirmDeleteId(null);
    }
  };
  

  return (
    <div className="bg-white">
      {shifts.length === 0 ? (
        <p className="text-gray-500 text-sm">No shift found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-center uppercase">
              <tr className="text-center">
                <th className="px-6 py-3">S.No</th>
                <th className="px-6 py-3">Shift Name</th>
                <th className="px-6 py-3">Start</th>
                <th className="px-6 py-3">End</th>
                {/* <th className="px-6 py-3 text-left">Margin Enabled</th> */}
                {/* <th className="px-6 py-3 text-left">Before Margin</th>
                <th className="px-6 py-3 text-left">After Margin</th> */}
                {/* <th className="px-6 py-3 text-left">Core Enabled</th> */}
                {/* <th className="px-6 py-3 text-left">Core Start</th>
                <th className="px-6 py-3 text-left">Core End</th> */}
                {/* <th className="px-6 py-3 text-left">Weekend Location</th>
                <th className="px-6 py-3 text-left">Has Allowance</th> */}
                {/* <th className="px-6 py-3 text-left">Allowance ₹</th> */}
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {shifts.map((shift, index) => (
                <tr
                  key={shift.id}
                  className={index % 2 === 0 ? "bg-white text-center" : "bg-gray-50 text-center"}
                >
                  <td className="px-6 py-2">{index+1}</td>
                  <td className="px-6 py-2 font-medium">{shift.shiftName}</td>
                  <td className="px-6 py-2">{shift.shiftStart}</td>
                  <td className="px-6 py-2">{shift.shiftEnd}</td>
                  {/* <td className="px-6 py-4">{shift.isShiftMarginEnabled ? "Yes" : "No"}</td> */}
                  {/* <td className="px-6 py-4">{shift.marginBeforeShift}</td>
                  <td className="px-6 py-4">{shift.marginAfterShift}</td> */}
                  {/* <td className="px-6 py-4">{shift.isCoreHoursEnabled ? "Yes" : "No"}</td> */}
                  {/* <td className="px-6 py-4">{shift.coreStart}</td>
                  <td className="px-6 py-4">{shift.coreEnd}</td> */}
                  {/* <td className="px-6 py-4">{shift.isWeekendBasedOnLocation ? "Yes" : "No"}</td>
                  <td className="px-6 py-4">{shift.hasShiftAllowance ? "Yes" : "No"}</td> */}
                  {/* <td className="px-6 py-4">{shift.shiftAllowanceAmount}</td> */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setIsEdit("Edit");
                          setSelectedShift(shift);
                          openModal();
                        }}
                        className="flex items-center cursor-pointer gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium rounded-md transition duration-200"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(shift.id)}
                        className="flex items-center cursor-pointer gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium rounded-md transition duration-200"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete?"
          message="Are you sure you want to delete this shift? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default ShiftList;
