import { useEffect, useState, useCallback } from "react";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { isBefore, format } from "date-fns";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";
import { FaPlus } from "react-icons/fa";
import ApplyLeaveForm from "../EmployeeLeave/ApplyLeaveForm";

// ================= Status Pill =================
const StatusPill = ({ status }) => {
  const colors = {
    Approved: "bg-green-100 text-green-700 border border-green-300",
    Rejected: "bg-red-100 text-red-700 border border-red-300",
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    Cancelled: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  const pillClass =
    colors[status] || "bg-blue-100 text-blue-700 border border-blue-300"; // fallback

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
  const [approverMapping, setApproverMapping] = useState({});

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(8);

  // --------- Fetch Leave History ---------
  const fetchLeaveHistory = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/EmployeeLeave");
      const data = res.data?.data || [];
      const filteredLeaves = data.filter(
        (leave) => leave.employeeId === user.userId
      );
      setLeaveHistory(filteredLeaves);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load leave history.");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  // --------- Fetch Approvers History ---------
  const fetchApprovers = async () => {
    try {
      const res = await axiosInstance.get("/EmployeeRoleMapping/approvers/all");
      if (res.status === 200) {
        const mapping = {};
        res.data.forEach((rule) => {
          if (rule.requestType === "Leave") {
            mapping[rule.requestType] = {};
            rule.approvers.forEach((a) => {
              mapping[rule.requestType][a.employeeId] = a.employeeName;
            });
          }
        });
        setApproverMapping(mapping);
      }
    } catch (err) {
      toast.error("Failed to fetch approvers");
      console.error(err);
    }
  };
  useEffect(() => {
    fetchApprovers();
  }, []);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  // --------- Fetch Status Master ---------
  useEffect(() => {
    axiosInstance
      .get("/StatusMaster")
      .then((res) => {
        const data = res.data?.data || [];
        const map = {};
        data.forEach((s) => {
          map[s.statusId] = s.statusName;
        });
        setStatusMap(map);
      })
      .catch(() => toast.error("Failed to load statuses."));
  }, []);

  // --------- Render Date ---------
  const renderDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy");
  };

  // Pagination logic
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
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition"
        >
          <FaPlus /> Apply Leave
        </button>
      </div>

      {/* Leave History */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Leave History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border rounded overflow-hidden">
            <thead className="text-gray-600 bg-gray-100">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied On</th>
                <th className="px-4 py-3">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {currentLeaves.length ? (
                currentLeaves.map((leave) => {
                  const from = new Date(leave.fromDate);
                  const to = new Date(leave.toDate);
                  const diffDays =
                    Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr
                      key={leave.applyLeaveId}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">{leave.leaveName}</td>
                      <td className="px-4 py-3">{leave.leaveCode}</td>
                      <td className="px-4 py-3">
                        {renderDate(leave.fromDate)}
                      </td>
                      <td className="px-4 py-3">{renderDate(leave.toDate)}</td>
                      <td className="px-4 py-3">{diffDays} Days</td>
                      <td className="px-4 py-3">{leave.reason || "—"}</td>
                      <td className="px-4 py-3">
                        <StatusPill
                          status={statusMap[leave.status] || "Unknown"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {renderDate(leave.createdOn)}
                      </td>
                      <td className="px-4 py-3">
                        {leave.approvedBy && leave.approvedBy.length > 0
                          ? leave.approvedBy
                              .map(
                                (id) => approverMapping?.Leave?.[id] || "N/A"
                              )
                              .join(", ")
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-400">
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
