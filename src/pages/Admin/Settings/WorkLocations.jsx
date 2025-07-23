import React, { useEffect, useState } from "react";
import WorkLocationForm from "../WorkLocation/WorkLocationForm";
import WorkLocationList from "../WorkLocation/WorkLocationList";
import assets from "../../../assets/assets";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { FiDownload } from "react-icons/fi";
import ImportWorkLocations from "../WorkLocation/ImportWorkLocations";

const WorkLocations = () => {
  const [showAddModel, setShowAddModel] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const openModal = () => setShowAddModel(true);
  const closeModal = () => {
    setShowAddModel(false);
    setSelectedLocation(null);
  };

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  const fetchLocations = async () => {
    try {
      const response = await axiosInstance.get("/WorkLocation");
      setLocations(response.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error(error?.response?.data?.message || "Failed to load work locations");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <>
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Work Locations</h2>
        {locations.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedLocation(null);
                openModal();
              }}
            >
              Add Work Location
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

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white px-4 py-16 mb-2">
          <img
            src={assets.WorkLocationIllustration}
            alt="Work Location Illustration"
            className="w-64 h-auto mb-6"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
            Track employee job titles with designations
          </h1>
          <p className="text-center text-gray-600 max-w-xl mb-6">
            Create designations based on the roles within your organization and
            associate them with employees.
          </p>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition duration-200"
              onClick={() => {
                setIsEdit("Add");
                setSelectedLocation(null);
                openModal();
              }}
            >
              + Add Work Location
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
        <WorkLocationList
          locations={locations}
          fetchLocations={fetchLocations}
          setIsEdit={setIsEdit}
          setSelectedLocation={setSelectedLocation}
          openModal={openModal}
        />
      )}
      
      {showAddModel && (
        <WorkLocationForm
          onClose={closeModal}
          isEdit={isEdit}
          initialData={selectedLocation}
          onSuccess={fetchLocations}
        />
      )}
      {showImportModal && <ImportWorkLocations onClose={closeImport} fetchLocations={fetchLocations} />}
    </>
  );
};

export default WorkLocations;
