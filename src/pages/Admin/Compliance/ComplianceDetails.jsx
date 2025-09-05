import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../components/ConfirmModal";
import AddCompliance from "./AddCompliance";
import assets from "../../../assets/assets";

const ComplianceDetails = () => {
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  const { user } = useAuthStore();

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedCompliance(null);
  };

  const fetchCompliance = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/Compliance/get-all");
      setCompliance(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch holiday list!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/Compliance/delete/${id}`, {
        params: {
          updatedBy: user?.userId,
        },
      });
      toast.success("Deleted successfully");
      fetchCompliance();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  return (
    <div>
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Compliance List</h2>
        {compliance.length >= 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
              onClick={() => {
                setIsEdit("Add");
                setSelectedCompliance(null);
                openModal();
              }}
            >
              Add Compliance
            </button>
          </div>
        )}
      </div>
      <div>
        {compliance.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <img
              src={assets.ComplianceIllustration}
              alt="Compliance Illustration"
              className="w-64 h-auto mb-6"
            />
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
              Track Compliance with regulations
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Create compliance policies based on the regulations within your
              organization and associate them with employees.
            </p>
            <div className="flex gap-4">
              <button
                className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium"
                onClick={() => {
                  setIsEdit("Add");
                  setSelectedCompliance(null);
                  openModal();
                }}
              >
                + New Compliance
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 p-2">
            {compliance.map((item) => (
              <div
                key={item.complianceId}
                className="bg-white rounded-xl shadow-md p-6 relative hover:shadow-lg transition"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {item.complianceName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {item.complianceCode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Edit */}
                    <button
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setIsEdit("Edit");
                        setSelectedCompliance(item);
                        openModal();
                      }}
                    >
                      <FiEdit2 size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      className="p-2 bg-gray-100 rounded-full hover:bg-red-100 cursor-pointer"
                      onClick={() => setConfirmDeleteId(item.complianceId)}
                    >
                      <FiTrash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="mt-4 space-y-1 text-gray-700">
                  <p>
                    <span className="font-semibold">Description:</span>{" "}
                    {item.description || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">States:</span>{" "}
                    {item.applicableStates || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Rules:</span>{" "}
                    {item.ruleCount}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span> {item.status}
                  </p>
                  <p>
                    <span className="font-semibold">Enabled:</span>{" "}
                    {item.isEnabled ? "Yes ✔️" : "No ❌"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <AddCompliance
              onClose={closeModal}
              isEdit={isEdit}
              initialData={selectedCompliance}
              onSuccess={fetchCompliance}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDetails;
