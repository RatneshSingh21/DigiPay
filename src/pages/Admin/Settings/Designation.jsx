import { useEffect, useState } from "react";
import AddDesignationForm from "../Designation/AddDesignationForm";
import ImportDesignations from "../Designation/ImportDesignations";
import assets from "../../../assets/assets";
import { FiDownload } from "react-icons/fi";
import DesignationList from "../Designation/DesignationList";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const Designation = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedDesignation(null);
  };

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  const fetchDesignations = async () => {
    try {
      const response = await axiosInstance.get("/Designation");
      setDesignations(response.data || []);
    } catch (error) {
      console.error("Error fetching designations:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load designations"
      );
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  return (
    <>
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Designations</h2>
        {designations.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedDesignation(null);
                openModal();
              }}
            >
              Add Designation
            </button>
            <button
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              onClick={openImport}
            >
              <FiDownload />
              Import
            </button>
          </div>
        )}
      </div>

      {designations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <img
            src={assets.DesignationIllustration}
            alt="Designation Illustration"
            className="w-64 h-auto mb-6"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
            Track employee job titles with designations
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Create designations based on the roles within your organization and
            associate them with employees.
          </p>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedDesignation(null);
                openModal();
              }}
            >
              + New Designation
            </button>
            <button
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              onClick={openImport}
            >
              <FiDownload />
              Import
            </button>
          </div>
        </div>
      ) : (
        <DesignationList
          designations={designations}
          fetchDesignations={fetchDesignations}
          setIsEdit={setIsEdit}
          setSelectedDesignation={setSelectedDesignation}
          openModal={openModal}
        />
      )}

      {/* Show Modal */}
      {showAddModal && (
        <AddDesignationForm
          onClose={closeModal}
          isEdit={isEdit}
          initialData={selectedDesignation}
          onSuccess={fetchDesignations}
        />
      )}

      {showImportModal && (
        <ImportDesignations
          onClose={closeImport}
          fetchDesignations={fetchDesignations}
        />
      )}
    </>
  );
};

export default Designation;
