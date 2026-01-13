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
  const [approverOptions, setApproverOptions] = useState([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    repaymentDate: "",
    installments: "",
    advancePaymentType: null,
    repaymentMode: null,
    comments: "",
    approvers: [],
  });

  // Fetch approvers for AdvancePayment
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoadingApprovers(true);
        let approvers = [];

        // ===============================
        // 1️⃣ Fetch Approval Rules
        // ===============================
        const ruleRes = await axiosInstance.get("/ApprovalRule");
        const rules = ruleRes.data?.data || [];

        const advanceRule = rules.find(
          (r) => r.requestType?.toLowerCase() === "advancepayment"
        );

        if (!advanceRule) {
          setApproverOptions([]);
          return;
        }

        // ===============================
        // 2️⃣ Fetch Approval Rule Roles
        // ===============================
        const ruleRoleRes = await axiosInstance.get("/ApprovalRuleRole");
        const ruleRoles = ruleRoleRes.data?.data || [];

        const advanceRuleRoles = ruleRoles.filter(
          (rr) => rr.ruleId === advanceRule.ruleId
        );

        const allowedRoleIds = advanceRuleRoles.map((rr) => rr.roleId);

        // ===============================
        // 3️⃣ Fetch Role List
        // ===============================
        const roleListRes = await axiosInstance.get("/RoleList/getall");
        const roleList = roleListRes.data || [];

        const superAdminRole = roleList.find(
          (r) => r.roleName?.toLowerCase() === "superadmin"
        );

        const superAdminRoleId = superAdminRole?.roleID;
        const requiresSuperAdmin =
          superAdminRoleId && allowedRoleIds.includes(superAdminRoleId);

        // ===============================
        // 4️⃣ Fetch Employee Approvers (if any)
        // ===============================
        const empRes = await axiosInstance.get(
          "/EmployeeRoleMapping/approvers/all"
        );

        const advanceEmpRule = empRes.data?.find(
          (r) => r.requestType?.toLowerCase() === "advancepayment"
        );

        if (advanceEmpRule?.approvers?.length) {
          const employeeApprovers = advanceEmpRule.approvers
            .filter((a) => allowedRoleIds.includes(a.roleId))
            .map((a) => ({
              value: a.employeeId,
              label: `${a.employeeName} (${a.roleName})`,
              role: a.roleName,
              source: "EMPLOYEE",
            }));

          approvers = [...approvers, ...employeeApprovers];
        }

        // ===============================
        // 5️⃣ Fetch ONLY ONE SuperAdmin (AUTHORIZED)
        // ===============================
        if (requiresSuperAdmin) {
          const userRes = await axiosInstance.get("/user-auth/all");

          const primarySuperAdmin = (userRes.data || [])
            .filter(
              (u) => u.isVerified && u.role?.toLowerCase() === "superadmin"
            )
            // 🔑 deterministic: ONE approver only
            .sort((a, b) => a.userId - b.userId)[0];

          if (primarySuperAdmin) {
            const superAdminApprover = {
              value: primarySuperAdmin.userId,
              label: `${primarySuperAdmin.name} (SuperAdmin)`,
              role: "SuperAdmin",
              source: "USER",
            };

            approvers.push(superAdminApprover);

            // Auto-select
            setFormData((prev) => ({
              ...prev,
              approvers: [superAdminApprover],
            }));
          }
        }

        setApproverOptions(approvers);
      } catch (err) {
        console.error("Error fetching approvers:", err);
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
        customApproverIds: formData.approvers?.map((a) => a.value) || [],
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

  return (
    <div className="p-6 h-[90vh] text-sm overflow-auto bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Apply Advance Payment
        </h3>
        <button onClick={onClose}>
          <FaTimes className="text-gray-600 cursor-pointer hover:text-red-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={(selected) => handleChange("approvers", selected || [])}
            isMulti
            isLoading={loadingApprovers}
            placeholder="Select approvers"
            className="text-sm"
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
  );
};

export default AdvancePaymentForm;
