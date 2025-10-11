import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaUsers, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../components/ConfirmModal";

const WorkLocationList = ({
  locations = [],
  fetchLocations,
  setIsEdit,
  setSelectedLocation,
  openModal,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [employeeCounts, setEmployeeCounts] = useState({}); // { locationId: count }

  // ✅ Fetch employees and calculate how many are in each work location
  const fetchEmployeeCounts = async () => {
    try {
      const response = await axiosInstance.get("/Employee");
      const employees = response.data || [];

      // Count how many employees are in each workLocationId
      const counts = employees.reduce((acc, emp) => {
        if (emp.workLocationId) {
          acc[emp.workLocationId] = (acc[emp.workLocationId] || 0) + 1;
        }
        return acc;
      }, {});

      setEmployeeCounts(counts);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  useEffect(() => {
    fetchEmployeeCounts();
  }, [locations]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/WorkLocation/${id}`);
      toast.success("Work location deleted successfully");
      fetchLocations();
      fetchEmployeeCounts(); // Refresh after deletion
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete work location"
      );
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="bg-white p-6 pt-0 rounded-lg">
      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <FaBuilding size={48} className="text-gray-400 mb-4" />
          <p className="text-lg font-medium">No locations found</p>
          <button
            onClick={openModal}
            className="mt-4 bg-teal-600 cursor-pointer text-white px-4 py-2 rounded-md shadow hover:bg-teal-700 transition"
          >
            + Add New Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white border-t-4 border-teal-500 cursor-pointer rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200 p-6 flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <FaBuilding className="text-teal-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {location.name}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Work Location</p>
                </div>

                <div className="flex gap-2 items-center">
                  {/* Edit */}
                  <button
                    className="p-2 cursor-pointer bg-gray-100 rounded-full hover:bg-teal-100 transition"
                    onClick={() => {
                      setIsEdit("Edit");
                      setSelectedLocation(location);
                      openModal();
                    }}
                    title="Edit Location"
                  >
                    <FiEdit2 size={16} className="text-teal-700" />
                  </button>

                  {/* Delete */}
                  <button
                    className="p-2 cursor-pointer bg-gray-100 rounded-full hover:bg-red-100 transition"
                    onClick={() => setConfirmDeleteId(location.id)}
                    title="Delete Location"
                  >
                    <FiTrash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="mt-4 text-gray-700 text-sm">
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-teal-500" />
                  <span>{location.addressLine1}</span>
                </p>
                <p className="ml-6">
                  {location.city}, {location.state} {location.pinCode}
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <FaUsers className="text-gray-500" />
                  <span>
                    {employeeCounts[location.id] || 0}{" "}
                    {employeeCounts[location.id] === 1
                      ? "Employee"
                      : "Employees"}
                  </span>
                </div>
                <span className="bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  Filing Address
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Work Location"
          message="Are you sure you want to delete this work location? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default WorkLocationList;
