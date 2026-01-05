import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import { toast } from "react-toastify";
import { isBefore } from "date-fns";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const ApplyLeaveForm = ({ showModal, onClose, refreshHistory }) => {
  const { user } = useAuthStore();

  const [leaveOptions, setLeaveOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [formData, setFormData] = useState({
    type: null,
    from: "",
    to: "",
    reason: "",
    approvers: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -------- Fetch Leave Types --------
  useEffect(() => {
    if (!showModal || !user?.userId) return;

    const fetchAllocatedLeaves = async () => {
      try {
        // 1️⃣ Employee allocations
        const allocationRes = await axiosInstance.get(
          `/EmployeeLeaveAllocation/${user.userId}`
        );

        const allocations = allocationRes.data?.data || [];

        if (!allocations.length) {
          setLeaveOptions([]);
          return;
        }

        // 2️⃣ Master leave types
        const leaveTypeRes = await axiosInstance.get("/LeaveType/active");
        const leaveTypes = leaveTypeRes.data || [];

        // 3️⃣ JOIN allocation + master
        const options = allocations
          .filter((a) => a.isActive)
          .map((a) => {
            const lt = leaveTypes.find((l) => l.leaveTypeId === a.leaveTypeId);

            if (!lt) return null;

            return {
              value: lt.leaveTypeId,
              label:
                a.leavesRemaining > 0
                  ? `${lt.leaveName} (Remaining: ${a.leavesRemaining})`
                  : `${lt.leaveName} (No Balance)`,

              code: lt.leaveCode,
              remainingLeaves: a.leavesRemaining,
              yearlyLimit: lt.maxLeavesPerYear,
              totalAllocated: a.totalLeavesAllocated,
              leavesTaken: a.leavesTaken,

              isDisabled: a.leavesRemaining === 0, // ✅ THIS LINE IS IMPORTANT
            };
          })
          .filter(Boolean);

        setLeaveOptions(options);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load allocated leave types.");
      }
    };

    fetchAllocatedLeaves();
  }, [showModal, user?.userId]);

  // -------- Fetch Approvers --------
  useEffect(() => {
    if (!showModal) return;
    axiosInstance
      .get("/EmployeeRoleMapping/approvers/all")
      .then((res) => {
        const leaveRule = res.data?.find(
          (rule) => rule.requestType?.toLowerCase() === "leave"
        );
        if (leaveRule?.approvers) {
          const formatted = leaveRule.approvers.map((a) => ({
            value: a.employeeId,
            label: `${a.employeeName} (${a.roleName})`,
            role: a.roleName,
          }));
          setEmployeeOptions(formatted);

          // Preselect Admin(s)
          const adminApprovers = formatted.filter(
            (emp) => emp.role?.toLowerCase() === "admin"
          );
          if (adminApprovers.length > 0) {
            setFormData((prev) => ({ ...prev, approvers: adminApprovers }));
          }
        }
      })
      .catch(() => toast.error("Unable to load approvers."));
  }, [showModal]);

  // -------- Fetch Leave History (for overlap validation) --------
  useEffect(() => {
    if (!showModal || !user?.userId) return;
    axiosInstance
      .get("/EmployeeLeave")
      .then((res) => {
        const data = res.data?.data || [];
        setLeaveHistory(
          data.filter((leave) => leave.employeeId === user.userId)
        );
      })
      .catch(() => toast.error("Unable to fetch leave history."));
  }, [showModal, user?.userId]);

  // -------- Check Overlap --------
  const checkOverlap = (newFrom, newTo) =>
    leaveHistory.some((leave) => {
      const leaveFrom = new Date(leave.fromDate || leave.from);
      const leaveTo = new Date(leave.toDate || leave.to);
      return newFrom <= leaveTo && newTo >= leaveFrom;
    });

  // -------- Handle Input --------
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // -------- Handle Submit --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { type, from, to, reason, approvers } = formData;

    const startDate = new Date(from);
    const endDate = new Date(to);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Required fields
    if (!type || !from || !to || !reason) {
      setError("Please complete all fields.");
      return;
    }

    // To date before From date
    if (endDate < startDate) {
      setError("To date cannot be before From date.");
      return;
    }

    // Backdated not allowed → today allowed
    const startDateOnly = new Date(from);
    const todayOnly = new Date();
    todayOnly.setHours(0, 0, 0, 0);

    if (startDateOnly < todayOnly) {
      setError("You cannot apply for a backdated leave.");
      return;
    }

    // Overlap check
    if (checkOverlap(startDate, endDate)) {
      setError("You already have a leave applied in this date range.");
      return;
    }

    const days = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

    if (days > type.remainingLeaves) {
      setError(
        `Only ${type.remainingLeaves} days remaining for ${type.label}.`
      );
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/EmployeeLeave", {
        employeeId: user.userId,
        leaveTypeId: type.value,
        leaveName: type.label,
        leaveCode: type.code,
        fromDate: startDate.toISOString(),
        toDate: endDate.toISOString(),
        reason,
        customApproverIds: approvers?.map((a) => a.value) || [],
      });

      toast.success(`Leave Applied Successfully for ${days} day(s)!`);
      refreshHistory?.();
      setFormData({
        type: null,
        from: "",
        to: "",
        reason: "",
        approvers: [],
      });
      setError("");
      onClose();
    } catch (err) {
      console.error(err?.response?.data.error);
      setError(err?.response?.data.error || "Failed to apply leave.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md animate-fade-in">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-gray-800">Apply Leave</h3>
          <button onClick={onClose}>
            <FaTimes className="text-gray-600 cursor-pointer hover:text-red-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-1">
          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <Select
              options={leaveOptions}
              value={formData.type}
              onChange={(selected) =>
                setFormData({ ...formData, type: selected })
              }
              placeholder="Select Leave Type"
              autoFocus
              required
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              placeholder="Enter your reason for leave"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Approvers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approvers
            </label>
            <Select
              options={employeeOptions}
              value={formData.approvers}
              onChange={(selected) =>
                setFormData({ ...formData, approvers: selected })
              }
              isMulti
              placeholder="Select approvers"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary cursor-pointer text-white py-2 mt-2 rounded hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Submit Leave Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveForm;
