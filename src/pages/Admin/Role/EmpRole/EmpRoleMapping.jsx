import React, { useEffect, useState } from "react";
import AddEmpRoleMappingModal from "./AddEmpRoleMappingModal";
import { FaPlus } from "react-icons/fa";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const EmpRoleMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Employee Role Mappings
  const fetchMappings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/EmployeeRoleMapping");
      setMappings(response.data);
    } catch (error) {
      console.error("Error fetching role mappings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  // Filter mappings based on search query
  const filteredMappings = mappings.filter(
    (map) =>
      map.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      map.employeeId.toString().includes(searchQuery.toLowerCase()) ||
      map.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Highlight matched text
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        <h2 className="font-semibold text-xl">Employee Role Mapping</h2>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by Employee, ID, or Role"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center cursor-pointer gap-2 text-xs bg-primary text-white px-3 py-2 rounded-lg hover:bg-secondary transition"
          >
            <FaPlus /> Add Mapping
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : filteredMappings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No employee role mappings found.
          </div>
        ) : (
          <div className="overflow-x-auto shadow">
            <table className="min-w-full divide-y text-xs text-center divide-gray-200">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2">Employee ID</th>
                  <th className="p-2">Employee Name</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Assigned At</th>
                  <th className="p-2">Assigned By</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((map, idx) => (
                  <tr
                    key={map.employeeRoleMappingId}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="p-2">{highlightText(map.employeeId)}</td>
                    <td className="p-2">{highlightText(map.employeeName)}</td>
                    <td className="p-2 font-medium">{highlightText(map.roleName)}</td>
                    <td className="p-2">
                      {new Date(map.assignedAt).toLocaleString()}
                    </td>
                    <td className="p-2">{highlightText(map.assignedBy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <AddEmpRoleMappingModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchMappings}
        />
      )}
    </div>
  );
};

export default EmpRoleMapping;
