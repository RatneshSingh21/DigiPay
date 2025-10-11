import { useEffect, useState } from "react";
import { FiDownload, FiEdit, FiTrash2, FiUpload } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ModalOverlay from "../../../components/ModalOverlay";
import { toast } from "react-toastify";
import assets from "../../../assets/assets";
import PayScheduleForm from "../PaySchedule/PayScheduleForm";
import ConfirmModal from "../../../components/ConfirmModal";
import ImportPayschedule from "../PaySchedule/ImportPayschedule";

const PaySchedule = () => {
  const [paySchedules, setPaySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

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
      toast.error("Failed to load pay schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      await axiosInstance.delete(`/PaySchedule/${item.id}`);
      toast.success("Pay Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error?.response?.data?.message || "Failed to delete");
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
      <div className="px-4 py-2 shadow sticky top-14 bg-white flex justify-between items-center">
        <h2 className="font-semibold text-xl">Pay Schedule</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="bg-primary text-sm hover:bg-secondary cursor-pointer text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Schedule
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="border text-sm border-gray-300 cursor-pointer text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <FiUpload />
            Import
          </button>
        </div>
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
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
            Simplify payroll management with flexible pay schedules
          </h1>
          <p className="text-gray-600 mb-6">
            Create customized pay schedules or import them from Excel.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleAddNew}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
            >
              + Add Schedule
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 flex items-center gap-2"
            >
              <FiUpload />
              Import
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 text-xs rounded-md overflow-hidden shadow">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr className="text-center">
                <th className="px-4 py-3 text-left">Id</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Pay Frequency</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">Pay On</th>
                <th className="px-4 py-3">Work Days</th>
                <th className="px-4 py-3">Salary Based On</th>
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
                    {new Date(item.firstPayrollStartFrom).toLocaleDateString(
                      "en-GB"
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {item.payOnType === "fixedDay"
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
                  <td className="px-4 py-3 capitalize">
                    {item.salaryBasedOn === "actual"
                      ? "Actual Days Worked"
                      : item.salaryBasedOn === "org"
                      ? "Organization Working Days"
                      : item.salaryBasedOn}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClose={handleClose}>
          <PayScheduleForm
            schedule={editData}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </ModalOverlay>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportPayschedule
          onClose={() => setShowImportModal(false)}
          fetchShifts={fetchSchedules}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Pay Schedule?"
          message="Are you sure you want to delete this pay schedule? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </>
  );
};

export default PaySchedule;
