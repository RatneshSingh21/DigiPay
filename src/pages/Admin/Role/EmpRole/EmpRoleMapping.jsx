import React, { useEffect, useState } from "react";
import AddEmpRoleMappingModal from "./AddEmpRoleMappingModal";
import { FaPlus } from "react-icons/fa";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const EmpRoleMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Employee Role Mapping</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center cursor-pointer gap-2 text-xs bg-primary text-white px-3 py-2 rounded-lg hover:bg-secondary transition"
        >
          <FaPlus /> Add Mapping
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : mappings.length === 0 ? (
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
                {mappings.map((map, idx) => (
                  <tr
                    key={map.employeeRoleMappingId}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="p-2">{map.employeeId}</td>
                    <td className="p-2">{map.employeeName}</td>
                    <td className="p-2 font-medium">{map.roleName}</td>
                    <td className="p-2">
                      {new Date(map.assignedAt).toLocaleString()}
                    </td>
                    <td className="p-2">{map.assignedBy}</td>
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
