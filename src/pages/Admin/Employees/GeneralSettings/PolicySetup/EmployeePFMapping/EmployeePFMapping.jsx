import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit, X } from "lucide-react";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";
import EmployeePFMappingForm from "./EmployeePFMappingForm";
import { FiEdit } from "react-icons/fi";

const EmployeePFMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeMap, setEmployeeMap] = useState({});

  const fetchMappings = async () => {
    try {
      const res = await axiosInstance.get("/PFEmployeeMapping");
      const mappingData = res.data.response || [];
      setMappings(mappingData);

      // For each mapping, fetch employee name (like PFTransaction)
      mappingData.forEach((m) => fetchEmployeeName(m.employeeId));
    } catch (err) {
      toast.error("Error fetching mappings");
      console.error(err);
    }
  };

  // Fetch Employee by Id and cache (same as PFTransaction)
  const fetchEmployeeName = async (id) => {
    if (employeeMap[id]) return;
    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res.data?.response || res.data; // some APIs return .response
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
    fetchMappings();
  }, []);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="sticky top-14 bg-white z-10 flex justify-between items-center p-2 shadow rounded-md">
        <h2 className="text-sm font-bold text-gray-800">PF Employee Mapping</h2>
        <button
          onClick={() => {
            setSelectedMapping(null);
            setIsModalOpen(true);
          }}
          className="bg-primary cursor-pointer hover:bg-secondary text-white text-sm px-4 py-2 rounded flex items-center gap-2 font-medium transition"
        >
          <Plus size={16} /> Add Mapping
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full text-sm text-center border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 border">Employee</th>
              <th className="px-3 py-2 border">PF Number</th>
              <th className="px-3 py-2 border">PF Setting Id</th>
              <th className="px-3 py-2 border">Override %</th>
              <th className="px-3 py-2 border">Override Fixed</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.length > 0 ? (
              mappings.map((m) => (
                <tr
                  key={m.pfEmployeeMappingId}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-3 py-2 border">
                    {employeeMap[m.employeeId] || `ID: ${m.employeeId}`}
                  </td>
                  <td className="px-3 py-2 border">{m.pfNumber}</td>
                  <td className="px-3 py-2 border">{m.pfSettingsId}</td>
                  <td className="px-3 py-2 border">
                    {m.overridePercentage || "-"}
                  </td>
                  <td className="px-3 py-2 border">
                    {m.overrideFixedAmount || "-"}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    <button
                      className="inline-flex items-center cursor-pointer gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      onClick={() => {
                        setSelectedMapping(m);
                        setIsModalOpen(true);
                      }}
                    >
                      <FiEdit size={14} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-gray-500 font-medium"
                >
                  No mappings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-4 md:p-6 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedMapping ? "Edit Mapping" : "Add Mapping"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 cursor-pointer hover:text-red-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <EmployeePFMappingForm
              initialData={selectedMapping}
              onClose={() => setIsModalOpen(false)}
              refreshList={fetchMappings}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePFMapping;
