import React, { useEffect, useState } from "react";
import { TiTick } from "react-icons/ti";
import { MdClose } from "react-icons/md";
import {
  FaCommentDots,
  FaCalendarAlt,
  FaSyncAlt,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";
import useAuthStore from "../../../store/authStore";
import UpdateStatusModal from "./UpdateStatusModal";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const DASHBOARD_STATUSES = ["Pending", "Approved", "Rejected"]; // Only these show in dashboard
const FILTER_STATUSES = ["Pending", "Approved", "Rejected"]; // For react-select filter
const TYPE_BADGES = {
  Leave: {
    label: "Leave",
    color: "bg-blue-100 text-blue-700",
    icon: "🟦",
  },
  Expense: {
    label: "Expense",
    color: "bg-purple-100 text-purple-700",
    icon: "🟪",
  },
  AdvancePayment: {
    label: "Advance",
    color: "bg-orange-100 text-orange-700",
    icon: "🟧",
  },
  OnDuty: {
    label: "On Duty",
    color: "bg-green-100 text-green-700",
    icon: "🟩",
  },
};

const STATUS_STYLES = {
  Pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  Rejected: { bg: "bg-red-100", text: "text-red-800" },
  Approved: { bg: "bg-green-100", text: "text-green-800" },
};

const ApprovalsByApprover = ({ approverId }) => {
  const [approvals, setApprovals] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const [filters, setFilters] = useState({
    requestType: null,
    status: null,
    requestedBy: null,
    expenseHead: null,
  });

  const companyId = useAuthStore((state) => state.companyId);
  // console.log("Company Id : ", companyId);

  const fetchApprovals = async () => {
    try {
      setLoading(true);

      const safeRequest = async (url) => {
        try {
          const res = await axiosInstance.get(url);
          return res.data.data || [];
        } catch (err) {
          if (err.response?.status === 404) return []; // Handle missing OD endpoint
          console.error("API Failed:", url, err);
          return [];
        }
      };

      const [leaveRes, expenseRes, advanceRes, odRes] = await Promise.all([
        safeRequest(`/ApprovalMaster/leave-by-approver/${approverId}`),
        safeRequest(`/ApprovalMaster/expense-by-approver/${approverId}`),
        safeRequest(
          `/ApprovalMaster/advance-payment-by-approver/${approverId}`
        ),
        safeRequest(`/ApprovalMaster/od-by-approver/${approverId}`),
      ]);

      console.log("Fetched Approvals:", {
        leaveRes,
        expenseRes,
        advanceRes,
        odRes,
      });

      const leaveData = leaveRes.map((item) => ({
        approvalId: item.approvalId,
        type: "Leave",
        statusId: item.statusId,
        createdOn: item.createdOn,
        updatedOn: item.updatedOn,
        comments: item.comments,

        employeeName: item.employeeName,
        approverName: item.approverName,

        requestedByEmployeeId: item.requestedByEmployeeId,
        approverId: item.approverId,

        details: {
          leaveType: item.leaveName,
          fromDate: item.fromDate,
          toDate: item.toDate,
          reason: item.reason,
        },
      }));

      const expenseData = expenseRes.map((item) => ({
        approvalId: item.approvalId,
        type: "Expense",
        statusId: item.statusId,
        createdOn: item.createdOn,
        comments: item.comments,

        employeeName: item.employeeName,
        approverName: item.approverName,

        requestedByEmployeeId: item.requestedByEmployeeId,
        approverId: item.approverId,

        details: {
          expenseDetailsName: item.expenseDetailsName,
          amount: item.amount,
          expenseDate: item.expenseDate,
          description: item.description,
          fileName: item.fileName,
        },
      }));

      const advanceData = advanceRes.map((item) => ({
        approvalId: item.approvalId,
        type: "AdvancePayment",
        statusId: item.statusId,
        createdOn: item.createdOn,
        comments: item.comments,

        employeeName: item.employeeName,
        approverName: item.approverName,

        requestedByEmployeeId: item.requestedByEmployeeId,
        approverId: item.approverId,

        details: {
          advancePaymentAmount: item.advancePaymentAmount,
          reason: item.reason,
          advancePaymentType: item.advancePaymentType,
          noOfInstallments: item.noOfInstallments,
          installmentAmount: item.installmentAmount,
          repaymentStartDate: item.repaymentStartDate,
          repaymentEndDate: item.repaymentEndDate,
        },
      }));

      const odData = odRes.map((item) => ({
        approvalId: item.approvalId,
        type: "OnDuty",
        statusId: item.statusId,
        createdOn: item.createdOn,
        comments: item.comments,

        employeeName: item.employeeName,
        approverName: item.approverName,

        requestedByEmployeeId: item.genericRequestId, // if needed
        approverId: item.approverId,

        details: {
          inDateTime: item.inDateTime,
          outDateTime: item.outDateTime,
          reason: item.reason,
          latitude: item.latitude,
          longitude: item.longitude,
        },
      }));

      const finalApprovals = [
        ...leaveData,
        ...expenseData,
        ...advanceData,
        ...odData,
      ];

      setApprovals(finalApprovals);
    } catch (err) {
      console.error("Failed to fetch approvals", err);
      setError("Failed to fetch approvals");
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

  const dashboardStatuses = statuses.filter((s) =>
    DASHBOARD_STATUSES.includes(s.statusName)
  );

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
  }, [companyId]);

  // Open modal
  const openModal = (approval, action) => {
    setSelectedApproval(approval);
    setSelectedAction(action);
    setModalOpen(true);
  };

  // Handle modal submit
  const handleModalSubmit = async (comments) => {
    if (!selectedApproval || !selectedAction) return;
    await updateStatus(selectedApproval.approvalId, selectedAction, comments);
    setModalOpen(false);
  };

  const updateStatus = async (approvalId, statusId, comments = "") => {
    try {
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
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
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

  // Filtered approvals
  const filteredApprovals = approvals.filter((a) => {
    const employee =
      employees.find((e) => e.id === a.requestedByEmployeeId) || {};

    const statusName =
      statuses.find((s) => s.statusId === a.statusId)?.statusName || "";

    return (
      (!filters.requestType || a.type === filters.requestType.value) &&
      (!filters.status || statusName === filters.status.value) &&
      (!filters.requestedBy || employee.id === filters.requestedBy.value) &&
      (!filters.expenseHead ||
        (a.type === "Expense" &&
          a.details.expenseDetailsName === filters.expenseHead.value))
    );
  });

  const handleDashboardFilterClick = (statusName) => {
    setFilters({
      requestType: null,
      status: { label: statusName, value: statusName },
      requestedBy: null,
    });
  };

  // --- Dashboard counts ---
  const statusCounts = {};
  FILTER_STATUSES.forEach((status) => {
    statusCounts[status] = filteredApprovals.filter(
      (a) =>
        statuses.find((s) => s.statusId === a.statusId)?.statusName === status
    ).length;
  });

  const requestTypeCounts = {};
  if (filters.requestType) {
    requestTypeCounts[filters.requestType.value] = filteredApprovals.length;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}{" "}
      <div className="px-4 py-2 shadow mb-5  bg-white z-10 flex justify-between items-center">
        {" "}
        <h2 className="font-semibold text-xl">Approvals By Approver</h2>{" "}
        <button
          onClick={fetchApprovals}
          className="flex cursor-pointer items-center text-sm gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          {" "}
          <FiRefreshCw /> Refresh{" "}
        </button>{" "}
      </div>
      {/* Filters */}
      <div className="px-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          placeholder="Request Type"
          options={[...new Set(approvals.map((a) => a.type))].map((rt) => ({
            label: rt,
            value: rt,
          }))}
          value={filters.requestType}
          onChange={(val) =>
            setFilters({
              ...filters,
              requestType: val,
              expenseHead: null, // ✅ reset when type changes
            })
          }
          isClearable
        />

        {filters.requestType?.value === "Expense" && (
          <Select
            placeholder="Expense Head"
            options={[
              ...new Set(
                approvals
                  .filter((a) => a.type === "Expense")
                  .map((a) => a.details.expenseDetailsName)
                  .filter(Boolean)
              ),
            ].map((head) => ({
              label: head,
              value: head,
            }))}
            value={filters.expenseHead}
            onChange={(val) => setFilters({ ...filters, expenseHead: val })}
            isClearable
          />
        )}

        <Select
          placeholder="Status"
          options={statuses
            .filter((s) => FILTER_STATUSES.includes(s.statusName))
            .map((s) => ({ label: s.statusName, value: s.statusName }))}
          value={filters.status}
          onChange={(val) => setFilters({ ...filters, status: val })}
          isClearable
        />

        <Select
          placeholder="Requested By"
          options={employees.map((e) => ({ label: e.fullName, value: e.id }))}
          value={filters.requestedBy}
          onChange={(val) => setFilters({ ...filters, requestedBy: val })}
          isClearable
        />
      </div>
      {/* Dashboard Cards: Status + RequestType */}
      <div className="px-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {dashboardStatuses.map((status) => (
          <div
            key={status.statusId}
            className={`rounded-lg p-4 shadow text-center border ${
              STATUS_STYLES[status.statusName]?.bg
            } ${
              STATUS_STYLES[status.statusName]?.text
            } cursor-pointer hover:scale-105 transition-all duration-200`}
            onClick={() => handleDashboardFilterClick(status.statusName)}
          >
            <h3 className="text-sm font-medium">{status.statusName}</h3>
            <p className="text-2xl font-bold mt-2">
              {
                filteredApprovals.filter((a) => a.statusId === status.statusId)
                  .length
              }
            </p>
          </div>
        ))}

        {filters.requestType && (
          <div className="rounded-lg p-4 shadow text-center border bg-indigo-100 text-indigo-800">
            <h3 className="text-sm font-medium">{filters.requestType.label}</h3>
            <p className="text-2xl font-bold mt-2">
              {filteredApprovals.length}
            </p>
          </div>
        )}
      </div>
      {/* Center Part */}
      <div className="p-6 space-y-6">
        {filteredApprovals.length === 0 ? (
          <p className="text-gray-500 text-center">No approvals available.</p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApprovals.map((approval) => {
              const currentStatus =
                statuses.find((s) => s.statusId === approval.statusId)
                  ?.statusName || "Unknown";

              const isFinal =
                currentStatus.toLowerCase() === "approved" ||
                currentStatus.toLowerCase() === "rejected";

              // Safely get employee & approver
              const employee = employees.find(
                (e) => e.id === approval.requestedByEmployeeId
              ) || {
                fullName: approval.employeeName, // fallback
              };

              const approver = employees.find(
                (e) => e.id === approval.approverId
              ) || {
                fullName: approval.approverName, // fallback
              };

              return (
                <div
                  key={approval.approvalId}
                  className="bg-white border border-gray-200 cursor-pointer shadow-lg rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Header with Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {TYPE_BADGES[approval.type].icon}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-md ${
                          TYPE_BADGES[approval.type].color
                        }`}
                      >
                        {TYPE_BADGES[approval.type].label}
                      </span>
                    </div>
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
                    </p>

                    <p className="flex items-center gap-2">
                      <FaUserTie className="text-gray-500" />
                      <strong>Approver:</strong>{" "}
                      {approver.fullName || "Unknown"}{" "}
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

                  {/* Dynamic Details */}
                  <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                    {/* Leave */}
                    {approval.type === "Leave" && (
                      <>
                        <p>
                          <strong>Leave Type:</strong>{" "}
                          {approval.details.leaveType}
                        </p>
                        <p>
                          <strong>From:</strong>
                          {new Date(approval.details.fromDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                        <p>
                          <strong>To:</strong>
                          {new Date(approval.details.toDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                        <p>
                          <strong>Reason:</strong> {approval.details.reason}
                        </p>
                      </>
                    )}

                    {/* Expense */}
                    {approval.type === "Expense" && (
                      <>
                        <p>
                          <strong>Expense Head:</strong>{" "}
                          {approval.details.expenseDetailsName}
                        </p>
                        <p>
                          <strong>Amount:</strong> ₹{approval.details.amount}
                        </p>
                        <p>
                          <strong>Description:</strong>{" "}
                          {approval.details.description}
                        </p>
                        <p>
                          <strong>Date:</strong>
                          {new Date(
                            approval.details.expenseDate
                          ).toLocaleString("en-GB", {
                            hour12: true,
                          })}
                        </p>

                        {/* {approval.details.fileName && (
                          <a
                            href={approval.details.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-xs"
                          >
                            View Attachment
                          </a>
                        )} */}
                      </>
                    )}

                    {/* Advance Payment */}
                    {approval.type === "AdvancePayment" && (
                      <>
                        <p>
                          <strong>Amount:</strong> ₹
                          {approval.details.advancePaymentAmount}
                        </p>
                        <p>
                          <strong>Reason:</strong>
                          {approval.details.reason}
                        </p>
                        <p>
                          <strong>Payment Type:</strong>{" "}
                          {approval.details.advancePaymentType}
                        </p>
                        <p>
                          <strong>Installments:</strong>{" "}
                          {approval.details.noOfInstallments}
                        </p>
                        <p>
                          <strong>EMI Amount:</strong> ₹
                          {approval.details.installmentAmount}
                        </p>
                        <p>
                          <strong>Repayment Starts:</strong>{" "}
                          {new Date(
                            approval.details.repaymentStartDate
                          ).toLocaleDateString("en-GB")}{" "}
                          {/* →{" "}
                          {new Date(
                            approval.details.repaymentEndDate
                          ).toLocaleDateString("en-GB")} */}
                        </p>
                      </>
                    )}

                    {/* On Duty */}
                    {approval.type === "OnDuty" && (
                      <>
                        <p>
                          <strong>From:</strong>{" "}
                          {new Date(approval.details.inDateTime).toLocaleString(
                            "en-GB",
                            {
                              hour12: true,
                            }
                          )}
                        </p>
                        <p>
                          <strong>To:</strong>{" "}
                          {new Date(
                            approval.details.outDateTime
                          ).toLocaleString("en-GB", {
                            hour12: true,
                          })}
                        </p>
                        {approval.details.reason && (
                          <p>
                            <strong>Reason:</strong> {approval.details.reason}
                          </p>
                        )}
                        {(approval.details.latitude ||
                          approval.details.longitude) && (
                          <p>
                            <strong>Location:</strong>{" "}
                            {approval.details.latitude},{" "}
                            {approval.details.longitude}
                          </p>
                        )}
                      </>
                    )}
                  </div>

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
                          onClick={() => openModal(approval, approveStatusId)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                        >
                          <TiTick className="text-lg" /> Approve
                        </button>
                      )}
                      {rejectStatusId && (
                        <button
                          onClick={() => openModal(approval, rejectStatusId)}
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
      {/* Status Update Modal */}
      <UpdateStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        currentStatus={
          statuses.find((s) => s.statusId === selectedApproval?.statusId)
            ?.statusName || "Unknown"
        }
      />
    </div>
  );
};

export default ApprovalsByApprover;
