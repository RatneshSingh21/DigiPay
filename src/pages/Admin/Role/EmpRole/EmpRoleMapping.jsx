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
          className="flex items-center gap-2 text-sm bg-primary text-white px-3 py-2 rounded-lg hover:bg-secondary transition"
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
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-center border-collapse">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="border p-2">Employee ID</th>
                  <th className="border p-2">Employee Name</th>
                  <th className="border p-2">Role</th>
                  <th className="border p-2">Assigned At</th>
                  <th className="border p-2">Assigned By</th>
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
                    <td className="border p-2">{map.employeeId}</td>
                    <td className="border p-2">{map.employeeName}</td>
                    <td className="border p-2 font-medium">{map.roleName}</td>
                    <td className="border p-2">
                      {new Date(map.assignedAt).toLocaleString()}
                    </td>
                    <td className="border p-2">{map.assignedBy}</td>
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
