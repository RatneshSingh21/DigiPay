import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { TiTick } from "react-icons/ti";
import { MdClose } from "react-icons/md";
import {
  FaCommentDots,
  FaCalendarAlt,
  FaSyncAlt,
  FaUser,
  FaUserTie,
  FaIdBadge,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";

const EmpApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user} = useAuthStore((state) => state);
  const companyId = useAuthStore((state) => state.companyId);
  console.log("Company Id : " , companyId);
  

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/ApprovalMaster/by-employee/${user.userId}`);
      setApprovals(res.data.data || []);
    } catch (err) {
      setError("Failed to fetch approvals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axiosInstance.get("/StatusMaster");
        setStatuses(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch statuses", err);
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get(
          `/user-auth/getEmployee/companyId/${companyId}`
        );
        setEmployees(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, []);

  const updateStatus = async (approvalId, statusId) => {
    try {
      const comments = prompt("Enter comments (optional):", "");
      await axiosInstance.put(`/ApprovalMaster/update-status/${approvalId}`, {
        statusId,
        comments,
      });
      setApprovals((prev) =>
        prev.map((item) =>
          item.approvalId === approvalId
            ? {
                ...item,
                statusId,
                comments: comments || item.comments,
                updatedOn: new Date(),
              }
            : item
        )
      );
      alert("Status updated successfully!");
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  if (loading)
    return (
      <div className="p-4 text-gray-600 text-center animate-pulse">
        Loading approvals...
      </div>
    );
  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>;

  const approveStatusId = statuses.find(
    (s) => s.statusName.toLowerCase() === "approved"
  )?.statusId;
  const rejectStatusId = statuses.find(
    (s) => s.statusName.toLowerCase() === "rejected"
  )?.statusId;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}{" "}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        {" "}
        <h2 className="font-semibold text-xl">Approvals</h2>{" "}
        <button
          onClick={fetchApprovals}
          className="flex cursor-pointer items-center text-sm gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          {" "}
          <FiRefreshCw /> Refresh{" "}
        </button>{" "}
      </div>
      <div className="p-6 space-y-6">
        {approvals.length === 0 ? (
          <p className="text-gray-500 text-center">No approvals available.</p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvals.map((approval) => {
              const currentStatus =
                statuses.find((s) => s.statusId === approval.statusId)
                  ?.statusName || "Unknown";

              const isFinal =
                currentStatus.toLowerCase() === "approved" ||
                currentStatus.toLowerCase() === "rejected";

              const employee =
                employees.find((e) => e.id === approval.employeeId) || {};
              const approver =
                employees.find((e) => e.id === approval.approverId) || {};

              return (
                <div
                  key={approval.approvalId}
                  className="bg-white border border-gray-200 cursor-pointer shadow-lg rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Header with Status */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {approval.requestTypeName}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        currentStatus.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-700"
                          : currentStatus.toLowerCase() === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  {/* Employee Info */}
                  <div className="text-sm text-gray-700 mb-3 space-y-1">
                    <p className="flex items-center gap-2">
                      <FaUser className="text-gray-500" />
                      <strong>Requested By:</strong>{" "}
                      {employee.fullName || "Unknown"}{" "}
                      <span className="text-gray-500 text-xs">
                        ({employee.employeeCode || "N/A"})
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FaUserTie className="text-gray-500" />
                      <strong>Approver:</strong>{" "}
                      {approver.fullName || "Unknown"}{" "}
                      <span className="text-gray-500 text-xs">
                        ({approver.employeeCode || "N/A"})
                      </span>
                    </p>
                  </div>

                  {/* Comments */}
                  {approval.comments && (
                    <p className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md mb-3 border border-gray-100">
                      <FaCommentDots className="text-gray-500" />
                      <span>
                        <strong>Comments:</strong> {approval.comments}
                      </span>
                    </p>
                  )}

                  {/* Dates */}
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>
                        <strong>Created:</strong>{" "}
                        {new Date(approval.createdOn).toLocaleString("en-GB", {
                          hour12: true,
                        })}
                      </span>
                    </div>
                    {approval.updatedOn && (
                      <div className="flex items-center gap-2">
                        <FaSyncAlt className="text-gray-400" />
                        <span>
                          <strong>Updated:</strong>{" "}
                          {new Date(approval.updatedOn).toLocaleString(
                            "en-GB",
                            {
                              hour12: true,
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isFinal && (
                    <div className="flex gap-3 mt-4">
                      {approveStatusId && (
                        <button
                          onClick={() =>
                            updateStatus(approval.approvalId, approveStatusId)
                          }
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                        >
                          <TiTick className="text-lg" /> Approve
                        </button>
                      )}
                      {rejectStatusId && (
                        <button
                          onClick={() =>
                            updateStatus(approval.approvalId, rejectStatusId)
                          }
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-semibold py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                        >
                          <MdClose className="text-lg" /> Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpApprovals;
