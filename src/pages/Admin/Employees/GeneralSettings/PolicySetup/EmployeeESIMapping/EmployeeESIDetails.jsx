import React, { useEffect, useState } from "react";
import { getEmployeeESIDetails } from "../../../../../../services/esiService";
import Spinner from "../../../../../../components/Spinner";
import EmployeeESIDetailForm from "./EmployeeESIDetailForm";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import { FiEdit } from "react-icons/fi";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";

const EmployeeESIDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [employeeMap, setEmployeeMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEmployeeESIDetails();
      if (res.data?.data) setData(res.data.data);

      const mappingData = res.data.data || [];
      mappingData.forEach((m) => fetchEmployeeName(m.employeeId));
    } catch (err) {
      console.error("Failed to fetch Employee ESI details", err);
      toast.error(
        err?.response?.data?.message || "Failed to fetch Employee ESI details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeName = async (id) => {
    if (employeeMap[id]) return;
    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res.data?.response || res.data;
      if (emp) {
        setEmployeeMap((prev) => ({
          ...prev,
          [id]: `${emp.fullName} (${emp.employeeCode})`,
        }));
      }
    } catch (err) {
      console.log("Failed to fetch employee", err);
      setEmployeeMap((prev) => ({
        ...prev,
        [id]: `Emp-${id}`,
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "-";

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setModalOpen(true);
  };

  // Filtered data based on employee name/code
  const filteredData = data.filter((item) => {
    const empNameCode = employeeMap[item.employeeId] || "";
    return empNameCode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center p-2 shadow rounded-md gap-2 md:gap-0">
        <h2 className="text-sm font-bold text-gray-800">
          Employee ESI Details
        </h2>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by employee name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="bg-primary cursor-pointer hover:bg-secondary text-white text-sm px-4 py-2 rounded flex items-center gap-2 font-medium transition"
          >
            <Plus size={16} /> Add Employee ESI
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 border">ESI ID</th>
              <th className="px-3 py-2 border">Employee</th>
              <th className="px-3 py-2 border">ESI Number</th>
              <th className="px-3 py-2 border">Applicable</th>
              <th className="px-3 py-2 border">Coverage Start</th>
              <th className="px-3 py-2 border">Coverage End</th>
              <th className="px-3 py-2 border">Created At</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-gray-500 py-4 border"
                >
                  No ESI details found
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.employeeESIId}>
                  <td className="px-3 py-2 border">{item.employeeESIId}</td>
                  <td className="px-3 py-2 border">
                    {employeeMap[item.employeeId] || `ID: ${item.employeeId}`}
                  </td>
                  <td className="px-3 py-2 border">{item.esiNumber}</td>
                  <td className="px-3 py-2 border">
                    {item.isApplicable ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 border">
                    {formatDate(item.coverageStartDate)}
                  </td>
                  <td className="px-3 py-2 border">
                    {formatDate(item.coverageEndDate)}
                  </td>
                  <td className="px-3 py-2 border">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-3 py-2 border">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center cursor-pointer gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      <FiEdit size={14} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <EmployeeESIDetailForm
          editData={editData}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default EmployeeESIDetails;
