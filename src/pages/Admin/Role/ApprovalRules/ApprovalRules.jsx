import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RuleModal from "./RuleModal";
import { FaPlus } from "react-icons/fa";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FiEdit2 } from "react-icons/fi";

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [departments, setDepartments] = useState({});

  useEffect(() => {
    axiosInstance.get("/Department").then((res) => {
      const map = {};
      res.data.forEach((d) => (map[d.id] = d.name));
      setDepartments(map);
    });
  }, []);

  const emptyForm = {
    requestType: "",
    allowCustomApprover: false,
    ownerAutoApprove: false,
    restrictToSpecificDepartment: false,
    departmentId: null,
    useMultiStageApproval: false,
    stages: [],
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchRules = async () => {
    try {
      const res = await axiosInstance.get("/ApprovalRule");
      setRules(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch approval rules");
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const saveRule = async () => {
    if (!formData.requestType) {
      toast.error("Request Type required");
      return;
    }

    if (formData.useMultiStageApproval) {
      for (const stage of formData.stages) {
        if (!stage.stageType) {
          toast.error("Each stage must have a Stage Type");
          return;
        }

        if (
          stage.stageType === "SpecificDepartmentHOD" &&
          !stage.departmentId
        ) {
          toast.error("Specific Department HOD requires a department");
          return;
        }
      }
    }

    const payload = {
      ...formData,
      stages: formData.useMultiStageApproval ? formData.stages : [],
    };

    try {
      if (editingRuleId) {
        await axiosInstance.put(`/ApprovalRule/${editingRuleId}`, payload);
        toast.success("Rule updated successfully");
      } else {
        await axiosInstance.post("/ApprovalRule", payload);
        toast.success("Rule created successfully");
      }

      setIsRuleModalOpen(false);
      setEditingRuleId(null);
      setFormData(emptyForm);
      fetchRules();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  return (
    <>
      {/* Header (MATCHED) */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Approval Rules Management</h2>
      </div>

      <div className="px-4 py-2 space-y-2">
        {/* Rules Card */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <HiOutlineClipboardCheck className="text-primary" />
              Approval Rules
              <span className="text-sm text-gray-500">
                {rules.length} total
              </span>
            </h3>

            <button
              onClick={() => {
                setFormData(emptyForm);
                setEditingRuleId(null);
                setIsRuleModalOpen(true);
              }}
              className="bg-primary text-sm hover:bg-secondary cursor-pointer flex items-center text-white px-5 py-2 rounded-lg shadow-md"
            >
              <FaPlus className="mr-2" /> Create Rule
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <HiOutlineClipboardCheck size={32} className="mb-2 opacity-50" />
              <p className="italic">No rules created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow">
              <table className="min-w-full divide-y text-xs divide-gray-200 text-center">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2">S.No</th>
                    <th className="p-2">Request</th>
                    <th className="p-2">Custom Approver</th>
                    <th className="p-2">Owner Auto</th>
                    <th className="p-2">Dept Restricted</th>
                    <th className="p-2">Multi Stage</th>
                    <th className="p-2">Stages</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {rules.map((r, index) => (
                    <tr
                      key={r.ruleId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-2 text-gray-700">{index + 1}</td>
                      <td className="p-2 font-medium text-gray-800">
                        {r.requestType}
                      </td>
                      <td className="p-2 text-center">
                        {r.allowCustomApprover ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            No
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {r.ownerAutoApprove ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            No
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {r.restrictToSpecificDepartment ? (
                          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {departments[r.departmentId] || "—"}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {r.useMultiStageApproval ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            No
                          </span>
                        )}
                      </td>

                      <td className="p-2 relative group">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full cursor-pointer">
                          {r.stages?.length || 0}
                        </span>

                        {/* Tooltip */}
                        {r.stages?.length > 0 && (
                          <div className="absolute z-50 hidden group-hover:block top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3 text-left max-h-48 overflow-y-auto">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Approval Stages
                            </p>

                            <div className="space-y-2">
                              {r.stages.map((s) => (
                                <div
                                  key={s.sequenceOrder}
                                  className="text-xs border-l-2 border-blue-500 pl-2"
                                >
                                  <div className="font-medium text-gray-800">
                                    Stage {s.sequenceOrder} •{" "}
                                    {s.displayLabel || s.stageType}
                                  </div>
                                  <div className="text-gray-500">
                                    Department:{" "}
                                    <span className="font-medium">
                                      {departments[s.departmentId] || "—"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="p-2">
                        <button
                          onClick={() => {
                            setFormData({
                              requestType: r.requestType,
                              allowCustomApprover: r.allowCustomApprover,
                              ownerAutoApprove: r.ownerAutoApprove,
                              restrictToSpecificDepartment:
                                r.restrictToSpecificDepartment,
                              departmentId: r.departmentId,
                              useMultiStageApproval: r.useMultiStageApproval,
                              stages:
                                r.stages?.map((s) => ({
                                  sequenceOrder: s.sequenceOrder,
                                  stageType: s.stageType,
                                  departmentId: s.departmentId,
                                })) || [],
                            });

                            setEditingRuleId(r.ruleId);
                            setIsRuleModalOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-600 cursor-pointer rounded-md text-xs flex items-center gap-1 mx-auto hover:bg-blue-200"
                        >
                          <FiEdit2 size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        <RuleModal
          isOpen={isRuleModalOpen}
          onClose={() => setIsRuleModalOpen(false)}
          formData={formData}
          setFormData={setFormData}
          createRule={saveRule}
          isEdit={Boolean(editingRuleId)}
        />
      </div>
    </>
  );
};

export default ApprovalRules;
