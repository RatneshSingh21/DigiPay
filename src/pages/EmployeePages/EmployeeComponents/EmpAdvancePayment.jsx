import React, { useEffect, useState } from "react";
import { FaMoneyCheckAlt, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import StatusPill from "../../../components/StatusPill";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Select from "react-select";

const getInstallmentStatus = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today ? "Deducted" : "Pending";
};

const paymentTypeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
];

const EmpAdvancePayment = () => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [repaymentDate, setRepaymentDate] = useState("");
  const [installments, setInstallments] = useState("");
  const [advancePaymentType, setAdvancePaymentType] = useState(null);
  const User = useAuthStore((state) => state.user);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // Dynamic status map

  // Fetch statuses
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

  // Fetch advance payments
  const fetchAdvancePayments = async () => {
    if (!User?.userId) return;
    try {
      const res = await axiosInstance.get(`/AdvancePayment/employee/${User.userId}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !reason || !repaymentDate || !installments || !advancePaymentType) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const totalAmount = parseFloat(amount);
      const noOfInstallments = parseInt(installments);
      const installmentAmount = totalAmount / noOfInstallments;

      const payload = {
        employeeId: User.userId,
        advancePaymentAmount: totalAmount,
        advancePaymentType: advancePaymentType.value,
        noOfInstallments,
        installmentAmount,
        repaymentStartDate: new Date(repaymentDate).toISOString(),
        reason,
        comments: "",
        customApproverIds: [],
      };

      await axiosInstance.post("/AdvancePayment", payload);
      toast.success("Advance payment request submitted!");
      fetchAdvancePayments(); // Refresh list
      setAmount("");
      setReason("");
      setRepaymentDate("");
      setInstallments("");
      setAdvancePaymentType(null);
    } catch (error) {
      console.error("Error submitting advance payment:", error);
      // toast.error("Failed to submit request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-2 bg-white rounded-2xl shadow-lg space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center mb-2">
          <FaMoneyCheckAlt className="text-2xl text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Advance Payment Request</h2>
        </div>
        <p className="text-gray-600">
          Facing an urgent financial need? Request advance salary below.
        </p>
      </div>

      {/* Rules Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center text-blue-700 font-semibold">
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requested Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Advance</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain the reason..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Repayment Date</label>
          <input
            type="date"
            value={repaymentDate}
            onChange={(e) => setRepaymentDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment Type</label>
          <Select
            options={paymentTypeOptions}
            value={advancePaymentType}
            onChange={setAdvancePaymentType}
            placeholder="Select payment type"
            className="text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments</label>
          <input
            type="number"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            placeholder="e.g. 3"
            min={1}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full cursor-pointer bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition duration-200"
          >
            Submit Request
          </button>
        </div>
      </form>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Advance Requests</h3>
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div key={req.advancePaymentId} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-800 font-medium"><strong className="font-bold">Amount :</strong> ₹{req.advancePaymentAmount}</div>
                    <div className="text-sm text-gray-600">{req.reason || "N/A"}</div>
                    <div className="text-xs text-gray-400">
                      Requested on: {new Date(req.createdOn).toLocaleDateString()}
                    </div>
                    {req.noOfInstallments && (
                      <div className="text-xs text-gray-500 mt-1">
                        Installments: {req.noOfInstallments} month(s)
                      </div>
                    )}
                  </div>
                  <StatusPill status={statusMap[req.statusId] || "Pending"} />
                </div>

                {/* Installment Breakdown */}
                {req.installments?.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Installment Plan:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {req.installments.map((inst) => {
                        const status = getInstallmentStatus(inst.dueDate);
                        return (
                          <li key={inst.installmentId} className="flex justify-between items-center">
                            <span>
                              {new Date(inst.dueDate).toLocaleString("default", { month: "short", year: "numeric" })}
                              : ₹{inst.installmentAmount}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                status === "Deducted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
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
    </div>
  );
};

export default EmpAdvancePayment;
