import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../../components/ConfirmModal";
import OTSlabMasterRulesForm from "./OTSlabMasterRulesForm";

export default function OTSlabMasterRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedRule, setSelectedRule] = useState(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setSelectedRule(null);
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/OTRateSlabAssignmentRule");
      setRules(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch rules!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/OTRateSlabAssignmentRule/${id}`);
      toast.success("Rule deleted successfully!");
      fetchRules();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete rule!");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="text-sm">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-800">
          OT Rate Slab Assignment Rules
        </h2>
        <button
          className="bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md font-medium text-sm transition cursor-pointer"
          onClick={() => {
            setIsEdit("Add");
            setSelectedRule(null);
            openModal();
          }}
        >
          + Add Rule
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-3 rounded-lg shadow bg-white mx-3">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No rules found.
          </div>
        ) : (
          <table className="min-w-full border border-gray-200 text-xs">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-3 py-2 border-b text-center font-medium">
                  Rule Code
                </th>
                <th className="px-3 py-2 border-b text-center font-medium">
                  Entity Name
                </th>
                <th className="px-3 py-2 border-b text-center font-medium">
                  Condition Expression
                </th>
                <th className="px-3 py-2 border-b text-center font-medium">
                  Error Message
                </th>
                <th className="px-3 py-2 border-b text-center font-medium">
                  Is Enabled
                </th>
                <th className="px-3 py-2 border-b text-center font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.otRateSlabAssignmentRuleId}
                  className="hover:bg-gray-50 border-b text-gray-700"
                >
                  <td className="px-3 py-1.5 text-center">{rule.ruleCode}</td>
                  <td className="px-3 py-1.5 text-center">{rule.entityName}</td>
                  <td className="px-3 py-1.5 text-center">
                    {rule.conditionExpression}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    {rule.errorMessage}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    {rule.isEnabled ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-500 font-medium">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-2">
                      <button
                        className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        onClick={() => {
                          setIsEdit("Edit");
                          setSelectedRule(rule);
                          openModal();
                        }}
                      >
                        <FiEdit size={13} />
                        Edit
                      </button>

                      <button
                        className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                        onClick={() =>
                          setConfirmDeleteId(rule.otRateSlabAssignmentRuleId)
                        }
                      >
                        <FiTrash2 size={13} />
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

      {/* Confirm Delete */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Rule?"
          message="Are you sure you want to delete this rule? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[520px] rounded-lg shadow-lg p-5 relative">
            <button
              className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={closeModal}
            >
              ✖
            </button>
            <OTSlabMasterRulesForm
              onClose={closeModal}
              isEdit={isEdit}
              initialData={selectedRule}
              onSuccess={fetchRules}
            />
          </div>
        </div>
      )}
    </div>
  );
}
