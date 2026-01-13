import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaFileInvoiceDollar,
  FaDownload,
  FaRupeeSign,
  FaCommentDots,
} from "react-icons/fa";

import {
  FiCalendar, // From
  FiCheckSquare, // To
  FiClock, // Submitted
} from "react-icons/fi";

import { toast } from "react-toastify";
import EmpExpensesForm from "./EmpExpensesForm";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Select from "react-select";

const EmpExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const employeeId = useAuthStore((state) => state.user?.userId);
  const [headerOptions, setHeaderOptions] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const [approverMap, setApproverMap] = useState({});

  const fetchStatusList = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      if (res.data?.data) {
        setStatusList(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch status master", err);
    }
  };

  const fetchExpenseApproverMap = async () => {
    try {
      const map = {};

      // ===============================
      // 1️⃣ Approval Rule
      // ===============================
      const ruleRes = await axiosInstance.get("/ApprovalRule");
      const rules = ruleRes.data?.data || [];

      const expenseRule = rules.find(
        (r) => r.requestType?.toLowerCase() === "expense"
      );

      if (!expenseRule) {
        setApproverMap({});
        return;
      }

      // ===============================
      // 2️⃣ Rule Roles
      // ===============================
      const ruleRoleRes = await axiosInstance.get("/ApprovalRuleRole");
      const ruleRoles = ruleRoleRes.data?.data || [];

      const allowedRoleIds = ruleRoles
        .filter((rr) => rr.ruleId === expenseRule.ruleId)
        .map((rr) => rr.roleId);

      // ===============================
      // 3️⃣ Role List (SuperAdmin check)
      // ===============================
      const roleListRes = await axiosInstance.get("/RoleList/getall");
      const roleList = roleListRes.data || [];

      const superAdminRole = roleList.find(
        (r) => r.roleName?.toLowerCase() === "superadmin"
      );

      const requiresSuperAdmin =
        superAdminRole && allowedRoleIds.includes(superAdminRole.roleID);

      // ===============================
      // 4️⃣ Employee Approvers → USER MAPPING (IMPORTANT)
      // ===============================
      const empRes = await axiosInstance.get(
        "/EmployeeRoleMapping/approvers/all"
      );

      const expenseEmpRule = empRes.data?.find(
        (r) => r.requestType?.toLowerCase() === "expense"
      );

      // 🔑 Fetch users ONCE
      const userRes = await axiosInstance.get("/user-auth/all");
      const users = userRes.data || [];

      if (expenseEmpRule?.approvers?.length) {
        expenseEmpRule.approvers
          .filter((a) => allowedRoleIds.includes(a.roleId))
          .forEach((a) => {
            const user = users.find((u) => u.employeeId === a.employeeId);

            if (user) {
              map[user.userId] = `${user.name} (${a.roleName})`;
            }
          });
      }

      // ===============================
      // 5️⃣ SuperAdmin (ONLY if rule allows)
      // ===============================
      if (requiresSuperAdmin) {
        const primarySuperAdmin = users
          .filter((u) => u.isVerified && u.role?.toLowerCase() === "superadmin")
          .sort((a, b) => a.userId - b.userId)[0];

        if (primarySuperAdmin) {
          map[
            primarySuperAdmin.userId
          ] = `${primarySuperAdmin.name} (SuperAdmin)`;
        }
      }

      setApproverMap(map);
    } catch (err) {
      console.error("Failed to fetch expense approvers", err);
    }
  };

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/ExpenseDetails/by-employee/${employeeId}`
      );
      // console.log(res.data);

      if (res.data?.data) {
        setExpenses(
          res.data.data.sort(
            (a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)
          )
        );
        const uniqueHeaders = [
          ...new Set(res.data.data.map((e) => e.expenseDetailsName)),
        ];
        const formatted = uniqueHeaders.map((h) => ({ value: h, label: h }));
        setHeaderOptions(formatted);
      }
    } catch (err) {
      console.error(err);
      // toast.error(err?.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchStatusList();
    fetchExpenseApproverMap();
  }, []);

  const getStatusBadge = (statusId) => {
    const found = statusList.find((s) => s.statusId === statusId);

    if (!found) {
      return { text: "Unknown", color: "bg-gray-100 text-gray-700" };
    }

    switch (found.statusName.toLowerCase()) {
      case "pending":
        return {
          text: found.statusName,
          color: "bg-yellow-100 text-yellow-700",
        };
      case "processed":
        return { text: found.statusName, color: "bg-blue-100 text-blue-700" };
      case "approved":
        return { text: found.statusName, color: "bg-green-100 text-green-700" };
      case "rejected":
        return { text: found.statusName, color: "bg-red-100 text-red-700" };
      default:
        return { text: found.statusName, color: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="px-6 py-3 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
          Expense Details
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-secondary cursor-pointer transition text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 shadow"
        >
          <FaPlus /> Add Expense
        </button>
      </div>

      {/* Search by Header */}
      <div className="px-6 mb-4 flex justify-end">
        <div className="w-full sm:w-64">
          <Select
            options={headerOptions}
            value={selectedHeader}
            onChange={(selected) => setSelectedHeader(selected)}
            isClearable
            placeholder="Search by Header..."
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : expenses.length > 0 ? (
        <div className="grid gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {expenses
            .filter((exp) =>
              selectedHeader
                ? exp.expenseDetailsName === selectedHeader.value
                : true
            )
            .map((exp) => {
              const status = getStatusBadge(exp.statusId);
              return (
                <div
                  key={exp.expenseDetailsId}
                  className="rounded-xl bg-white shadow-md hover:shadow-lg hover:cursor-pointer hover:border-blue-200 transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg truncate flex items-center gap-2">
                        {exp.expenseDetailsName || "Unnamed Expense"}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p className="flex items-center gap-2">
                        <FaRupeeSign className="text-primary" />
                        <strong>Amount:</strong> ₹{exp.amount || 0}
                      </p>
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <FiCalendar className="text-orange-500" />
                        <strong>From:</strong>{" "}
                        {exp.expenseDate
                          ? new Date(exp.expenseDate).toLocaleDateString(
                              "en-GB"
                            )
                          : "N/A"}
                      </p>

                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <FiCheckSquare className="text-orange-500" />
                        <strong>To:</strong>{" "}
                        {exp.expenseLastDate
                          ? new Date(exp.expenseLastDate).toLocaleDateString(
                              "en-GB"
                            )
                          : "N/A"}
                      </p>

                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <FiClock className="text-orange-500" />
                        <strong>Submitted Date:</strong>{" "}
                        {exp.createdOn
                          ? new Date(exp.createdOn).toLocaleDateString("en-GB")
                          : "N/A"}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="flex items-center gap-2 text-sm text-gray-700 bg-gray-200 p-2 rounded-md mb-3 border border-gray-100">
                      <FaCommentDots className="text-gray-500" />
                      <span>
                        <strong>Description:</strong>{" "}
                        {exp.description || "No description provided."}
                      </span>
                    </p>

                    {/* Approvers */}
                    {exp.customApproverIds?.length > 0 && (
                      <div className="mt-3 text-xs text-gray-600">
                        <strong>Approver:</strong>{" "}
                        {exp.customApproverIds
                          .map((id) => approverMap[id] || `User ${id}`)
                          .join(", ")}
                      </div>
                    )}

                    {/* File + Footer */}
                    <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                      {exp.filePath ? (
                        <a
                          href={exp.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary text-sm hover:text-secondary transition"
                        >
                          <FaDownload /> View File
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No File</span>
                      )}
                      <span className="text-xs text-gray-400">
                        ID: #{exp.expenseDetailsId}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20">
          No expenses found.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <EmpExpensesForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchExpenses}
        />
      )}
    </div>
  );
};

export default EmpExpenses;
