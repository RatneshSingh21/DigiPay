import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Pagination from "../../../components/Pagination";
import useAuthStore from "../../../store/authStore";
import OutDutyFormModal from "../EmpOutDuty/OutDutyFormModal";

const EmpOutDuty = () => {
  const [requests, setRequests] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approverMapping, setApproverMapping] = useState({});
  const userId = useAuthStore((state) => state.user?.userId);

  // 🔹 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(8);

  // Derived data
  const totalDataLength = requests.length;
  const totalPages = Math.ceil(totalDataLength / perPageData);
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentRequests = requests.slice(indexOfFirst, indexOfLast);

  // Fetch Status Master
  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      if (res.data?.status === 200) {
        const options = res.data.data.map((s) => ({
          value: s.statusId,
          label: s.statusName,
        }));
        setStatuses(options);
      }
    } catch (err) {
      toast.error("Failed to fetch statuses");
      console.error(err);
    }
  };

  // 🔹 Dynamically get Status Name + Color
  const getStatusInfo = (statusId) => {
    const statusObj = statuses.find((s) => s.value === statusId);

    // If status is found, use its label from the API
    const name = statusObj?.label || "Unknown";

    // Set colors dynamically based on keywords in status name
    let color = "bg-gray-200 text-gray-700"; // default

    if (/pending/i.test(name)) color = "bg-yellow-100 text-yellow-700";
    else if (/approve/i.test(name)) color = "bg-green-100 text-green-700";
    else if (/reject/i.test(name)) color = "bg-red-100 text-red-700";
    else if (/process/i.test(name)) color = "bg-blue-100 text-blue-700";
    else if (/paid/i.test(name)) color = "bg-green-100 text-green-800";
    else if (/partial/i.test(name)) color = "bg-purple-100 text-purple-700";

    return { name, color };
  };

  const fetchApprovers = async () => {
    try {
      const res = await axiosInstance.get("/EmployeeRoleMapping/approvers/all");
      if (res.status === 200) {
        const mapping = {};
        res.data.forEach((rule) => {
          if (rule.requestType === "onDuty") {
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

  const fetchOnDuty = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/OnDuty");
      if (res.data?.status === 200) {
        // 🔹 Filter only records for logged-in user
        const filtered = res.data.data.filter(
          (item) => item.appliedByInt === userId
        );
        setRequests(filtered || []);
        console.log(filtered);
      }
    } catch (err) {
      toast.error("Failed to fetch Out Duty requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnDuty();
    fetchStatuses();
    fetchApprovers();
  }, []);

  // 🔹 Handle pagination click
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="font-semibold text-lg sm:text-xl text-gray-800 text-center sm:text-left">
          Employee On Duty
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary text-sm flex items-center justify-center cursor-pointer gap-2 w-full sm:w-auto"
        >
          <FaPlus /> <span className="hidden sm:inline">Apply Out Duty</span>
          <span className="sm:hidden">Apply</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-xs text-center table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="border-b">
              <th className="px-2 sm:px-4 py-3">S.No</th>
              <th className="px-2 sm:px-4 py-3">In Date & Time</th>
              <th className="px-2 sm:px-4 py-3">Out Date & Time</th>
              <th className="px-2 sm:px-4 py-3">Reason</th>
              <th className="px-2 sm:px-4 py-3">Time(hrs)</th>
              <th className="px-2 sm:px-4 py-3">Applied On</th>
              <th className="px-2 sm:px-4 py-3">Status</th>
              <th className="px-2 sm:px-4 py-3">Approvers</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : currentRequests.length > 0 ? (
              currentRequests.map((req, index) => (
                <tr
                  key={req.onDutyID || index}
                  className="border-t hover:bg-gray-50 transition-all duration-150"
                >
                  {/* Index */}
                  <td className="px-2 sm:px-4 py-3">
                    {indexOfFirst + index + 1}
                  </td>

                  {/* In Date */}
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    {format(new Date(req.inDateTime), "dd MMM yyyy HH:mm a")}
                  </td>

                  {/* Out Date */}
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    {format(new Date(req.outDateTime), "dd MMM yyyy HH:mm a")}
                  </td>

                  {/* Reason */}
                  <td className="px-2 sm:px-4 py-3">{req.reason}</td>

                  {/* Total Time (hrs) */}
                  <td className="px-2 sm:px-4 py-3">
                    {(req.totalTime / 60).toFixed(1)} hrs
                  </td>

                  {/* Applied On */}
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    {req.appliedAt
                      ? format(new Date(req.appliedAt), "dd MMM yyyy HH:mm a")
                      : "-"}
                  </td>

                  {/* Status */}
                  <td className="px-2 sm:px-4 py-3">
                    {(() => {
                      const { name, color } = getStatusInfo(req.statusId);
                      return (
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${color}`}
                        >
                          {name}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Approvers */}
                  <td className="px-2 sm:px-4 py-3">
                    {req.approvers && req.approvers.length > 0
                      ? req.approvers
                          .map((id) => approverMapping?.onDuty?.[id] || "N/A")
                          .join(", ")
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-4 text-gray-500 text-sm"
                >
                  No out duty requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 🔹 Pagination Component */}
      {requests.length > 0 && (
        <div className="p-4 pt-0 flex gap-4 justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={paginate}
            perPageData={perPageData}
            setPerPageData={setPerPageData}
            filteredData={requests}
            totalDataLength={totalDataLength}
          />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <OutDutyFormModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchOnDuty}
          statuses={statuses}
        />
      )}
    </div>
  );
};

export default EmpOutDuty;
