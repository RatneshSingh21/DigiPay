import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiMapPin } from "react-icons/fi";
import { toast } from "react-toastify";
import WeekendPolicyMap from "./WeekendPolicyMap";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../../components/ConfirmModal";

const WeekendPolicyList = ({
  weekendPolicy = [],
  fetchWeekendPolicy,
  setIsEdit,
  setSelectedWeekendPolicy,
  openModal,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedMappingPolicy, setSelectedMappingPolicy] = useState(null);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/weekendPolicy/delete/${id}`);
      toast.success("Policy deleted successfully");
      fetchWeekendPolicy();
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error(error?.response?.data?.message || "Failed to delete policy");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="bg-white">
      {weekendPolicy.length === 0 ? (
        <p className="text-gray-500 text-sm">No Policy found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                {/* <th className="px-6 py-3 text-left">ID</th> */}
                <th className="px-6 py-3 text-left">Policy Name</th>
                <th className="px-6 py-3 text-center">Half Day Start Time</th>
                <th className="px-6 py-3 text-center">Half Day End Time</th>
                {/* <th className="px-6 py-3 text-left">Margin Enabled</th> */}
                {/* <th className="px-6 py-3 text-left">Before Margin</th>
                <th className="px-6 py-3 text-left">After Margin</th> */}
                {/* <th className="px-6 py-3 text-left">Core Enabled</th> */}
                {/* <th className="px-6 py-3 text-left">Core Start</th>
                <th className="px-6 py-3 text-left">Core End</th> */}
                {/* <th className="px-6 py-3 text-left">Weekend Location</th>
                <th className="px-6 py-3 text-left">Has Allowance</th> */}
                {/* <th className="px-6 py-3 text-left">Allowance ₹</th> */}
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {weekendPolicy.map((policy, index) => (
                <tr
                  key={policy.weekendPolicyId}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {/* <td className="px-6 py-4">{policy.id}</td> */}
                  <td className="px-6 py-4 font-medium">{policy.policyName}</td>
                  <td className="px-6 py-4 text-center">{policy.halfDayStartTime}</td>
                  <td className="px-6 py-4 text-center">{policy.halfDayEndTime}</td>
                  {/* <td className="px-6 py-4">{policy.isShiftMarginEnabled ? "Yes" : "No"}</td> */}
                  {/* <td className="px-6 py-4">{policy.marginBeforeShift}</td>
                  <td className="px-6 py-4">{policy.marginAfterShift}</td> */}
                  {/* <td className="px-6 py-4">{policy.isCoreHoursEnabled ? "Yes" : "No"}</td> */}
                  {/* <td className="px-6 py-4">{policy.coreStart}</td>
                  <td className="px-6 py-4">{policy.coreEnd}</td> */}
                  {/* <td className="px-6 py-4">{policy.isWeekendBasedOnLocation ? "Yes" : "No"}</td>
                  <td className="px-6 py-4">{policy.hasShiftAllowance ? "Yes" : "No"}</td> */}
                  {/* <td className="px-6 py-4">{policy.policyAllowanceAmount}</td> */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedMappingPolicy(policy)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium rounded-md transition duration-200"
                      >
                        <FiMapPin size={16} />
                        Policy Map
                      </button>

                      <button
                        onClick={() => {
                          setIsEdit("Edit");
                          setSelectedWeekendPolicy(policy);
                          openModal();
                        }}
                        className="flex items-center cursor-pointer gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium rounded-md transition duration-200"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDeleteId(policy.weekendPolicyId)
                        }
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

      {selectedMappingPolicy && (
        <WeekendPolicyMap
          policy={selectedMappingPolicy}
          onClose={() => setSelectedMappingPolicy(null)}
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete?"
          message="Are you sure you want to delete this policy? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default WeekendPolicyList;