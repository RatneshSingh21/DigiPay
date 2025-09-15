import { useEffect, useState, useCallback } from "react";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ApplyLeaveForm from "../EmployeeLeave/ApplyLeaveForm";
import { FaPlus } from "react-icons/fa";
import { isBefore, format } from "date-fns";
import { toast } from "react-toastify";

// ================= Status Pill =================
const StatusPill = ({ status }) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-200 text-gray-700",
    default: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${colors[status?.toLowerCase()] || colors.default}`}>
      {status}
    </span>
  );
};

// ================= Emp Leave Request =================
const EmpLeaveRequest = () => {
  const { user } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);

  // --------- Fetch Leave Types ---------
  useEffect(() => {
    axiosInstance.get("/LeaveType/active")
      .then(res => setLeaveTypes(res.data || []))
      .catch(() => toast.error("Unable to load leave types."));
  }, []);

  // --------- Fetch Employees ---------
  useEffect(() => {
    if (!user?.userId) return;

    setLoading(true);
    // axiosInstance.get(`/user-auth/User-Employee/${user.userId}`)
    axiosInstance.get(`/user-auth/User-Employee/24`)
      .then(res => setEmployees(res.data || {}))
      .catch(err => {
        console.error(err);
        toast.error(err.response?.data?.message || "Error fetching employees");
      })
      .finally(() => setLoading(false));
  }, [user?.userId]);

  // --------- Fetch Leave History ---------
  const fetchLeaveHistory = useCallback(async () => {
    if (!user?.userId) return;

    setLoading(true);
    try {
      const res = await axiosInstance.get("/EmployeeLeave");
      const data = res.data?.data || [];

      const filteredLeaves = data.filter(
        leave =>
          leave.employeeId === user.userId ||
          employees.employees?.some(emp => emp.employeeId === leave.employeeId)
      );
      setLeaveHistory(filteredLeaves);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load leave history.");
    } finally {
      setLoading(false);
    }
  }, [user?.userId, employees]);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  // --------- React-Select Options ---------
  const leaveOptions = leaveTypes.map(lt => ({
    label: lt.leaveName,
    value: lt.leaveTypeId,
    code: lt.leaveCode,
    maxLeavesPerYear: lt.maxLeavesPerYear,
  }));

  const employeeOptions = [
    { label: `${employees.userName} (Admin)`, value: employees.userId, role: "admin" },
    ...(employees.employees?.map(emp => ({ label: `${emp.employeeName} (Employee)`, value: emp.employeeId, role: "employee" })) || [])
  ];

  // --------- Utility: Check Overlap ---------
  const checkOverlap = (newFrom, newTo) =>
    leaveHistory.some(leave => {
      const leaveFrom = new Date(leave.fromDate || leave.from);
      const leaveTo = new Date(leave.toDate || leave.to);
      return (newFrom <= leaveTo && newTo >= leaveFrom);
    });

  // --------- Handle Submit Leave ---------
  const handleSubmitLeave = async ({ type, from, to, reason, approvers }) => {
    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1;
    const today = new Date();

    if (!type || !from || !to || !reason) return "Please complete all fields.";
    if (isBefore(new Date(to), new Date(from))) return "To date cannot be before From date.";
    if (isBefore(new Date(from), today)) return "You cannot apply for backdated leave.";
    if (checkOverlap(new Date(from), new Date(to))) return "You already have a leave applied in this date range.";
    if (days > type.maxLeavesPerYear) return `You cannot apply more than ${type.maxLeavesPerYear} days for ${type.label}.`;

    try {
      await axiosInstance.post("/EmployeeLeave", {
        employeeId: user.userId,
        leaveTypeId: type.value,
        leaveName: type.label,
        leaveCode: type.code,
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
        reason,
        status: "Pending",
        approvedBy: 14,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        customApproverIds: approvers?.map(a => a.value) || [],
      });

      toast.success(`Leave Applied Successfully for ${days} day(s)!`);
      fetchLeaveHistory(); // refresh table
      return null;
    } catch (err) {
      console.error(err);
      // toast.error("Failed to apply leave. Please try again.");
      return "API request failed.";
    }
  };

  // --------- Render ---------
  const renderDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy");
  };

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-6 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800">Leave Requests</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition">
          <FaPlus /> Apply Leave
        </button>
      </div>

      {/* Leave History */}
      <div className="bg-white shadow rounded mt-8 mx-6 p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Leave History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded overflow-hidden">
            <thead className="text-gray-600 bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Approvers</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.length ? leaveHistory.map((leave) => (
                <tr key={leave.applyLeaveId || leave.leaveId} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{leave.leaveName || leave.type}</td>
                  <td className="px-4 py-3">{renderDate(leave.fromDate || leave.from)}</td>
                  <td className="px-4 py-3">{renderDate(leave.toDate || leave.to)}</td>
                  <td className="px-4 py-3"><StatusPill status={leave.status} /></td>
                  <td className="px-4 py-3">{leave.approvers?.map(a => a.label).join(", ") || "—"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-400">No leave records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveForm
        leaveOptions={leaveOptions}
        employeeOptions={employeeOptions}
        onSubmit={handleSubmitLeave}
        onClose={() => setShowModal(false)}
        showModal={showModal}
      />
    </div>
  );
};

export default EmpLeaveRequest;
