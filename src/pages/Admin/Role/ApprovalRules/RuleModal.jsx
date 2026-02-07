import React, { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const selectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    minHeight: "40px",
    fontSize: "0.875rem",
  }),
  menu: (base) => ({ ...base, zIndex: 70 }),
};

const stageTypeOptions = [
  { value: "EmployeeHOD", label: "Employee HOD" },
  { value: "DepartmentHead", label: "Department Head" },
  { value: "Admin", label: "Admin" },
];

const requestOptions = [
  { value: "AdvancePayment", label: "Advance Payment" },
  { value: "Leave", label: "Leave" },
  { value: "onDuty", label: "On Duty" },
  { value: "Expense", label: "Expense" },
];

const RuleModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  createRule,
  isEdit,
}) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    axiosInstance.get("/Department").then((res) => {
      setDepartments(
        res.data.map((d) => ({
          value: d.id,
          label: d.name,
        }))
      );
    });
  }, []);

  if (!isOpen) return null;

  const addStage = () => {
    setFormData({
      ...formData,
      stages: [
        ...formData.stages,
        {
          sequenceOrder: formData.stages.length + 1,
          stageType: "",
          departmentId: null,
        },
      ],
    });
  };

  const updateStage = (index, key, value) => {
    const updated = [...formData.stages];
    updated[index][key] = value;
    setFormData({ ...formData, stages: updated });
  };

  const removeStage = (index) => {
    const updated = formData.stages.filter((_, i) => i !== index);
    updated.forEach((s, i) => (s.sequenceOrder = i + 1));
    setFormData({ ...formData, stages: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Approval Rule" : "Create Approval Rule"}
          </h3>
          <X className="cursor-pointer text-gray-500" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto space-y-2">

          {/* Request Type */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Request Type
            </label>
            <CreatableSelect
              styles={selectStyles}
              options={requestOptions}
              value={
                formData.requestType
                  ? {
                      value: formData.requestType,
                      label: formData.requestType,
                    }
                  : null
              }
              onChange={(opt) =>
                setFormData({ ...formData, requestType: opt?.value || "" })
              }
            />
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["allowCustomApprover", "Allow Custom Approver"],
              ["ownerAutoApprove", "Owner Auto Approve"],
              ["restrictToSpecificDepartment", "Restrict to Department"],
              ["useMultiStageApproval", "Multi Stage Approval"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>

          {/* Rule Level Department */}
          {formData.restrictToSpecificDepartment && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                Department
              </label>
              <Select
                styles={selectStyles}
                options={departments}
                value={departments.find(
                  (d) => d.value === formData.departmentId
                )}
                onChange={(opt) =>
                  setFormData({
                    ...formData,
                    departmentId: opt?.value || null,
                  })
                }
              />
            </div>
          )}

          {/* Approval Stages */}
          {formData.useMultiStageApproval && (
            <div className="border border-gray-400 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">Approval Stages</p>
                <button
                  onClick={addStage}
                  className="text-blue-600 text-sm flex items-center gap-1"
                >
                  <Plus size={14} /> Add Stage
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {formData.stages.map((stage, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">
                        Stage {stage.sequenceOrder}
                      </span>
                      <Trash2
                        size={16}
                        className="text-red-500 cursor-pointer"
                        onClick={() => removeStage(i)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        styles={selectStyles}
                        options={stageTypeOptions}
                        placeholder="Stage Type"
                        value={stageTypeOptions.find(
                          (s) => s.value === stage.stageType
                        )}
                        onChange={(opt) =>
                          updateStage(i, "stageType", opt?.value || "")
                        }
                      />

                      <Select
                        styles={selectStyles}
                        options={departments}
                        placeholder="Department"
                        value={departments.find(
                          (d) => d.value === stage.departmentId
                        )}
                        onChange={(opt) =>
                          updateStage(
                            i,
                            "departmentId",
                            opt?.value || null
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white sticky bottom-0">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg cursor-pointer text-sm text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={createRule}
            className="bg-primary hover:bg-secondary cursor-pointer text-sm text-white px-6 py-2 rounded-lg"
          >
            {isEdit ? "Update Rule" : "Save Rule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleModal;
