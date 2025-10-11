import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AttendancePolicyForm from "./AttendancePolicyForm";
import { FiPlus } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Pagination from "../../../components/Pagination";

const AttendancePolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(10);

  const fetchPolicies = async () => {
    try {
      const res = await axiosInstance.get("/AttendancePolicy/GetAll");
      setPolicies(res.data.data || []);
      setFilteredData(res.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch policies");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Pagination calculations
  const totalDataLength = filteredData.length;
  const totalPages = Math.ceil(totalDataLength / perPageData);
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Attendance Policies</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex cursor-pointer text-sm items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {/* Table Wrapper (scrollable) */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
          <table className="min-w-full text-xs divide-y text-center divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2">Policy Name</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Effective From</th>
                <th className="px-3 py-2">Effective To</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((policy) => (
                  <tr
                    key={policy.attendancePolicyId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">{policy.policyName}</td>
                    <td className="px-3 py-2">{policy.description}</td>
                    <td className="px-3 py-2">
                      {policy.effectiveFrom?.split("T")[0]}
                    </td>
                    <td className="px-3 py-2">
                      {policy.effectiveTo?.split("T")[0]}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {policy.isActive ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No policies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex justify-end pr-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              perPageData={perPageData}
              setPerPageData={setPerPageData}
              filteredData={filteredData}
              totalDataLength={totalDataLength}
            />
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <AttendancePolicyForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchPolicies}
        />
      )}
    </div>
  );
};

export default AttendancePolicyList;
