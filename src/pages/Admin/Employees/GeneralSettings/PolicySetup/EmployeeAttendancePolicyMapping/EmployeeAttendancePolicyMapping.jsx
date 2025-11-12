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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "/AttendancePolicy/GetEmployeePolicyList"
      );
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch data", err);                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
      toast.error("Failed to fetch employee-policy mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="sticky top-14 bg-white z-10 flex justify-between items-center p-2 shadow rounded-md">
        <h2 className="text-sm font-bold text-gray-800">
          Employee Attendance Policy Mapping
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-primary cursor-pointer hover:bg-secondary text-white text-sm px-4 py-2 rounded flex items-center gap-2 font-medium transition"
        >
          <Plus size={16} /> Assign Policy
        </button> 
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
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center text-gray-500 py-4 border"
                >
                  No mappings found
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
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
