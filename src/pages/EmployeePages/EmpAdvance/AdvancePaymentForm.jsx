import React, { useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";


const paymentTypeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
];

const AdvancePaymentForm = ({ onSuccess, onClose }) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [repaymentDate, setRepaymentDate] = useState("");
  const [installments, setInstallments] = useState("");
  const [advancePaymentType, setAdvancePaymentType] = useState(null);
  const User = useAuthStore((state) => state.user);

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
      onSuccess?.(); // refresh parent list
      onClose?.(); // close modal
    } catch (error) {
      console.error("Error submitting advance payment:", error);
      toast.error("Failed to submit request");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 overflow-y-auto h-[75vh]">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requested Amount (₹)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10000"
          className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Advance
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the reason..."
          className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Repayment Date
        </label>
        <input
          type="date"
          value={repaymentDate}
          onChange={(e) => setRepaymentDate(e.target.value)}
          className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Advance Payment Type
        </label>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Installments
        </label>
        <input
          type="number"
          value={installments}
          onChange={(e) => setInstallments(e.target.value)}
          placeholder="e.g. 3"
          min={1}
          className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>

      <div className="pt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-1/2 cursor-pointer bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition duration-200"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
};

export default AdvancePaymentForm;