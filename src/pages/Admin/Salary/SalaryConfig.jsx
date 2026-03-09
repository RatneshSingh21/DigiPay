import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import ConfirmModal from "../../../components/ConfirmModal";
import SalaryConfigForm from "./SalaryConfigForm";
import { FiPlus, FiEdit2, FiTrash2, FiInbox } from "react-icons/fi";
import { X } from "lucide-react";

const SalaryConfig = () => {
  const user = useAuthStore((state) => state.user);
  const orgId = user?.orgId || user?.companyId;

  const [componentConfigs, setComponentConfigs] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConfigs = async () => {
    try {
      const res = await axiosInstance.get("/OrgComponentConfig/by-org", {
        params: { orgId },
      });
      setComponentConfigs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (orgId) fetchConfigs();
  }, [orgId]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/OrgComponentConfig/${id}`);
      toast.success("Component deleted successfully.");
      fetchConfigs();
    } catch (err) {
      toast.error("Error deleting component.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const openAddModal = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="bg-white border-b p-4 border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Salary Configuration
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage payroll components and calculation rules
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary cursor-pointer text-white px-5 py-2.5 rounded-lg shadow hover:bg-secondary text-sm transition"
          >
            <FiPlus size={16} />
            Add Component
          </button>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {componentConfigs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <FiInbox size={48} className="text-gray-300" />
              <p className="mt-4 font-medium text-gray-700">
                No salary components configured
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Click "Add Component" to get started
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-center border-gray-200 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-2">S.No.</th>
                  <th className="px-4 py-2">Component</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>

              <tbody className="text-center">
                {componentConfigs.map((item, idx) => (
                  <tr
                    key={item.componentConfigId}
                    className="hover:bg-gray-50  border-b border-gray-200"
                  >
                    <td className="px-4 py-2 text-gray-400">{idx + 1}.</td>
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {item.componentName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {item.calculationType === 1 ? "Percentage" : "Fixed"}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {item.calculationType === 1
                        ? `${item.percentageValue}%`
                        : `₹${item.fixedAmount}`}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          item.isEnabled
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.isEnabled ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(item)}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                          bg-blue-50 text-blue-600 
                          hover:bg-blue-100 hover:shadow-sm 
                          transition-all duration-200 text-xs font-medium cursor-pointer"
                        >
                          <FiEdit2
                            size={14}
                            className="group-hover:scale-110 transition-transform duration-200"
                          />
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            setConfirmDeleteId(item.componentConfigId)
                          }
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                          bg-red-50 text-red-600 
                          hover:bg-red-100 hover:shadow-sm 
                          transition-all duration-200 text-xs font-medium cursor-pointer"
                        >
                          <FiTrash2
                            size={14}
                            className="group-hover:scale-110 transition-transform duration-200"
                          />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* FORM MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-8 relative animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">
                  {editData ? "Edit Component" : "Add Component"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-red-600 cursor-pointer transition "
                >
                  <X size={20} />
                </button>
              </div>

              <SalaryConfigForm
                orgId={orgId}
                fetchConfigs={fetchConfigs}
                editData={editData}
                clearEdit={closeModal}
                existingComponents={componentConfigs}
              />
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {confirmDeleteId && (
          <ConfirmModal
            title="Delete Component?"
            message="This action cannot be undone."
            onCancel={() => setConfirmDeleteId(null)}
            onConfirm={() => handleDelete(confirmDeleteId)}
          />
        )}
      </div>
    </div>
  );
};

export default SalaryConfig;
