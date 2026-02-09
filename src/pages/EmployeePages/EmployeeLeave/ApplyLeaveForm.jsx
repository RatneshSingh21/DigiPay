import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const ApplyLeaveForm = ({ showModal, onClose, refreshHistory }) => {
  const { user } = useAuthStore();

  const [leaveOptions, setLeaveOptions] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [formData, setFormData] = useState({
    type: null,
    from: "",
    to: "",
    reason: "",
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
          `/EmployeeLeaveAllocation/${user.userId}`,
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
              leaveName: lt.leaveName,
              code: lt.leaveCode,
              remainingLeaves: a.leavesRemaining,
              yearlyLimit: lt.maxLeavesPerYear,
              totalAllocated: a.totalLeavesAllocated,
              leavesTaken: a.leavesTaken,

              isDisabled: a.leavesRemaining === 0, // THIS LINE IS IMPORTANT
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

  // -------- Fetch Leave History (for overlap validation) --------
  useEffect(() => {
    if (!showModal || !user?.userId) return;
    axiosInstance
      .get("/EmployeeLeave")
      .then((res) => {
        const data = res.data?.data || [];
        setLeaveHistory(
          data.filter((leave) => leave.employeeId === user.userId),
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
    const { type, from, to, reason } = formData;

    if (!type || !from || !to || !reason) {
      setError("Please complete all fields.");
      return;
    }

    const startDate = new Date(from);
    const endDate = new Date(to);
    const now = new Date();

    // To date before From date
    if (endDate < startDate) {
      setError("To date cannot be before From date.");
      return;
    }

    // Backdated leave not allowed
    if (startDate < now) {
      setError("You cannot apply for a backdated leave.");
      return;
    }

    // Overlap check
    if (checkOverlap(startDate, endDate)) {
      setError("You already have a leave applied in this date range.");
      return;
    }

    // Calculate total leave days
    const days = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

    if (days > type.remainingLeaves) {
      setError(
        `Only ${type.remainingLeaves} days remaining for ${type.label}.`,
      );
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/EmployeeLeave", {
        employeeId: user.userId,
        leaveTypeId: type.value,
        leaveName: type.leaveName,
        leaveCode: type.code,
        fromDate: startDate.toISOString(),
        toDate: endDate.toISOString(),
        reason,
        customApproverIds: [],
      });

      toast.success(`Leave Applied Successfully for ${days} day(s)!`);
      refreshHistory?.();
      setFormData({ type: null, from: "", to: "", reason: "" });
      setError("");
      onClose();
    } catch (err) {
      console.error(err?.response?.data?.error);
      setError(err?.response?.data?.error || "Failed to apply leave.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg animate-fade-in">
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">Apply Leave</h3>
          <button onClick={onClose}>
            <FaTimes className="text-gray-500 hover:text-red-500 transition cursor-pointer" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2 px-6 py-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Leave Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <Select
              options={leaveOptions}
              value={formData.type}
              onChange={(selected) =>
                setFormData({ ...formData, type: selected })
              }
              placeholder="Select leave type"
              className="mt-1 text-sm"
              autoFocus
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
          </div>
          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter reason for leave"
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-primary py-2 text-sm cursor-pointer
             font-medium text-white transition hover:bg-secondary
             disabled:cursor-not-allowed disabled:opacity-50
             flex items-center justify-center"
          >
            {loading ? <Spinner /> : "Submit Leave Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveForm;
