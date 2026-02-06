import React from "react";
import { X } from "lucide-react";
import CreatableSelect from "react-select/creatable";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    minHeight: "40px",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.25)" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    fontSize: "0.875rem",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 60,
  }),
};

const RuleModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  createRule,
  isEdit,
}) => {
  if (!isOpen) return null;

  const options = [
    { value: "AdvancePayment", label: "Advance Payment" },
    { value: "Leave", label: "Leave" },
    { value: "onDuty", label: "On Duty" },
    { value: "Expense", label: "Expense" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-slideUp">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit Approval Rule" : "Create Approval Rule"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 cursor-pointer hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Request Type */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Request Type
          </label>
          <CreatableSelect
            isClearable
            autoFocus
            options={options}
            placeholder="Select or type to add new"
            value={
              formData.requestType
                ? {
                    value: formData.requestType,
                    label: formData.requestType,
                  }
                : null
            }
            onChange={(option) =>
              setFormData({
                ...formData,
                requestType: option ? option.value : "",
              })
            }
            formatCreateLabel={(value) => `Add "${value}"`}
            styles={selectStyles}
          />
        </div>

        {/* Rule Options */}
        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Rule Options</p>

          {/* Allow Custom Approver */}
          <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.allowCustomApprover}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowCustomApprover: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Allow Custom Approver
          </label>

          {/* Owner Auto Approve */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.ownerAutoApprove}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ownerAutoApprove: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Owner Auto Approve
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm cursor-pointer text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={createRule}
            className="rounded-lg bg-primary px-5 py-2 text-sm cursor-pointer text-white hover:bg-secondary transition"
          >
            {isEdit ? "Update Rule" : "Save Rule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleModal;
