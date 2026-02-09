import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";
import { FaTimes } from "react-icons/fa";

const paymentTypeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
];

const repaymentModeOptions = [
  { value: "SalaryDeduction", label: "Salary Deduction" },
  { value: "ManualPayment", label: "Manual Payment" },
];

const AdvancePaymentForm = ({ onSuccess, onClose }) => {
  const User = useAuthStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    repaymentDate: "",
    installments: "",
    advancePaymentType: null,
    repaymentMode: null,
    comments: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      amount,
      reason,
      repaymentDate,
      installments,
      advancePaymentType,
      repaymentMode,
    } = formData;

    if (
      !amount ||
      !reason ||
      !repaymentDate ||
      !installments ||
      !advancePaymentType ||
      !repaymentMode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
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
        reason: formData.reason,
        comments: "",
        customApproverIds: [],
        repaymentMode: repaymentMode.value,
      };

      await axiosInstance.post("/AdvancePayment", payload);
      toast.success("Advance payment request submitted!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Error submitting advance payment:", error);
      toast.error(error.response?.data?.error || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Apply Advance Payment
          </h3>
          <button onClick={onClose}>
            <FaTimes className="text-gray-500 hover:text-red-500 transition cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-1 px-6 py-4">
          {/* Amount */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Requested Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="e.g. 10000"
              className={inputClass}
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Reason for Advance <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Explain the reason..."
              className={inputClass}
              rows={3}
              required
            />
          </div>

          {/* Repayment Date */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Preferred Repayment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.repaymentDate}
              onChange={(e) => handleChange("repaymentDate", e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Payment Type */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Advance Payment Type <span className="text-red-500">*</span>
            </label>
            <Select
              options={paymentTypeOptions}
              value={formData.advancePaymentType}
              onChange={(val) => handleChange("advancePaymentType", val)}
              placeholder="Select payment type"
              className="text-sm"
            />
          </div>

          {/* Repayment Mode */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Repayment Mode <span className="text-red-500">*</span>
            </label>
            <Select
              options={repaymentModeOptions}
              value={formData.repaymentMode}
              onChange={(val) => handleChange("repaymentMode", val)}
              placeholder="Select repayment mode"
              className="text-sm"
            />
          </div>

          {/* Installments */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Number of Installments <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.installments}
              onChange={(e) => handleChange("installments", e.target.value)}
              placeholder="e.g. 3"
              min={1}
              className={inputClass}
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-3 text-sm">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-100 text-gray-700 cursor-pointer py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 bg-primary flex items-center cursor-pointer justify-center text-white py-2 rounded-lg font-semibold shadow hover:bg-secondary transition disabled:opacity-50"
            >
              {submitting ? <Spinner /> : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancePaymentForm;
