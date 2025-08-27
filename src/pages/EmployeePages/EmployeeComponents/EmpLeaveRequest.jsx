import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { toast } from "react-toastify";
import StatusPill from "../../../components/StatusPill";
import ApplyLeaveForm from "../EmployeeLeave/ApplyLeaveForm";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";


const EmpLeaveRequest = () => {
  const [showModal, setShowModal] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]); // fetched from API
  const [leaveHistory, setLeaveHistory] = useState([]);

  const { user } = useAuthStore(); // logged-in employee details

  // Fetch leave types from API
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await axiosInstance.get("/LeaveType/active");
        setLeaveTypes(res.data || []);
      } catch (error) {
        console.error("Failed to fetch leave types", error);
        toast.error("Unable to load leave types.");
      }
    };
    fetchLeaveTypes();
  }, []);

  // Map leave types for react-select
  const leaveOptions = leaveTypes.map((lt) => ({
    label: lt.leaveName,
    value: lt.leaveTypeId,
    code: lt.leaveCode,
    maxLeavesPerYear: lt.maxLeavesPerYear,
  }));

  // Overlap check
  const checkOverlap = (from, to) => {
    return leaveHistory.some((leave) => {
      const existingFrom = parseISO(leave.from);
      const existingTo = parseISO(leave.to);
      return (
        (isBefore(parseISO(from), existingTo) &&
          isAfter(parseISO(from), existingFrom)) ||
        (isBefore(parseISO(to), existingTo) &&
          isAfter(parseISO(to), existingFrom)) ||
        from === leave.from ||
        to === leave.to
      );
    });
  };

  // Handle Submit with API call
  const handleSubmitLeave = async ({ type, from, to, reason }) => {
    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1;
    const today = new Date();

    if (!type || !from || !to || !reason) return "Please complete all fields.";
    if (isBefore(new Date(to), new Date(from)))
      return "To date cannot be before From date.";
    if (isBefore(new Date(from), today))
      return "You cannot apply for backdated leave.";
    if (checkOverlap(from, to))
      return "You already have a leave applied in this date range.";
    if (days > type.maxLeavesPerYear)
      return `You cannot apply more than ${type.maxLeavesPerYear} days for ${type.label}.`;

    try {
      const payload = {
        employeeId: user?.id,
        leaveTypeId: type.value,
        leaveName: type.label,
        leaveCode: type.code,
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
        reason,
        status: "Pending",
        approvedBy: 0,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
      };

      const res = await axiosInstance.post("/api/EmployeeLeave", payload);

      // Update UI on success
      const newLeave = {
        id: res.data?.id || Date.now(),
        type: type.label,
        from,
        to,
        status: "Pending",
      };

      setLeaveHistory((prev) => [...prev, newLeave]);
      toast.success(`Leave Applied Successfully for ${days} day(s)!`);
      setShowModal(false);
      return null;
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply leave. Please try again.");
      return "API request failed.";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 shadow mb-6 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-2xl text-gray-800">Leave Requests</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition"
        >
          <FaPlus /> Apply Leave
        </button>
      </div>

      {/* Leave History */}
      <div className="bg-white shadow rounded mt-8 mx-6 p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Leave History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded overflow-hidden">
            <thead className="text-gray-600 bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{leave.type}</td>
                  <td className="px-4 py-3">
                    {format(new Date(leave.from), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    {format(new Date(leave.to), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={leave.status} />
                  </td>
                </tr>
              ))}
              {leaveHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveForm
        leaveOptions={leaveOptions}
        onSubmit={handleSubmitLeave}
        onClose={() => setShowModal(false)}
        showModal={showModal}
      />
    </div>
  );
};

export default EmpLeaveRequest;
