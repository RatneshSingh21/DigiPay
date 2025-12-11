import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Pagination from "../../../components/Pagination";
import useAuthStore from "../../../store/authStore";
import OutDutyFormModal from "../EmpOutDuty/OutDutyFormModal";
import GatePassCard from "../EmpOutDuty/GatePassCard";

const EmpOutDuty = () => {
  const [requests, setRequests] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approverMapping, setApproverMapping] = useState({});
  const userId = useAuthStore((state) => state.user?.userId);
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const companyId = useAuthStore((state) => state.companyId);
  const [employees, setEmployees] = useState([]);

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

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get(
        `/user-auth/getEmployee/companyId/${companyId}`
      );
      if (res.data?.status === 200) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.log("Failed to fetch employees", err);
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
    fetchEmployees(); // ⬅ important
  }, []);

  // 🔹 Handle pagination click
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="font-semibold text-lg sm:text-xl text-gray-800 text-center sm:text-left">
          Employee On Duty/Gate Pass
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary text-sm flex items-center justify-center cursor-pointer gap-2 w-full sm:w-auto"
        >
          <FaPlus /> <span className="hidden sm:inline">Apply Out Duty</span>
          <span className="sm:hidden">Apply</span>
        </button>
      </div>

      {/* Table (Updated to Salary UI Style) */}
      <div
        className="mt-4 mx-4 p-4 border
        overflow-x-scroll border-gray-200 rounded-lg max-h-[70vh] bg-white shadow"
      >
        <table className="min-w-full divide-y divide-gray-200 text-xs text-center">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2 border-r border-gray-200">S.No</th>
              <th className="p-2 border-r border-gray-200">In Date & Time</th>
              <th className="p-2 border-r border-gray-200">Out Date & Time</th>
              <th className="p-2 border-r border-gray-200">Reason</th>
              <th className="p-2 border-r border-gray-200">Time (hrs)</th>
              <th className="p-2 border-r border-gray-200">Applied On</th>
              <th className="p-2 border-r border-gray-200">Status</th>
              <th className="p-2 border-r border-gray-200">Approvers</th>
              <th className="p-2 border-r border-gray-200">Gate Pass</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : currentRequests.length > 0 ? (
              currentRequests.map((req, index) => (
                <tr
                  key={req.onDutyID || index}
                  className={`hover:bg-gray-50 transition-all ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-2 border-r border-gray-200">
                    {indexOfFirst + index + 1}
                  </td>

                  <td className="p-2 border-r border-gray-200 whitespace-nowrap">
                    {format(new Date(req.inDateTime), "dd MMM yyyy HH:mm a")}
                  </td>

                  <td className="p-2 border-r border-gray-200 whitespace-nowrap">
                    {format(new Date(req.outDateTime), "dd MMM yyyy HH:mm a")}
                  </td>

                  <td className="p-2 border-r border-gray-200">{req.reason}</td>

                  <td className="p-2 border-r border-gray-200">
                    {(req.totalTime / 60).toFixed(1)} hrs
                  </td>

                  <td className="p-2 border-r border-gray-200 whitespace-nowrap">
                    {req.appliedAt
                      ? format(new Date(req.appliedAt), "dd MMM yyyy HH:mm a")
                      : "-"}
                  </td>

                  <td className="p-2 border-r border-gray-200">
                    {(() => {
                      const { name, color } = getStatusInfo(req.statusId);
                      return (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}
                        >
                          {name}
                        </span>
                      );
                    })()}
                  </td>

                  <td className="p-2 border-r border-gray-200">
                    {req.approvers?.length
                      ? req.approvers
                          .map((id) => approverMapping?.onDuty?.[id] || "N/A")
                          .join(", ")
                      : "N/A"}
                  </td>

                  <td className="p-2 border-r border-gray-200">
                    {getStatusInfo(req.statusId)
                      .name.toLowerCase()
                      .includes("approve") ? (
                      <button
                        onClick={() => {
                          const emp = employees.find(
                            (e) => e.id === req.appliedByInt
                          );
                          setSelectedGatePass({ ...req, employee: emp });
                        }}
                        className="px-3 py-1 bg-primary hover:bg-secondary cursor-pointer text-white rounded-md"
                      >
                        Print Gate Pass
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
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

      {selectedGatePass && (
        <GatePassCard
          data={selectedGatePass}
          approverMapping={approverMapping}
          onClose={() => setSelectedGatePass(null)}
        />
      )}
    </div>
  );
};

export default EmpOutDuty;
