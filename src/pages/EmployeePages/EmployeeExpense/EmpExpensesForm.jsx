import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import Select from "react-select";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmpExpensesForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    headerId: "",
    expenseDetailsName: "",
    expenseDate: "",
    expenseLastDate: "",
    amount: "",
    description: "",
    file: null,
    approvers: [],
  });

  const User = useAuthStore((state) => state.user);
  const employeeId = User?.userId;
  // console.log(employeeId);

  const [headers, setHeaders] = useState([]);
  const [approverOptions, setApproverOptions] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [resHeaders, setResHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";

  // ---------- Fetch Headers ----------
  const fetchHeaders = async () => {
    try {
      const res = await axiosInstance.get(`/Header/employee/${employeeId}`);
      console.log(res.data);

      if (res.data?.statusCode === 200 && res.data?.response) {
        const formatted = res.data.response.map((h) => ({
          value: h.headerId,
          label: h.headerName,
          maxAllowedAmount: h.maxAllowedAmount,
        }));
        setHeaders(formatted);
        setResHeaders(formatted);
      } else {
        toast.error("No headers found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load headers");
    }
  };

    // ---------- Fetch Approvers ----------
const fetchApprovers = async () => {
  try {
    let approvers = [];

    // ===============================
    // 1️⃣ Fetch Approval Rules
    // ===============================
    const ruleRes = await axiosInstance.get("/ApprovalRule");
    const rules = ruleRes.data?.data || [];

    const expenseRule = rules.find(
      (r) => r.requestType?.toLowerCase() === "expense"
    );

    if (!expenseRule) {
      setApproverOptions([]);
      return;
    }

    // ===============================
    // 2️⃣ Fetch Approval Rule Roles
    // ===============================
    const ruleRoleRes = await axiosInstance.get("/ApprovalRuleRole");
    const ruleRoles = ruleRoleRes.data?.data || [];

    const expenseRuleRoles = ruleRoles.filter(
      (rr) => rr.ruleId === expenseRule.ruleId
    );

    const allowedRoleIds = expenseRuleRoles.map((rr) => rr.roleId);

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
    // 4️⃣ Fetch Employee Approvers (filtered by rule)
    // ===============================
    const empRes = await axiosInstance.get(
      "/EmployeeRoleMapping/approvers/all"
    );

    const expenseEmpRule = empRes.data?.find(
      (r) => r.requestType?.toLowerCase() === "expense"
    );

    if (expenseEmpRule?.approvers?.length) {
      const employeeApprovers = expenseEmpRule.approvers
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

      // 🔒 Deterministic rule: ONE SuperAdmin only
      const primarySuperAdmin = (userRes.data || [])
        .filter(
          (u) =>
            u.isVerified &&
            u.role?.toLowerCase() === "superadmin"
        )
        // 🔑 pick ONE (oldest / lowest userId)
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

    // ===============================
    // 6️⃣ Set options
    // ===============================
    setApproverOptions(approvers);
  } catch (err) {
    console.error("Error fetching approvers:", err);
    toast.error("Failed to load approvers");
  }
};

  useEffect(() => {
    fetchHeaders();
    fetchApprovers();
  }, []);

  // ---------- Input Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.expenseDetailsName || !formData.amount) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append("HeaderId", formData.headerId || 0);
      uploadData.append("ExpenseDetailsName", formData.expenseDetailsName);
      uploadData.append("ExpenseDate", formData.expenseDate);
      uploadData.append("ExpenseLastDate", formData.expenseLastDate);
      uploadData.append("Amount", formData.amount);
      uploadData.append("Description", formData.description);
      if (formData.file) uploadData.append("File", formData.file);

      // Append approver IDs
      const approverIds = formData.approvers.map((a) => a.value);
      approverIds.forEach((id) => uploadData.append("CustomApproverIds", id));

      const res = await axiosInstance.post(
        "/ExpenseDetails/create",
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data?.message || res.status === 201) {
        toast.success("Expense added successfully!");
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message + " || " + err?.response?.data?.detail ||
          "Failed to add expense."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in max-h-[70vh] overflow-y-scroll">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-2xl cursor-pointer"
        >
          <FiX />
        </button>

        <h2 className="text-lg font-semibold mb-5 text-gray-800">
          Add New Expense
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Header Dropdown */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Header <span className="text-red-500">*</span>
            </label>
            <Select
              options={headers}
              value={headers.find((h) => h.value === formData.headerId) || null}
              onChange={(selected) => {
                const header = resHeaders.find(
                  (h) => h.value === selected?.value
                );
                setSelectedHeader(header || null);
                setFormData((prev) => ({
                  ...prev,
                  headerId: selected ? selected.value : "",
                  expenseDetailsName: selected ? selected.label : "",
                }));
              }}
              placeholder="Select Header"
              autoFocus
            />

            {/* Show max allowed amount */}
            {selectedHeader && selectedHeader.maxAllowedAmount && (
              <p className="text-xs font-bold text-red-500 mt-1">
                Max Allowed Amount for {selectedHeader.label} is : ₹
                {selectedHeader.maxAllowedAmount}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter amount"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Expense Date
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Last Date
              </label>
              <input
                type="date"
                name="expenseLastDate"
                value={formData.expenseLastDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={inputClass}
              rows={3}
              placeholder="Enter description"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-medium mb-1">
              File Upload
            </label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              className={inputClass}
            />
          </div>

          {/* Custom Approvers */}
          <div>
            <label className="block text-xs font-medium mb-1">Approvers</label>
            <Select
              options={approverOptions}
              value={formData.approvers}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, approvers: selected }))
              }
              isMulti
              placeholder="Select approvers"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-primary text-white flex items-center justify-center px-5 py-2 rounded w-full transition ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-secondary cursor-pointer"
            }`}
          >
            {loading ? <Spinner /> : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmpExpensesForm;
