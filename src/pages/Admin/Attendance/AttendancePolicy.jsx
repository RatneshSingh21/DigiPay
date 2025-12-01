import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AttendancePolicyForm from "./AttendancePolicyForm";
import { FiEdit2, FiPlus } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Pagination from "../../../components/Pagination";

const AttendancePolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(3);

  const fetchPolicies = async () => {
    try {
      const res = await axiosInstance.get("/AttendancePolicy/GetAll");
      setPolicies(res.data.data || []);
      setFilteredData(res.data.data || []);
    } catch (err) {
      // toast.error(err?.response?.data?.message || "Failed to fetch policies");
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
    <>
      {/* Header */}
      <div className="px-4 py-3 shadow sticky top-14 bg-white flex items-center justify-between z-10">
        <h2 className="font-semibold text-xl">Attendance Policies</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex cursor-pointer text-sm items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto shadow rounded-lg px-3">
        <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredData.length > 0 ? (
            currentData.map((policy) => (
              <div
                key={policy.attendancePolicyId}
                className="border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-center mb-2 gap-2">
                  <h3 className="font-semibold text-sm">{policy.policyName}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      policy.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {policy.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => {
                      setEditData(policy);
                      setShowModal(true);
                    }}
                    className="flex items-center text-xs cursor-pointer gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600  font-medium rounded-md transition duration-200"
                    title="Edit"
                  >
                    <FiEdit2 size={10} />
                    Edit
                  </button>
                </div>
                <hr className="border-t my-2" />

                <p className="text-xs text-gray-600 mb-2">
                  {policy.description}
                </p>

                <div className="text-xs space-y-1">
                  <div>
                    <strong>Effective:</strong>{" "}
                    {policy.effectiveFrom
                      ? new Date(policy.effectiveFrom).toLocaleDateString(
                          "en-GB"
                        )
                      : "-"}{" "}
                    →{" "}
                    {policy.effectiveTo
                      ? new Date(policy.effectiveTo).toLocaleDateString("en-GB")
                      : "-"}
                  </div>
                  <div>
                    <strong>Full Day Hours:</strong> {policy.fullDayHours}
                  </div>
                  <div>
                    <strong>Half Day Hours:</strong> {policy.halfDayHours}
                  </div>
                  <div>
                    <strong>Shifts Ids:</strong> {policy.shiftIds.join(", ")}
                  </div>
                  <div>
                    <strong>Work Types Ids:</strong>{" "}
                    {policy.workTypeIds.join(", ")}
                  </div>
                  <div>
                    <strong>Departments Ids:</strong>{" "}
                    {policy.departmentIds.join(", ")}
                  </div>
                  <div>
                    <strong>Locations Ids:</strong>{" "}
                    {policy.locationIds.join(", ")}
                  </div>
                  <div>
                    <strong>Late Policy Ids:</strong>{" "}
                    {policy.latePolicyIds.join(", ")}
                  </div>
                  <div>
                    <strong>OT Policy Ids:</strong>{" "}
                    {policy.otPolicyIds.join(", ") || "-"}
                  </div>
                  <div>
                    <strong>Holidays Ids:</strong>{" "}
                    {policy.holidayListIds.join(", ")}
                  </div>
                  <div>
                    <strong>Leave Types Ids:</strong>{" "}
                    {policy.leaveTypeIds.join(", ")}
                  </div>
                  <div>
                    <strong>Created By:</strong> {policy.createdBy}
                  </div>
                  <div>
                    <strong>Created On:</strong>{" "}
                    {policy.createdOn
                      ? new Date(policy.createdOn).toLocaleDateString("en-GB")
                      : "-"}
                  </div>
                  <div>
                    <strong>Updated On:</strong>{" "}
                    {policy.updatedOn
                      ? new Date(policy.updatedOn).toLocaleDateString("en-GB")
                      : "-"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-6 text-sm">
              No policies found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex justify-end py-2">
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
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
          onSuccess={fetchPolicies}
          initialData={editData}
        />
      )}
    </>
  );
};

export default AttendancePolicyList;
