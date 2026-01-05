import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import assets from "../../../../assets/assets";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import LeaveList from "./LeaveList";
import AddLeaveForm from "./AddLeaveForm";
import ImportLeave from "../ImportLeave";

const Leave = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedLeave, setSelectedLeave] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedLeave(null);
  };

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  const fetchLeaves = async () => {
    try {
      const response = await axiosInstance.get("/LeaveType");
      setLeaves(response.data || []);
    } catch (error) {
      console.error("Error fetching Leave:", error);
      // toast.error(error?.response?.data?.message || "Failed to load Leave Types");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <>
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Leaves</h2>
        {leaves.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg font-medium cursor-pointer"
              onClick={() => {
                setIsEdit("Add");
                setSelectedLeave(null);
                openModal();
              }}
            >
              Add Leaves
            </button>
            {/* <button
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={openImport}
            >
              <FiDownload />
              Import
            </button> */}
          </div>
        )}
      </div>

      {leaves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <img
            src={assets.LeaveIllustration}
            alt="Leave Illustration"
            className="w-64 h-auto mb-6"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
            Track employee leaves with ease
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Create leave types based on the roles within your organization and
            associate them with employees.
          </p>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-secondary cursor-pointer text-white px-6 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedLeave(null);
                openModal();
              }}
            >
              + New Leaves
            </button>
            {/* <button
              className="border border-gray-300 cursor-pointer text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              onClick={openImport}
            >
              <FiDownload />
              Import
            </button> */}
          </div>
        </div>
      ) : (
        <LeaveList
          leaves={leaves}
          fetchLeaves={fetchLeaves}
          setIsEdit={setIsEdit}
          setSelectedLeave={setSelectedLeave}
          openModal={openModal}
        />
      )}

      {/* Show Modal */}
      {showAddModal && (
        <AddLeaveForm
          onClose={closeModal}
          isEdit={isEdit}
          initialData={selectedLeave}
          onSuccess={fetchLeaves}
        />
      )}

      {showImportModal && (
        <ImportLeave onClose={closeImport} fetchLeaves={fetchLeaves} />
      )}
    </>
  );
};

export default Leave;
