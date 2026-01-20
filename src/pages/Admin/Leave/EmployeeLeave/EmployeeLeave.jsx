import React, { useEffect, useState } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { format } from "date-fns";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../../components/Spinner";
import EmployeeLeaveForm from "./EmployeeLeaveForm";
import assets from "../../../../assets/assets";

const EmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all employee leaves
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/EmployeeLeave");
      setLeaves(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch employee leaves");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch employees");
    }
  };

  // Fetch status master
  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      setStatuses(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch status master");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
    fetchStatuses();
  }, []);

  // Get employee full name + code by ID
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : "Unknown Employee";
  };

  // Map leave status using StatusMaster
  const getStatusBadge = (statusId) => {
    const status = statuses.find((s) => s.statusId === statusId);
    if (!status) {
      return (
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
          Unknown
        </span>
      );
    }

    let colorClass = "bg-gray-100 text-gray-800";
    switch (status.statusName.toLowerCase()) {
      case "pending":
        colorClass = "bg-yellow-100 text-yellow-800";
        break;
      case "approved":
        colorClass = "bg-green-100 text-green-800";
        break;
      case "rejected":
        colorClass = "bg-red-100 text-red-800";
        break;
      case "processed":
        colorClass = "bg-blue-100 text-blue-800";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800";
    }

    return (
      <span className={`${colorClass} px-2 py-1 rounded text-xs`}>
        {status.statusName}
      </span>
    );
  };

  // Filter leaves based on employee search
  const filteredLeaves = leaves.filter((leave) =>
    getEmployeeName(leave.employeeId)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  // Highlight matching text
  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.toString().split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-14 z-20">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Employee Leave Management
          </h2>
          <p className="text-sm text-gray-500">
            View and manage employee leave requests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search employee name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Action */}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-white
                     px-5 py-2 rounded-lg text-sm font-medium
                     hover:bg-secondary transition shadow"
          >
            <FiPlus size={16} />
            Apply Leave
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <img
              src={assets.NoData}
              alt="No leave data"
              className="w-52 mb-6 opacity-90"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Leave Requests
            </h3>
            <p className="text-sm text-gray-600 max-w-md mb-6">
              There are no leave requests available. Click below to apply a new
              leave request.
            </p>
            <button
              onClick={fetchLeaves}
              className="inline-flex items-center gap-2 bg-primary text-white
                       px-6 py-2 rounded-full text-sm font-medium
                       hover:bg-secondary transition shadow"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-xs uppercase text-gray-500 text-center">
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Leave</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied On</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredLeaves.map((leave, index) => (
                  <tr
                    key={leave.applyLeaveId}
                    className="hover:bg-gray-50 transition text-center"
                  >
                    <td className="px-4 py-3">{index + 1}</td>

                    <td className="px-4 py-3 font-medium">
                      {highlightText(getEmployeeName(leave.employeeId))}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {leave.leaveName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leave.leaveCode}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {format(new Date(leave.fromDate), "dd MMM yyyy")}
                    </td>

                    <td className="px-4 py-3">
                      {format(new Date(leave.toDate), "dd MMM yyyy")}
                    </td>

                    <td className="px-4 py-3 max-w-xs truncate">
                      {leave.reason}
                    </td>

                    <td className="px-4 py-3">
                      {getStatusBadge(leave.status)}
                    </td>

                    <td className="px-4 py-3">
                      {format(new Date(leave.createdOn), "dd MMM yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <EmployeeLeaveForm onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
