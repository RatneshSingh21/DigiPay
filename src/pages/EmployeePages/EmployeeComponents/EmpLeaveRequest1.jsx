import { useEffect, useState } from "react";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ApplyLeaveForm from "../EmployeeLeave/ApplyLeaveForm";
import { FaPlus } from "react-icons/fa";
import { isBefore, format } from "date-fns";
import { toast } from "react-toastify";

// StatusPill Component
const StatusPill = ({ status }) => {
  let styles = "px-3 py-1 text-xs font-medium rounded-full ";

  switch (status?.toLowerCase()) {
    case "pending":
      styles += "bg-yellow-100 text-yellow-700";
      break;
    case "approved":
      styles += "bg-green-100 text-green-700";
      break;
    case "rejected":
      styles += "bg-red-100 text-red-700";
      break;
    case "cancelled":
      styles += "bg-gray-200 text-gray-700";
      break;
    default:
      styles += "bg-blue-100 text-blue-700";
      break;
  }

  return <span className={styles}>{status}</span>;
};

const EmpLeaveRequest = () => {
  const [showModal, setShowModal] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();

  // Fetch leave types
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

  // Fetch employees for approver selection
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/Employee");
        setEmployees(response.data?.data || response.data || []);
      } catch (error) {
        console.error("Error fetching employee data:", error);

        if (error.response?.status === 403) {
          toast.error("You don't have permission to view employees.");
        } else {
          toast.error(
            error?.response?.data?.message || "Error fetching employee data"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // react-select options
  const leaveOptions = leaveTypes.map((lt) => ({
    label: lt.leaveName,
    value: lt.leaveTypeId,
    code: lt.leaveCode,
    maxLeavesPerYear: lt.maxLeavesPerYear,
  }));

  const employeeOptions = employees.map((emp) => ({
    label: emp.fullName || emp.name,
    value: emp.employeeId || emp.id,
  }));

  // Utility: check if leave dates overlap with existing leaves
  const checkOverlap = (newFrom, newTo, existingLeaves) => {
    return existingLeaves.some((leave) => {
      const leaveFrom = new Date(leave.from); // changed here
      const leaveTo = new Date(leave.to); // changed here
      return (
        (newFrom >= leaveFrom && newFrom <= leaveTo) || // start inside existing
        (newTo >= leaveFrom && newTo <= leaveTo) || // end inside existing
        (newFrom <= leaveFrom && newTo >= leaveTo) // fully covering existing
      );
    });
  };

  // Handle submit leave
  const handleSubmitLeave = async ({ type, from, to, reason, approvers }) => {
    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1;
    const today = new Date();

    if (!type || !from || !to || !reason) return "Please complete all fields.";
    if (isBefore(new Date(to), new Date(from)))
      return "To date cannot be before From date.";
    if (isBefore(new Date(from), today))
      return "You cannot apply for backdated leave.";
    if (checkOverlap(new Date(from), new Date(to), leaveHistory)) {
      return "You already have a leave applied in this date range.";
    }
    if (days > type.maxLeavesPerYear)
      return `You cannot apply more than ${type.maxLeavesPerYear} days for ${type.label}.`;

    try {
      const payload = {
        employeeId: user?.userId,
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
        customApproverIds: approvers?.map((a) => a.value) || [], // ✅ dynamic approvers
      };

      const res = await axiosInstance.post("/EmployeeLeave", payload);

      // update UI
      const newLeave = {
        id: res.data?.id || Date.now(),
        type: type.label,
        from,
        to,
        status: "Pending",
        approvers,
      };
      setLeaveHistory((prev) => [...prev, newLeave]);

      toast.success(`Leave Applied Successfully for ${days} day(s)!`);
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
                <th className="px-4 py-3 text-left">Approvers</th>
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
                  <td className="px-4 py-3">
                    {leave.approvers?.map((a) => a.label).join(", ") || "—"}
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
        employeeOptions={employeeOptions} // ✅ pass down
        onSubmit={handleSubmitLeave}
        onClose={() => setShowModal(false)}
        showModal={showModal}
      />
    </div>
  );
};

export default EmpLeaveRequest;
