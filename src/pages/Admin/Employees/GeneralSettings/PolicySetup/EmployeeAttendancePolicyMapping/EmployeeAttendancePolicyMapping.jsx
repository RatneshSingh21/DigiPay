import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import Spinner from "../../../../../../components/Spinner";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";
import EmployeeAttendancePolicyForm from "./EmployeeAttendancePolicyForm";

const EmployeeAttendancePolicyMapping = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "/AttendancePolicy/GetEmployeePolicyList"
      );
      setData(res.data.data || []);
      console.log(res.data.data);
      
    } catch (err) {
      console.error("Failed to fetch data", err);
      // toast.error(err?.response?.data?.message ||"Failed to fetch employee-policy mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered data based on search query
  const filteredData = data.filter(
    (item) =>
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.policyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center p-2 shadow rounded-md gap-2 md:gap-0">
        <h2 className="text-sm font-bold text-gray-800">
          Employee Attendance Policy Mapping
        </h2>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by employee or policy name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {/* Add Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="bg-primary cursor-pointer hover:bg-secondary text-white text-sm px-4 py-2 rounded flex items-center gap-2 font-medium transition"
          >
            <Plus size={16} /> Assign Policy
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-center">
            <tr>
              <th className="px-3 py-2 border">S.No</th>
              <th className="px-3 py-2 border">Employee Name</th>
              <th className="px-3 py-2 border">Policy Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center text-gray-500 py-4 border"
                >
                  No mappings found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 border text-center">{index + 1}</td>
                  <td className="px-3 py-2 border text-center">{item.employeeName}</td>
                  <td className="px-3 py-2 border text-center">{item.policyName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <EmployeeAttendancePolicyForm
          onClose={() => setModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default EmployeeAttendancePolicyMapping;
