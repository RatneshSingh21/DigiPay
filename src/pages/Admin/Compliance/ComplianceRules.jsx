import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiEdit2, FiTrash2 } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../components/ConfirmModal";
import assets from "../../../assets/assets";
import ComplianceRuleForm from "./ComplianceRuleForm";


const ComplianceRules = () => {
  const [rules, setRules] = useState([]);
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
      const res = await axiosInstance.get("/ComplianceRule/get-all");
      setRules(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch holiday list!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/ComplianceRule/${id}`);
      toast.success("Deleted successfully");
      fetchCompliance(); // refresh the table
    } catch (error) {
      console.error(error.response || error);
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
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Compliance Rule</h2>
        {rules.length >= 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary text-sm hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
              onClick={() => {
                setIsEdit("Add");
                setSelectedCompliance(null);
                openModal();
              }}
            >
              Add Compliance Rule
            </button>
          </div>
        )}
      </div>
      <div>
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <img
              src={assets.ComplianceRuleIllustration}
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
                className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium "
                onClick={() => {
                  setIsEdit("Add");
                  setSelectedCompliance(null);
                  openModal();
                }}
              >
                + New Compliance Rule
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full border border-gray-200 bg-white">
              <thead className="bg-gray-100 ">
                <tr className="border-b">
                  <th className="px-4 py-2 ">Rule Code</th>
                  <th className="px-4 py-2 ">Rule Name</th>

                  <th className="px-4 py-2 ">Rule Type</th>
                  <th className="px-4 py-2 ">Description</th>
                  <th className="px-6 py-2 ">Effective From</th>
                  <th className="px-6 py-2 ">Effective To</th>
                  <th className="px-4 py-2 text-center ">Is Enabled</th>
                  <th className="px-4 py-2  text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr
                    key={rule.complianceRuleDetailId}
                    className="hover:bg-gray-50 border-b"
                  >
                    <td className="px-4 py-2  text-center">{rule.ruleCode}</td>
                    <td className="px-4 py-2 text-center">{rule.ruleName}</td>

                    <td className="px-4 py-2 text-center">{rule.ruleType}</td>
                    <td className="px-4 py-2 text-center">{rule.description}</td>
                    <td className="px-4 py-2 text-center ">
                      {rule.effectiveFrom?.split("T")[0]}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {rule.effectiveTo?.split("T")[0]}
                    </td>
                    <td className="px-4 py-2 text-center ">
                      {rule.isEnabled ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                    <div className="flex gap-3 items-center justify-center">
                        <button
                          className="flex items-center gap-1 px-2.5 py-1 rounded cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          onClick={() => {
                            setIsEdit("Edit");
                            setSelectedCompliance(rule);
                            openModal();
                          }}
                        >
                          <FiEdit size={14} />
                          <span>Edit</span>
                        </button>
                        {/* Delete Button */}
                        <button
                          className="flex items-center gap-1 px-2.5 py-1 cursor-pointer rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                          onClick={() =>
                            setConfirmDeleteId(rule.complianceRuleDetailId)
                          }
                        >
                          <FiTrash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No compliance rules found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
            <ComplianceRuleForm
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

export default ComplianceRules;
