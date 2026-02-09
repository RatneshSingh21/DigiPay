import { useEffect, useState, useCallback } from "react";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";
import { FaPlus } from "react-icons/fa";
import ApplyLeaveForm from "../EmployeeLeave/ApplyLeaveForm";
import ApprovalHistoryCell from "../../../components/ApprovalHistoryCell";

// ================= Status Pill =================
const StatusPill = ({ status }) => {
  const colors = {
    Approved: "bg-green-100 text-green-700 border border-green-300",
    Rejected: "bg-red-100 text-red-700 border border-red-300",
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    Cancelled: "bg-gray-100 text-gray-700 border border-gray-300",
  };
  const pillClass =
    colors[status] || "bg-blue-100 text-blue-700 border border-blue-300";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${pillClass}`}>
      {status}
    </span>
  );
};

// ================= Emp Leave Request =================
const EmpLeaveRequest = () => {
  const { user } = useAuthStore();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(8);

  // --------- Fetch Leave History ---------
  const fetchLeaveHistory = useCallback(async () => {
    if (!user?.userId) return;

    const controller = new AbortController();
    setLoading(true);

    try {
      const res = await axiosInstance.get(
        `/EmployeeLeave/employee/${user.userId}`,
      );
      let leaves = res.data?.data ?? [];

      setLeaveHistory(leaves);
    } catch (err) {
      console.error("Leave history fetch failed:", err);
      toast.error(
        err.response?.data?.message || "Unable to load leave history",
      );
    } finally {
      setLoading(false);
    }

    // Cleanup (important)
    return () => controller.abort();
  }, [user?.userId]);

  // --------- Fetch Status Master ---------
  const fetchStatusMaster = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      const data = res.data?.data || [];
      const map = {};
      data.forEach((s) => (map[s.statusId] = s.statusName));
      setStatusMap(map);
    } catch {
      toast.error("Failed to load statuses.");
    }
  }, []);

  // --------- Effects ---------
  useEffect(() => {
    fetchStatusMaster();
    fetchLeaveHistory();
  }, [fetchStatusMaster, fetchLeaveHistory]);

  // --------- Render Date ---------
  const renderDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy");
  };

  // --------- Pagination ---------
  const totalDataLength = leaveHistory.length;
  const totalPages = Math.ceil(totalDataLength / perPageData);
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentLeaves = leaveHistory.slice(indexOfFirst, indexOfLast);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-2 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800">Leave Requests</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary cursor-pointer text-white text-sm px-4 py-2 rounded hover:bg-secondary transition"
        >
          <FaPlus /> Apply Leave
        </button>
      </div>

      {/* Leave History */}
      <div className="bg-white shadow rounded p-4">
        <div className="mt-4 border overflow-x-scroll border-gray-200 rounded-lg max-h-[65vh] bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 text-xs text-center">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200">S.No</th>
                <th className="px-4 py-3 border-r border-gray-200">Type</th>
                <th className="px-4 py-3 border-r border-gray-200">Code</th>
                <th className="px-4 py-3 border-r border-gray-200">From</th>
                <th className="px-4 py-3 border-r border-gray-200">To</th>
                <th className="px-4 py-3 border-r border-gray-200">Days</th>
                <th className="px-4 py-3 border-r border-gray-200">Reason</th>
                <th className="px-4 py-3 border-r border-gray-200">
                  Applied On
                </th>
                {/* <th className="px-4 py-3 border-r border-gray-200">Status</th> */}
                <th className="px-4 py-3 border-r border-gray-200">
                  Approved By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentLeaves.length ? (
                currentLeaves.map((leave, idx) => {
                  const from = new Date(leave.fromDate);
                  const to = new Date(leave.toDate);
                  const diffDays =
                    Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr
                      key={leave.applyLeaveId}
                      className={`hover:bg-gray-50 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 border-r border-gray-200">
                        {indexOfFirst + idx + 1}.
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {leave.leaveName}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {leave.leaveCode}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {renderDate(leave.fromDate)}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {renderDate(leave.toDate)}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {diffDays} Days
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {leave.reason || "—"}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {renderDate(leave.createdOn)}
                      </td>
                      {/* <td className="px-4 py-3 border-r border-gray-200">
                        <StatusPill
                          status={statusMap[leave.status] || "Unknown"}
                        />
                      </td> */}
                      <td className="px-4 py-3 border-r border-gray-200 text-left">
                        <ApprovalHistoryCell
                          approvalHistory={leave.approvalHistory}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-gray-400">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalDataLength > 0 && (
          <div className="p-4 pt-0 flex gap-4 justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={setCurrentPage}
              perPageData={perPageData}
              setPerPageData={setPerPageData}
              filteredData={leaveHistory}
              totalDataLength={totalDataLength}
            />
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveForm
        showModal={showModal}
        onClose={() => setShowModal(false)}
        refreshHistory={fetchLeaveHistory}
      />
    </div>
  );
};

export default EmpLeaveRequest;
