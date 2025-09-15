import React, { useEffect, useState } from "react";
import { FaMoneyCheckAlt, FaInfoCircle, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import StatusPill from "../../../components/StatusPill";
import AdvancePaymentForm from "../EmpAdvance/AdvancePaymentForm";

const getInstallmentStatus = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today ? "Deducted" : "Pending";
};

const EmpAdvancePayment = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const User = useAuthStore((state) => state.user);

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

  const fetchAdvancePayments = async () => {
    if (!User?.userId) return;
    try {
      const res = await axiosInstance.get(
        `/AdvancePayment/employee/${User.userId}`
      );
      setPendingRequests(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching advance payments:", error);
      toast.error(error?.response?.data?.message || "Failed to load requests");
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchAdvancePayments();
  }, [User?.userId]);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800">
          Advance Payment Request
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition"
        >
          <FaPlus /> Apply Advance
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-2">
        {/* Rules Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-secondary font-semibold">
            <FaInfoCircle className="mr-2" />
            Advance Salary Rules
          </div>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li>Maximum advance amount: ₹50,000</li>
            <li>Or up to 30% of your monthly salary (whichever is lower)</li>
            <li>One active request at a time is allowed</li>
            <li>All requests are subject to approval by HR/Admin</li>
          </ul>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Your Advance Requests
            </h3>
            <div className="space-y-2 h-[45vh] overflow-y-auto pr-2">
              {pendingRequests.map((req) => (
                <div
                  key={req.advancePaymentId}
                  className="p-4 border rounded-lg shadow-sm bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-800 font-medium">
                        <strong className="font-bold">Amount :</strong> ₹
                        {req.advancePaymentAmount}
                      </div>
                      <div className="text-sm text-gray-600">
                        {req.reason || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Requested on:{" "}
                        {new Date(req.createdOn).toLocaleDateString()}
                      </div>
                      {req.noOfInstallments && (
                        <div className="text-xs text-gray-500 mt-1">
                          Installments: {req.noOfInstallments} month(s)
                        </div>
                      )}
                    </div>
                    <StatusPill status={statusMap[req.statusId] || "Pending"} />
                  </div>

                  {req.installments?.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <div className="text-xs font-semibold text-gray-700 mb-1">
                        Installment Plan:
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {req.installments.map((inst) => {
                          const status = getInstallmentStatus(inst.dueDate);
                          return (
                            <li
                              key={inst.installmentId}
                              className="flex justify-between items-center"
                            >
                              <span>
                                {new Date(inst.dueDate).toLocaleString(
                                  "default",
                                  { month: "short", year: "numeric" }
                                )}
                                : ₹{inst.installmentAmount}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  status === "Deducted"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {status}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 backdrop-filter backdrop-blur-sm bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Apply for Advance Payment
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-800"
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
      </div>
    </>
  );
};

export default EmpAdvancePayment;
