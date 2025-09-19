import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import AddDepartmentForm from "../Department/AddDepartmentForm";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";
import DepartmentList from "../Department/DepartmentList";
import ImportDepartments from "../Department/ImportDepartments";

const Departments = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedDepartment(null);
  };

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get("/Department");
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error(error?.response?.data?.message || "Failed to load work locations");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <>
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Departments</h2>
        {departments.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedDepartment(null);
                openModal();
              }}
            >
              Add Department
            </button>
            <button
              className="border border-gray-300 cursor-pointer text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              onClick={openImport}
            >
              <FiDownload />
              Import
            </button>
          </div>
        )}
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <img
            src={assets.DepartmentIllustration}
            alt="Department"
            className="w-64 h-auto mb-6"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Enhance organisation structure with new departments
          </h2>
          <p className="text-gray-600 max-w-md mb-6">
            Create department based on the once present in the organization and
            associate with employees
          </p>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-secondary cursor-pointer text-white px-6 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedDepartment(null);
                openModal();
              }}
            >
              + New Department
            </button>
            <button
              className="border border-gray-300 cursor-pointer text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              onClick={openImport}
            >
              <FiDownload />
              Import
            </button>
          </div>
        </div>
      ) : (
        <DepartmentList
          departments={departments}
          fetchDepartments={fetchDepartments}
          setIsEdit={setIsEdit}
          setSelectedDepartment={setSelectedDepartment}
          openModal={openModal}
        />
      )}

      {/* Show Modal */}
      {showAddModal && (
        <AddDepartmentForm
          onClose={closeModal}
          isEdit={isEdit}
          initialData={selectedDepartment}
          onSuccess={fetchDepartments}
        />
      )}

      {showImportModal && <ImportDepartments onClose={closeImport} fetchDepartments={fetchDepartments} />}
    </>
  );
};

export default Departments;
