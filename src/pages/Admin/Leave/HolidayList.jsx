import React, { useEffect, useState } from "react";
import { FiEdit, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import HolidayListAddForm from "./HolidayListAddForm";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../components/ConfirmModal";
import assets from "../../../assets/assets";

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedHoliday(null);
  };

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/HolidayListMaster/get-all");
      setHolidays(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch holiday list!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/HolidayListMaster/delete/${id}`);
      toast.success("deleted successfully");
      fetchHolidays();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <div>
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Holiday List</h2>
        {holidays.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
              onClick={() => {
                setIsEdit("Add");
                setSelectedHoliday(null);
                openModal();
              }}
            >
              Add Holiday
            </button>
            <button
              onClick={fetchHolidays}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          {/* Show table header only when there are holidays */}
          {holidays.length > 0 && (
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="py-3 px-4 text-center">S NO.</th>
                <th className="py-3 px-4 text-center">Holiday Name</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Day</th>
                {/* <th className="py-3 px-4 text-center">Created By</th>
                <th className="py-3 px-4 text-center">Updated By</th> */}
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
          )}

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="py-6 text-center text-gray-500 italic"
                >
                  Loading holidays...
                </td>
              </tr>
            ) : holidays.length > 0 ? (
              holidays.map((holiday, index) => (
                <tr
                  key={holiday.holidayId || index}
                  className="border-t hover:bg-gray-50 transition text-center"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 text-center">
                    {holiday.holidayName}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {new Date(holiday.holidayDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-center">
                    {new Date(holiday.holidayDate).toLocaleDateString("en-GB", {
                      weekday: "long",
                    })}
                  </td>
                  {/* <td className="py-3 px-4 text-center">
                    {holiday.createdBy || "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {holiday.updatedBy || "-"}
                  </td> */}
                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                      onClick={() => {
                        setIsEdit("Edit");
                        setSelectedHoliday(holiday);
                        openModal();
                      }}
                    >
                      <FiEdit size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                      onClick={() => setConfirmDeleteId(holiday.holidayId)}
                    >
                      <FiTrash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={assets.holiday}
                      alt="No holidays"
                      className="w-40 h-40 mb-4 opacity-80"
                    />
                    <p className="text-gray-600 font-medium">
                      No holidays found
                    </p>
                    <p className="text-gray-400 text-sm">
                      Add holidays to manage your company calendar efficiently.
                    </p>
                    <button
                      onClick={() => {
                        setIsEdit("Add");
                        setSelectedHoliday(null);
                        openModal();
                      }}
                      className="mt-4 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
                    >
                      + Add Holiday
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete?"
          message="Are you sure you want to delete this? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}

      {/* ADD/EDIT POPUP */}
      {showAddModal && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              ✖
            </button>
            <HolidayListAddForm
              onClose={closeModal}
              isEdit={isEdit}
              initialData={selectedHoliday}
              onSuccess={fetchHolidays}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayList;
