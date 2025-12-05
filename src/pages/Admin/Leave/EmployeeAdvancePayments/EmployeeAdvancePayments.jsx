import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";



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

const EmployeeAdvancePayments = () => {
  const [employees, setEmployees] = useState([]);
  const [approverOptions, setApproverOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employee: null,
    amount: "",
    reason: "",
    repaymentDate: "",
    installments: "",
    advancePaymentType: null,
    repaymentMode: null,
    comments: "",
    approvers: [],
  });

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/Employee");
        setEmployees(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch approvers
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoadingApprovers(true);
        const res = await axiosInstance.get(
          "/EmployeeRoleMapping/approvers/all"
        );

        if (Array.isArray(res.data)) {
          const advancePaymentRule = res.data.find(
            (rule) => rule.requestType?.toLowerCase() === "advancepayment"
          );

          if (advancePaymentRule?.approvers?.length) {
            const formatted = advancePaymentRule.approvers.map((a) => ({
              value: a.employeeId,
              label: `${a.employeeName} (${a.roleName})`,
              role: a.roleName,
            }));
            setApproverOptions(formatted);

            // Auto-select Admin(s)
            const adminApprovers = formatted.filter(
              (emp) => emp.role?.toLowerCase() === "admin"
            );
            if (adminApprovers.length > 0) {
              setFormData((prev) => ({ ...prev, approvers: adminApprovers }));
            }
          }
        }
      } catch (err) {
        console.error(err);
        // toast.error("Failed to load approvers");
      } finally {
        setLoadingApprovers(false);
      }
    };

    fetchApprovers();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      employee,
      amount,
      reason,
      repaymentDate,
      installments,
      advancePaymentType,
      repaymentMode,
      approvers,
    } = formData;

    if (
      !employee ||
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
        employeeId: employee.value,
        advancePaymentAmount: totalAmount,
        advancePaymentType: advancePaymentType.value,
        noOfInstallments,
        installmentAmount,
        repaymentStartDate: new Date(repaymentDate).toISOString(),
        reason,
        comments: formData.comments,
        customApproverIds: approvers?.map((a) => a.value) || [],
        repaymentMode: repaymentMode.value,
      };

      await axiosInstance.post("/AdvancePayment", payload);
      toast.success("Advance payment request submitted!");
      setFormData({
        employee: null,
        amount: "",
        reason: "",
        repaymentDate: "",
        installments: "",
        advancePaymentType: null,
        repaymentMode: null,
        comments: "",
        approvers: approvers, // keep selected approvers
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Employee Advance Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Employee */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Employee <span className="text-red-500">*</span>
          </label>
          <Select
            options={employees.map((e) => ({
              value: e.id,
              label: `${e.fullName} (${e.employeeCode})`,
            }))}
            value={formData.employee}
            onChange={(val) => handleChange("employee", val)}
            placeholder="Select employee"
          />
        </div>

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
            className="w-full px-4 py-2 border border-blue-200 outline-none rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            rows={3}
            placeholder="Reason for Advance Payment"
            className="w-full px-4 py-2 border border-blue-200 outline-none rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Repayment Date */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Repayment Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.repaymentDate}
            onChange={(e) => handleChange("repaymentDate", e.target.value)}
            className="w-full px-4 py-2 border border-blue-200 outline-none rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Advance Payment Type */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Advance Payment Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={paymentTypeOptions}
            value={formData.advancePaymentType}
            onChange={(val) => handleChange("advancePaymentType", val)}
            placeholder="Select type"
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
            placeholder="Select mode"
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
            min={1}
            onChange={(e) => handleChange("installments", e.target.value)}
            placeholder="e.g. 3"
           className="w-full px-4 py-2 border border-blue-200 outline-none rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Approvers */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Approvers
          </label>
          <Select
            options={approverOptions}
            value={formData.approvers}
            onChange={(val) => handleChange("approvers", val || [])}
            isMulti
            isLoading={loadingApprovers}
            placeholder="Select approvers"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="reset"
            onClick={() =>
              setFormData({
                employee: null,
                amount: "",
                reason: "",
                repaymentDate: "",
                installments: "",
                advancePaymentType: null,
                repaymentMode: null,
                comments: "",
                approvers: [],
              })
            }
            className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition disabled:opacity-50 flex justify-center items-center"
          >
            {submitting ? <Spinner /> : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeAdvancePayments;
