import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Spinner from "../../../../../../components/Spinner";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";
import EmployeeLeavePolicyMappingForm from "./EmployeeLeavePolicyMappingForm";

const EmployeeLeavePolicyMapping = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);

    try {
      // 1️⃣ Fetch allocations
      const allocationRes = await axiosInstance.get(
        "/EmployeeLeavePolicyAllocation"
      );

      const allocations = allocationRes.data?.data || [];

      if (!allocations.length) {
        setData([]);
        return;
      }

      // 2️⃣ Fetch all leave policies
      const policyRes = await axiosInstance.get("/LeavePolicy/all");
      const policies = policyRes.data?.data || [];

      // 3️⃣ Fetch employees in parallel
      const employeePromises = allocations.map((a) =>
        axiosInstance.get(`/Employee/${a.employeeId}`)
      );

      const employeeResponses = await Promise.all(employeePromises);

      // 4️⃣ Build lookup maps
      const employeeMap = {};
      employeeResponses.forEach((res) => {
        const emp = res.data?.data;
        if (emp) {
          employeeMap[emp.id] = `${emp.fullName} (${emp.employeeCode})`;
        }
      });

      const policyMap = {};
      policies.forEach((p) => {
        policyMap[p.leavePolicyId] = p.policyName;
      });

      // 5️⃣ Final UI data
      const formattedData = allocations.map((a) => ({
        allocationId: a.allocationId,
        employeeName: employeeMap[a.employeeId] || "—",
        policyName: policyMap[a.leavePolicyId] || "—",
      }));

      setData(formattedData);
    } catch (err) {
      console.error("Failed to fetch leave policy allocations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= SEARCH ================= */
  const filteredData = data.filter(
    (item) =>
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.policyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center p-2 shadow rounded-md gap-2">
        <h2 className="text-sm font-bold text-gray-800">
          Employee Leave Policy Mapping
        </h2>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by employee or policy name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <button
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-secondary cursor-pointer text-white text-sm px-4 py-2 rounded flex items-center gap-2 font-medium"
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
              <th className="px-3 py-2 border">Employee</th>
              <th className="px-3 py-2 border">Leave Policy</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-4 text-gray-500 border"
                >
                  No mappings found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.allocationId}>
                  <td className="px-3 py-2 border text-center">{index + 1}</td>
                  <td className="px-3 py-2 border text-center">
                    {item.employeeName}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    {item.policyName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <EmployeeLeavePolicyMappingForm
          onClose={() => setModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default EmployeeLeavePolicyMapping;
