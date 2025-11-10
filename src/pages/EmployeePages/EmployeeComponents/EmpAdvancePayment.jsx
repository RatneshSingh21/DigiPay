import React, { useEffect, useState } from "react";
import {
  FaInfoCircle,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import StatusPill from "../../../components/StatusPill";
import AdvancePaymentForm from "../EmpAdvance/AdvancePaymentForm";

const EmpAdvancePayment = () => {
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [approverMap, setApproverMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState({}); // 🔹 Track expanded/collapsed

  const User = useAuthStore((state) => state.user);

  /** 🔹 Fetch Status Master */
  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      const map = {};
      res.data.data.forEach((s) => {
        map[s.statusId] = s.statusName;
      });
      setStatusMap(map);
    } catch (error) {
      console.error("Error fetching status master:", error);
      toast.error("Failed to load status master");
    }
  };

  /** 🔹 Fetch Approvers */
  const fetchApprovers = async () => {
    try {
      const res = await axiosInstance.get("/EmployeeRoleMapping/approvers/all");
      const all = res.data?.data || res.data || [];
      const advanceRule = all.find((r) => r.requestType === "AdvancePayment");
      const map = {};
      if (advanceRule?.approvers?.length > 0) {
        advanceRule.approvers.forEach((a) => {
          map[a.employeeId] = `${a.employeeName} (${a.roleName})`;
        });
      }
      setApproverMap(map);
    } catch (error) {
      console.error("Error fetching approvers:", error);
      toast.error("Failed to load approvers");
    }
  };

  /** 🔹 Fetch Advance Payment Data */
  const fetchAdvancePayments = async () => {
    if (!User?.userId) return;
    try {
      const res = await axiosInstance.get(
        `/AdvancePayment/employee/${User.userId}`
      );
      setAdvanceRequests(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching advance payments:", error);
      toast.error("Failed to load advance payments");
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchApprovers();
    fetchAdvancePayments();
  }, [User?.userId]);

  /** 🔹 Helper to color installment status */
  const getStatusColor = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case "approved":
      case "paid":
        return "bg-green-100 text-green-700";
      case "partial":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
      case "processed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /** 🔹 Toggle Expand/Collapse per request */
  const toggleExpand = (id) => {
    setExpandedRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800">
          Advance Payment Request
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 cursor-pointer bg-primary text-white text-sm px-4 py-2 rounded hover:bg-secondary transition"
        >
          <FaPlus /> Apply Advance
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 bg-white rounded-2xl shadow-lg space-y-3">
        {/* Rules Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-secondary font-semibold">
            <FaInfoCircle className="mr-2" /> Advance Salary Rules
          </div>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li>Maximum advance amount: ₹50,000</li>
            <li>Or up to 30% of your monthly salary (whichever is lower)</li>
            <li>One active request at a time is allowed</li>
            <li>All requests are subject to approval by HR/Admin</li>
          </ul>
        </div>

        {/* Advance Requests */}
        {advanceRequests.length > 0 ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Your Advance Requests
            </h3>
            <div className="space-y-2 h-[45vh] overflow-y-auto pr-2">
              {advanceRequests.map((req) => {
                const isExpanded = expandedRequests[req.advancePaymentId];
                return (
                  <div
                    key={req.advancePaymentId}
                    className="p-4 border rounded-lg shadow-sm bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-gray-800 font-medium">
                          <strong>Amount:</strong> ₹{req.advancePaymentAmount}
                        </div>
                        <div className="text-sm text-gray-600">
                          Reason: {req.reason || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Requested on:{" "}
                          {new Date(req.createdOn).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            hour12: true,
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Installments: {req.noOfInstallments || 0} month(s)
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Repayment Start:{" "}
                          {req.repaymentStartDate
                            ? new Date(
                                req.repaymentStartDate
                              ).toLocaleDateString("en-GB")
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Balance Amount: ₹{req.balanceAmount}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {/* Approvers */}
                        {req.approvedBy?.length > 0 && (
                          <div className="text-xs text-gray-600 text-right">
                            <span className="font-semibold">Approved By:</span>
                            <ul className="mt-1 space-y-0.5">
                              {req.approvedBy.map((id) => (
                                <li
                                  key={id}
                                  className="text-green-600 font-medium text-xs"
                                >
                                  • {approverMap[id] || `Employee ${id}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <StatusPill
                          status={statusMap[req.statusId] || "Pending"}
                        />
                      </div>
                    </div>

                    {/* Installments */}
                    {req.installments?.length > 0 && (
                      <div className="mt-3 border-t pt-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">
                          Installment Plan:
                        </div>

                        {/* Filter installments */}
                        {req.installments
                          .filter(
                            (i) =>
                              (statusMap[i.statusId] || "").toLowerCase() !==
                              "paid"
                          )
                          .map((inst) => {
                            const instStatus =
                              statusMap[inst.statusId] || "Pending";
                            const color = getStatusColor(instStatus);
                            return (
                              <li
                                key={inst.installmentId}
                                className="flex justify-between items-center text-xs text-gray-600"
                              >
                                <span>
                                  {new Date(inst.dueDate).toLocaleString(
                                    "default",
                                    {
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}{" "}
                                  : ₹{inst.installmentAmount}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}
                                >
                                  {instStatus}
                                </span>
                              </li>
                            );
                          })}

                        {/* Collapsible Paid Installments */}
                        {req.installments.some(
                          (i) =>
                            (statusMap[i.statusId] || "").toLowerCase() ===
                            "paid"
                        ) && (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleExpand(req.advancePaymentId)}
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  <FaChevronUp size={10} /> Hide Paid
                                  Installments
                                </>
                              ) : (
                                <>
                                  <FaChevronDown size={10} /> Show Paid
                                  Installments
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <ul className="mt-1 space-y-1">
                                {req.installments
                                  .filter(
                                    (i) =>
                                      (
                                        statusMap[i.statusId] || ""
                                      ).toLowerCase() === "paid"
                                  )
                                  .map((inst) => {
                                    const instStatus =
                                      statusMap[inst.statusId] || "Paid";
                                    const color = getStatusColor(instStatus);
                                    return (
                                      <li
                                        key={inst.installmentId}
                                        className="flex justify-between items-center text-xs text-gray-600"
                                      >
                                        <span>
                                          {new Date(
                                            inst.dueDate
                                          ).toLocaleString("default", {
                                            month: "short",
                                            year: "numeric",
                                          })}{" "}
                                          : ₹{inst.installmentAmount}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}
                                        >
                                          {instStatus}
                                        </span>
                                      </li>
                                    );
                                  })}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-6">
            No advance requests found.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">
                Apply for Advance Payment
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 cursor-pointer hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <AdvancePaymentForm
              onSuccess={fetchAdvancePayments}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EmpAdvancePayment;
