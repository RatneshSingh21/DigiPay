import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";
import ShiftList from "../Shift/ShiftList";
import AddShiftForm from "../Shift/AddShiftForm";
import ImportShift from "../Shift/ImportShift";

const Shifts = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedShift, setSelectedShift] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedShift(null);
  };

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  const fetchShifts = async () => {
    try {
      const response = await axiosInstance.get("/Shift");
      setShifts(response.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error(error?.response?.data?.message || "Failed to load work locations");
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  return (
    <>
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Shifts</h2>
        {shifts.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedShift(null);
                openModal();
              }}
            >
              Add Shift
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

      {shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <img
            src={assets.ShiftIllustration}
            alt="Shift"
            className="w-64 h-auto mb-6"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Enhance organisation structure with new shifts
          </h2>
          <p className="text-gray-600 max-w-md mb-6">
            Create department based on the once present in the organization and
            associate with employees
          </p>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedShift(null);
                openModal();
              }}
            >
              + New Shift
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
        <ShiftList
          shifts={shifts}
          fetchShifts={fetchShifts}
          setIsEdit={setIsEdit}
          setSelectedShift={setSelectedShift}
          openModal={openModal}
        />
      )}

      {/* Show Modal */}
      {showAddModal && (
        <AddShiftForm
          onClose={closeModal}
          isEdit={isEdit}
          initialData={selectedShift}
          onSuccess={fetchShifts}
        />
      )}

      {showImportModal && <ImportShift onClose={closeImport} fetchShifts={fetchShifts} />}
    </>
  );
};

export default Shifts;




