import React, { useState } from "react";
import { FaMoneyCheckAlt, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import StatusPill from "../../../components/StatusPill";

const EmpAdvancePayment = () => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [repaymentDate, setRepaymentDate] = useState("");
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      amount: 12000,
      reason: "Medical emergency",
      status: "Pending",
      date: "2025-07-28",
    },
    {
      id: 2,
      amount: 8000,
      reason: "Child's school fee",
      status: "Approved",
      date: "2025-07-15",
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !reason || !repaymentDate) {
      toast.error("Please fill all fields");
      return;
    }

    const newRequest = {
      id: Date.now(),
      amount,
      reason,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };

    setPendingRequests([newRequest, ...pendingRequests]);
    toast.success("Advance payment request submitted!");

    setAmount("");
    setReason("");
    setRepaymentDate("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-2 bg-white rounded-2xl shadow-lg space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center mb-4">
          <FaMoneyCheckAlt className="text-2xl text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Advance Payment Request</h2>
        </div>
        <p className="text-gray-600">
          Facing an urgent financial need? Request advance salary below.
        </p>
      </div>

      {/* Rules Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center text-blue-700 font-semibold mb-2">
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

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition duration-200"
          >
            Submit Request
          </button>
        </div>
      </form>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Advance Requests</h3>
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <div className="text-gray-800 font-medium">₹{req.amount}</div>
                  <div className="text-sm text-gray-600">{req.reason}</div>
                  <div className="text-xs text-gray-400">Requested on: {req.date}</div>
                </div>
                <StatusPill status={req.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpAdvancePayment;
