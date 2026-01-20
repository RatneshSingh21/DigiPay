import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";
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

const EmployeeAdvancePaymentForm = ({ onClose, onSuccess }) => {
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
        let approvers = [];

        // ===============================
        // 1️⃣ Fetch Approval Rules
        // ===============================
        const ruleRes = await axiosInstance.get("/ApprovalRule");
        const rules = ruleRes.data?.data || [];

        const advanceRule = rules.find(
          (r) => r.requestType?.toLowerCase() === "advancepayment",
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
          (rr) => rr.ruleId === advanceRule.ruleId,
        );

        const allowedRoleIds = advanceRuleRoles.map((rr) => rr.roleId);

        // ===============================
        // 3️⃣ Fetch Role List
        // ===============================
        const roleListRes = await axiosInstance.get("/RoleList/getall");
        const roleList = roleListRes.data || [];

        const superAdminRole = roleList.find(
          (r) => r.roleName?.toLowerCase() === "superadmin",
        );

        const superAdminRoleId = superAdminRole?.roleID;
        const requiresSuperAdmin =
          superAdminRoleId && allowedRoleIds.includes(superAdminRoleId);

        // ===============================
        // 4️⃣ Fetch Employee Approvers (if any)
        // ===============================
        const empRes = await axiosInstance.get(
          "/EmployeeRoleMapping/approvers/all",
        );

        const advanceEmpRule = empRes.data?.find(
          (r) => r.requestType?.toLowerCase() === "advancepayment",
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
              (u) => u.isVerified && u.role?.toLowerCase() === "superadmin",
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
      onSuccess?.();
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

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg flex flex-col max-h-[90vh]">
      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 border-b flex justify-between sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-lg font-semibold">Employee Advance Payment</h2>
          <p className="text-sm text-muted-foreground">
            Apply advance payment request for an employee
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
        >
          <FaTimes className="text-gray-500" />
        </button>
      </div>

      {/* ================= BODY ================= */}
      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 overflow-y-auto space-y-2"
      >
        {/* GRID 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <Select
              options={employees.map((e) => ({
                value: e.id,
                label: `${e.fullName} (${e.employeeCode})`,
              }))}
              value={formData.employee}
              onChange={(v) => handleChange("employee", v)}
              placeholder="Select employee"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requested Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className={inputClass}
              placeholder="e.g. 10000"
            />
          </div>
        </div>

        {/* GRID 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Advance Payment Type <span className="text-red-500">*</span>
            </label>
            <Select
              options={paymentTypeOptions}
              value={formData.advancePaymentType}
              onChange={(v) => handleChange("advancePaymentType", v)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repayment Mode <span className="text-red-500">*</span>
            </label>
            <Select
              options={repaymentModeOptions}
              value={formData.repaymentMode}
              onChange={(v) => handleChange("repaymentMode", v)}
            />
          </div>
        </div>

        {/* GRID 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repayment Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.repaymentDate}
              onChange={(e) => handleChange("repaymentDate", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. of Installments <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={formData.installments}
              onChange={(e) => handleChange("installments", e.target.value)}
              className={inputClass}
              placeholder="e.g. 3"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Reason for advance payment"
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
            isMulti
            isLoading={loadingApprovers}
            onChange={(v) => handleChange("approvers", v || [])}
          />
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments
          </label>
          <textarea
            rows={2}
            value={formData.comments}
            onChange={(e) => handleChange("comments", e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Optional comments"
          />
        </div>
      </form>

      {/* ================= FOOTER ================= */}
      <div className="px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-md border cursor-pointer hover:bg-muted"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          onClick={handleSubmit}
          className="px-6 py-2 rounded-md bg-primary cursor-pointer text-white font-medium hover:bg-secondary disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Spinner />}
          Submit Request
        </button>
      </div>
    </div>
  );
};

export default EmployeeAdvancePaymentForm;
