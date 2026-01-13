import React, { useEffect, useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Banknote,
  CheckCircle2,
  LayoutDashboard,
  Info,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import AdvancePaymentForm from "../EmpAdvance/AdvancePaymentForm";

// Status badge helper
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-blue-50 text-blue-700 border-blue-200",
    processed: "bg-indigo-50 text-indigo-700 border-indigo-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const statusKey = (status || "pending").toLowerCase();
  const className =
    styles[statusKey] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`capitalize px-2.5 py-0.5 text-xs font-semibold border rounded ${className}`}
    >
      {status}
    </span>
  );
};

// Installment row helper
const InstallmentRow = ({ inst, statusMap }) => {
  const status = statusMap[inst.statusId] || "Pending";
  const isPaid = status.toLowerCase() === "paid";

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            isPaid ? "bg-emerald-500" : "bg-gray-300"
          }`}
        />
        <span className="text-gray-600 font-medium">
          {new Date(inst.dueDate).toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-gray-900">
          ₹{inst.installmentAmount.toLocaleString()}
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  );
};

// Advance request card
const AdvanceRequestCard = ({
  req,
  statusMap,
  approverMap,
  isExpanded,
  onToggle,
}) => {
  const status = statusMap[req.statusId] || "Pending";
  const progress =
    req.advancePaymentAmount > 0
      ? ((req.advancePaymentAmount - req.balanceAmount) /
          req.advancePaymentAmount) *
        100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{req.advancePaymentAmount.toLocaleString()}
              </span>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Requested on{" "}
              {new Date(req.createdOn).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-primary"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Reason & Repayment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
              Reason
            </p>
            <p className="text-sm text-gray-700 font-medium">
              {req.reason || "No reason provided"}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
              Repayment
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                {req.noOfInstallments} Installments
              </span>
              {req.repaymentStartDate && (
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
                  Starts{" "}
                  {new Date(req.repaymentStartDate).toLocaleDateString(
                    "default",
                    { month: "short", year: "2-digit" }
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Repayment Progress */}
        {req.statusId !== 1 && req.statusId !== 3 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">
                Repayment Progress
              </span>
              <span className="text-primary font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
              <span>
                Paid: ₹
                {(
                  req.advancePaymentAmount - req.balanceAmount
                ).toLocaleString()}
              </span>
              <span>Balance: ₹{req.balanceAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Approvers */}
        {req.approvedBy?.length > 0 && (
          <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-gray-500">Approved by:</span>
            <div className="flex -space-x-2">
              {req.approvedBy.map((id, idx) => {
                const [hover, setHover] = useState(false);
                return (
                  <div
                    key={idx}
                    className="relative"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700 cursor-help">
                      {approverMap[id]?.charAt(0) || "U"}
                    </div>
                    {hover && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                        {approverMap[id] || `User ${id}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Installments */}
      <AnimatePresence>
        {isExpanded && req.installments?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50/30"
          >
            <div className="p-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                <Banknote className="w-3.5 h-3.5" /> Installment Schedule
              </h4>
              <div className="space-y-1">
                {req.installments.map((inst) => (
                  <InstallmentRow
                    key={inst.installmentId}
                    inst={inst}
                    statusMap={statusMap}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Component
export default function EmpAdvancePayment() {
  const [requests, setRequests] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [approverMap, setApproverMap] = useState({});
  const [expandedRequests, setExpandedRequests] = useState({});
  const [showApplyModal, setShowApplyModal] = useState(false);

  const User = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Statuses
        const statusRes = await axiosInstance.get("/StatusMaster");
        const statusMapTemp = {};
        statusRes.data.data.forEach(
          (s) => (statusMapTemp[s.statusId] = s.statusName)
        );
        setStatusMap(statusMapTemp);

        // ✅ Rule-based approvers
        await fetchAdvanceApprovers();

        // Requests
        if (User?.userId) {
          const reqRes = await axiosInstance.get(
            `/AdvancePayment/employee/${User.userId}`
          );
          setRequests(reqRes.data?.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [User?.userId]);

  const fetchAdvanceApprovers = async () => {
    try {
      const map = {};

      // ===============================
      // 1️⃣ Approval Rule
      // ===============================
      const ruleRes = await axiosInstance.get("/ApprovalRule");
      const rules = ruleRes.data?.data || [];

      const advanceRule = rules.find(
        (r) => r.requestType?.toLowerCase() === "advancepayment"
      );

      if (!advanceRule) {
        setApproverMap({});
        return;
      }

      // ===============================
      // 2️⃣ Rule Roles
      // ===============================
      const ruleRoleRes = await axiosInstance.get("/ApprovalRuleRole");
      const ruleRoles = ruleRoleRes.data?.data || [];

      const advanceRuleRoles = ruleRoles.filter(
        (rr) => rr.ruleId === advanceRule.ruleId
      );

      const allowedRoleIds = advanceRuleRoles.map((rr) => rr.roleId);

      // ===============================
      // 3️⃣ Role List (SuperAdmin check)
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
      // 4️⃣ Employee Approvers
      // ===============================
      const empRes = await axiosInstance.get(
        "/EmployeeRoleMapping/approvers/all"
      );

      const advanceEmpRule = empRes.data?.find(
        (r) => r.requestType?.toLowerCase() === "advancepayment"
      );

      if (advanceEmpRule?.approvers?.length) {
        advanceEmpRule.approvers
          .filter((a) => allowedRoleIds.includes(a.roleId))
          .forEach((a) => {
            map[a.employeeId] = `${a.employeeName} (${a.roleName})`;
          });
      }

      // ===============================
      // 5️⃣ SuperAdmin (ONLY if rule allows)
      // ===============================
      if (requiresSuperAdmin) {
        const userRes = await axiosInstance.get("/user-auth/all");

        const primarySuperAdmin = (userRes.data || [])
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
      console.error("Failed to fetch advance approvers", err);
    }
  };

  const toggleExpand = (id) =>
    setExpandedRequests((prev) => ({ ...prev, [id]: !prev[id] }));
  const totalAdvance = requests.reduce(
    (acc, curr) => acc + curr.advancePaymentAmount,
    0
  );
  const activeRequests = requests.filter(
    (r) => r.statusId !== 3 && r.statusId !== 4
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky shadow top-14 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-gray-500" />
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Advance Payment
            </h1>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 bg-primary cursor-pointer text-white text-sm px-4 py-2 rounded hover:bg-secondary transition"
          >
            <Plus className="w-4 h-4" /> Apply New
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl shadow-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-5 relative overflow-hidden">
            <p className="text-indigo-100 font-medium">Total Advanced</p>
            <h2 className="text-3xl font-bold">
              ₹{totalAdvance.toLocaleString()}
            </h2>
            <p className="text-xs text-indigo-100/80 mt-1">
              Lifetime approved amount
            </p>
          </div>

          <div className="rounded-xl shadow-sm bg-white border border-gray-200 p-5">
            <p className="text-gray-500 font-medium">Active Requests</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {activeRequests}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Currently in repayment or processing
            </p>
          </div>

          <div className="rounded-xl shadow-sm bg-indigo-50/30 border border-indigo-100 p-5">
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-indigo-600" /> Policy Highlights
            </h3>
            <ul className="text-sm text-indigo-800 space-y-1.5 list-disc pl-4 marker:text-indigo-400">
              <li>
                Max advance: <strong>₹50,000</strong>
              </li>
              <li>
                Max <strong>30%</strong> of monthly salary
              </li>
              <li>One active request at a time</li>
            </ul>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((req) => (
            <AdvanceRequestCard
              key={req.advancePaymentId}
              req={req}
              statusMap={statusMap}
              approverMap={approverMap}
              isExpanded={expandedRequests[req.advancePaymentId]}
              onToggle={() => toggleExpand(req.advancePaymentId)}
            />
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl"
            >
              <AdvancePaymentForm
                onSuccess={() => {
                  setShowApplyModal(false);
                  // Refresh the requests list after successful submission
                  axiosInstance
                    .get(`/AdvancePayment/employee/${User.userId}`)
                    .then((res) => setRequests(res.data?.data || []))
                    .catch(console.error);
                }}
                onClose={() => setShowApplyModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
