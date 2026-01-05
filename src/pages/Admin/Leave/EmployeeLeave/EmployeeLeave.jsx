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
      .includes(searchQuery.toLowerCase())
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
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        <h2 className="font-semibold text-xl">Employee Leave Management</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by employee name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 bg-primary cursor-pointer text-white px-4 py-2 rounded hover:bg-secondary transition"
          >
            <FiPlus /> Apply Leave
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto px-2">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Spinner />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center 
               py-10 px-6 mx-4 my-6 rounded-2xl 
               bg-gradient-to-br from-white to-gray-50 
               shadow-sm"
          >
            <img
              src={assets.NoData}
              alt="No Attendance Data"
              className="w-56 mb-6 opacity-90"
            />

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Attendance Data Found
            </h3>

            <p className="text-sm text-gray-600 mb-6 max-w-md text-center">
              There is no biometric attendance available for the selected date.
              Try syncing the machine or select a different date.
            </p>

            <div className="flex gap-3">
              <button
                onClick={fetchLeaves}
                className="flex items-center gap-2 
                   bg-primary hover:bg-secondary 
                   text-white px-6 py-2 
                   rounded-full text-sm font-medium 
                   shadow hover:shadow-md transition"
              >
                <FiRefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm text-center text-gray-700 border-collapse">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Leave Type</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Applied On</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave, index) => (
                <tr
                  key={leave.applyLeaveId}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    {highlightText(getEmployeeName(leave.employeeId))}
                  </td>
                  <td className="px-4 py-2">
                    {leave.leaveName} ({leave.leaveCode})
                  </td>
                  <td className="px-4 py-2">
                    {format(new Date(leave.fromDate), "dd-MMM-yyyy")}
                  </td>
                  <td className="px-4 py-2">
                    {format(new Date(leave.toDate), "dd-MMM-yyyy")}
                  </td>
                  <td className="px-4 py-2">{leave.reason}</td>
                  <td className="px-4 py-2">{getStatusBadge(leave.status)}</td>
                  <td className="px-4 py-2">
                    {format(new Date(leave.createdOn), "dd-MMM-yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <EmployeeLeaveForm onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
