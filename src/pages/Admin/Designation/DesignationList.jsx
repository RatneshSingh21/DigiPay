import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const DesignationList = ({
  designations = [],
  fetchDesignations,
  setIsEdit,
  setSelectedDesignation,
  openModal,
}) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this designation?"))
      return;

    try {
      await axiosInstance.delete(`/Designation/${id}`);
      toast.success("Designation deleted successfully");
      fetchDesignations();
    } catch (error) {
      console.error("Error deleting designation:", error);
      toast.error(error?.response?.data?.message || "Failed to delete designation");
    }
  };

  return (
    <div className="bg-white p-6">
      {designations.length === 0 ? (
        <p className="text-gray-500 text-sm">No designation found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Designation Name</th>
                <th className="px-6 py-3 text-left">Level</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {designations.map((desig, index) => (
                <tr
                  key={desig.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{desig.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {desig.level || "No Level"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setIsEdit("Edit");
                          setSelectedDesignation(desig);
                          openModal();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium rounded-md transition duration-200"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(desig.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium rounded-md transition duration-200"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DesignationList;
