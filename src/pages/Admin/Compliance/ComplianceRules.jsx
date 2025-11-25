import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
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
      // toast.error("Failed to fetch compliance rules!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/ComplianceRule/${id}`);
      toast.success("Deleted successfully");
      fetchCompliance();
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 py-2 shadow-sm sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800">
          Compliance Rules
        </h2>
        <button
          onClick={() => {
            setIsEdit("Add");
            setSelectedCompliance(null);
            openModal();
          }}
          className="bg-primary cursor-pointer hover:bg-secondary text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          + Add Compliance Rule
        </button>
      </div>

      {/* Table or Empty State */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Loading...
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <img
              src={assets.ComplianceRuleIllustration}
              alt="No Data"
              className="w-64 h-auto mb-6"
            />
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
              Track Compliance with Regulations
            </h1>
            <p className="text-gray-600 mb-6 max-w-md">
              Create compliance policies based on regulations within your
              organization and associate them with employees.
            </p>
            <button
              onClick={() => {
                setIsEdit("Add");
                setSelectedCompliance(null);
                openModal();
              }}
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium"
            >
              + New Compliance Rule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full bg-white text-xs text-center">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-gray-600 border-b">
                  <th className="px-3 py-3 font-semibold">Rule Code</th>
                  <th className="px-3 py-3 font-semibold">Rule Name</th>
                  <th className="px-3 py-3 font-semibold">RuleType</th>
                  <th className="px-3 py-3 font-semibold">Description</th>
                  <th className="px-3 py-3 font-semibold">EffectiveFrom</th>
                  <th className="px-3 py-3 font-semibold">EffectiveTo</th>
                  <th className="px-3 py-3 font-semibold">IsEnabled</th>
                  <th className="px-3 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, index) => (
                  <tr
                    key={rule.complianceRuleDetailId}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="px-3 py-2">{rule.ruleCode}</td>
                    <td className="px-3 py-2">{rule.ruleName}</td>
                    <td className="px-3 py-2">{rule.ruleType}</td>
                    <td className="px-3 py-2">{rule.description}</td>
                    <td className="px-3 py-2 text-center">
                      {rule.effectiveFrom?.split("T")[0] || "-"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {rule.effectiveTo?.split("T")[0] || "-"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          rule.isEnabled
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {rule.isEnabled ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setIsEdit("Edit");
                            setSelectedCompliance(rule);
                            openModal();
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <FiEdit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDeleteId(rule.complianceRuleDetailId)
                          }
                          className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={12} />
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
      </div>

      {/* Confirm Delete */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Compliance Rule?"
          message="Are you sure you want to delete this rule? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px] p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
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
