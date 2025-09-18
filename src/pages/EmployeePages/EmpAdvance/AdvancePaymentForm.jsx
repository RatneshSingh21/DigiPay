import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";

const paymentTypeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
];

const AdvancePaymentForm = ({ onSuccess, onClose }) => {
  const User = useAuthStore((state) => state.user);
  const [approverOptions, setApproverOptions] = useState([]); // options for approvers dropdown
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    repaymentDate: "",
    installments: "",
    advancePaymentType: null,
    comments: "",
    approvers: [],
  });

  // Fetch approvers for AdvancePayment
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoadingApprovers(true);
        const res = await axiosInstance.get(
          "/EmployeeRoleMapping/approvers/all"
        );

        if (Array.isArray(res.data)) {
          // find AdvancePayment approvers only
          const advancePaymentRule = res.data.find(
            (rule) => rule.requestType === "AdvancePayment"
          );

          if (advancePaymentRule && advancePaymentRule.approvers) {
            const options = advancePaymentRule.approvers.map((a) => ({
              value: a.employeeId,
              label: `${a.employeeName} (${a.roleName})`,
            }));
            setApproverOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching approvers:", error);
        toast.error("Failed to load approvers");
      } finally {
        setLoadingApprovers(false);
      }
    };
    fetchApprovers();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { amount, reason, repaymentDate, installments, advancePaymentType } =
      formData;

    if (
      !amount ||
      !reason ||
      !repaymentDate ||
      !installments ||
      !advancePaymentType
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
        comments: formData.comments,
        customApproverIds: formData.approvers?.map((a) => a.value) || [],
      };

      await axiosInstance.post("/AdvancePayment", payload);
      toast.success("Advance payment request submitted!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Error submitting advance payment:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-6 h-[75vh] overflow-y-auto bg-white rounded-xl shadow-lg"
    >
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requested Amount (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          placeholder="e.g. 10000"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Advance <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          placeholder="Explain the reason..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      {/* Repayment Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Repayment Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.repaymentDate}
          onChange={(e) => handleChange("repaymentDate", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Payment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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

      {/* Installments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Installments <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.installments}
          onChange={(e) => handleChange("installments", e.target.value)}
          placeholder="e.g. 3"
          min={1}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comments
        </label>
        <textarea
          value={formData.comments}
          onChange={(e) => handleChange("comments", e.target.value)}
          placeholder="Any additional notes..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Approvers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Approvers
        </label>
        <Select
          options={approverOptions}
          value={formData.approvers}
          onChange={(selected) => handleChange("approvers", selected || [])}
          isMulti
          isLoading={loadingApprovers}
          placeholder="Select approvers"
          className="text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="pt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="w-1/2 bg-primary flex items-center justify-center text-white py-2 rounded-lg font-semibold shadow hover:bg-secondary transition disabled:opacity-50"
        >
          {submitting ? <Spinner /> : "Submit Request"}
        </button>
      </div>
    </form>
  );
};

export default AdvancePaymentForm;
