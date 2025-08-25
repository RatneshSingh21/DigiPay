import { useEffect, useState } from "react";
import { FiDownload, FiEdit, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ModalOverlay from "../../../components/ModalOverlay";
import { toast } from "react-toastify";
import assets from "../../../assets/assets";
import PayScheduleForm from "../PaySchedule/PayScheduleForm";
import ConfirmModal from "../../../components/ConfirmModal";

const PaySchedule = () => {
  const [paySchedules, setPaySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/PaySchedule/all");
      setPaySchedules(res.data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      await axiosInstance.delete(`/PaySchedule/${item.id}`);
      toast.success("Pay Schedule deleted successfully");
      // Refresh the list
      fetchSchedules();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete Pay Schedule");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleAddNew = () => {
    setEditData(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
  };

  const handleSuccess = () => {
    handleClose();
    fetchSchedules();
  };

  return (
    <>
      <div className="px-4 py-3 shadow sticky top-14 bg-white flex justify-between items-center">
        <h2 className="font-semibold text-xl">Pay Schedule</h2>
        <button
          onClick={handleAddNew}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
        >
          + Add Schedule
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      ) : paySchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <img
            src={assets.PaySchuduleIllustration}
            alt="Pay Schedule Illustration"
            className="w-64 h-auto mb-6"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
            Simplify payroll management with flexible pay schedules
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Create customized pay schedules that align with your business needs
            and assign them to specific employee groups with ease.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleAddNew}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
            >
              + Add Schedule
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
              <FiDownload />
              Import
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 text-sm rounded-md overflow-hidden shadow">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr className="text-center">
                <th className="px-4 py-3 text-left">Id</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Pay Frequency</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">Pay On</th>
                <th className="px-4 py-3">Work Days</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {paySchedules.map((item, index) => (
                <tr
                  key={item.id}
                  className={
                    index % 2 === 0
                      ? "bg-white text-center"
                      : "bg-gray-50 border-t text-center"
                  }
                >
                  <td className="px-4 py-3 font-medium text-left">{item.id}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 capitalize">{item.payFrequency}</td>
                  <td className="px-4 py-3">
                    {new Date(item.firstPayrollStartFrom).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {item.payOnType === "Specific Day" ||
                    item.payOnType === "fixedDay"
                      ? `Day ${item.specificPayDay}`
                      : item.payOnType === "lastDay"
                      ? "Last Day"
                      : item.payOnType}
                  </td>
                  <td className="px-4 py-3">
                    {item.workWeekDays?.length > 0
                      ? item.workWeekDays.join(", ")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 items-center justify-center">
                      <button
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        onClick={() => handleEdit(item)}
                      >
                        <FiEdit size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                        onClick={() => setConfirmDeleteId(item)}
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <ModalOverlay onClose={handleClose}>
          <PayScheduleForm
            schedule={editData} // if null → Add mode; else → Edit mode
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </ModalOverlay>
      )}

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete?"
          message="Are you sure you want to delete? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </>
  );
};

export default PaySchedule;
