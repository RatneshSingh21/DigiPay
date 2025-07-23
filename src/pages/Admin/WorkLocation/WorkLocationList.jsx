import React, { useEffect, useState } from "react";
import { FiEdit2, FiDownload } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const WorkLocationList = ({
  locations = [],
  fetchLocations,
  setIsEdit,
  setSelectedLocation,
  openModal,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-wrapper")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;

    try {
      await axiosInstance.delete(`/WorkLocation/${id}`);
      toast.success("Work location deleted successfully");
      fetchLocations(); 
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error(error?.response?.data?.message || "Failed to delete work location");
    }
  };

  const handleMarkInactive = (id) => {
    toast.info(`Mark Inactive functionality to be implemented for ID: ${id}`);
  };

  return (
    <div className="bg-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.length === 0 ? (
          <p className="text-gray-500">No locations found.</p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-xl shadow-md p-6 relative"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">
                  {location.name}
                </h2>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <FiEdit2
                      size={16}
                      onClick={() => {
                        setIsEdit("Edit");
                        setSelectedLocation(location);
                        openModal();
                      }}
                    />
                  </button>
                  <div className="dropdown-wrapper relative">
                    <button
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === location.id ? null : location.id
                        )
                      }
                    >
                      <BsThreeDots size={16} />
                    </button>

                    {activeDropdown === location.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                        <button
                          onClick={() => handleDelete(location.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleMarkInactive(location.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        >
                          Mark as Inactive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-gray-700">{location.addressLine1}</p>
              <p className="text-gray-700">
                {location.city}, {location.state} {location.pinCode}
              </p>

              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <FaUsers /> 0 Employees
                </div>
                <span className="bg-teal-600 text-white text-xs px-3 py-1 rounded-md shadow-sm">
                  FILING ADDRESS
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkLocationList;
