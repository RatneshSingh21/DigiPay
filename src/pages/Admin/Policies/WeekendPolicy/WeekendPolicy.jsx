import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import WeekendPolicyList from "./WeekendPolicyList";
import AddWeekendPolicy from "./AddWeekendPolicy";
import ImportShift from "../../Shift/ImportShift";
import assets from "../../../../assets/assets";


const WeekendPolicy = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [weekendPolicy, setWeekendPolicy] = useState([]);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedWeekendPolicy, setSelectedWeekendPolicy] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedWeekendPolicy(null);
  };

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  const fetchWeekendPolicy = async () => {
    try {
      const response = await axiosInstance.get("/weekendPolicy/get-all");
      setWeekendPolicy(response.data || []);
    } catch (error) {
      console.error("Error fetching weekend policies:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load work weekend policies"
      );
    }
  };

  useEffect(() => {
    fetchWeekendPolicy();
  }, []);

  return (
    <>
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Weekend Policy</h2>
        {weekendPolicy.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedWeekendPolicy(null);
                openModal();
              }}
            >
              Add Policy
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

      {weekendPolicy.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <img
            src={assets.WeekendPolicyIllustration}
            alt="Shift"
            className="w-64 h-auto mb-6"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Customize your work culture with Weekend Policies
          </h2>
          <p className="text-gray-600 max-w-md mb-6">
            Define weekend structures to suit your business needs. Set fixed,
            alternate, or rotational weekends and manage half-days effortlessly.
          </p>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium"
              onClick={() => {
                setIsEdit("Add");
                setSelectedWeekendPolicy(null);
                openModal();
              }}
            >
              + New Policy
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
        <WeekendPolicyList
          weekendPolicy={weekendPolicy}
          fetchWeekendPolicy={fetchWeekendPolicy}
          setIsEdit={setIsEdit}
          setSelectedWeekendPolicy={setSelectedWeekendPolicy}
          openModal={openModal}
        />
      )}

      {/* Show Modal */}
      {showAddModal && (
        <AddWeekendPolicy
          onClose={closeModal}
          isEdit={isEdit}
          initialData={selectedWeekendPolicy}
          onSuccess={fetchWeekendPolicy}
        />
      )}

      {showImportModal && (
        <ImportShift
          onClose={closeImport}
          fetchWeekendPolicy={fetchWeekendPolicy}
        />
      )}
    </>
  );
};

export default WeekendPolicy;