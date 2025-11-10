import React from "react";
import { X } from "lucide-react";
import CreatableSelect from "react-select/creatable";

const RuleModal = ({ isOpen, onClose, formData, setFormData, createRule }) => {
  if (!isOpen) return null;

  const options = [
    { value: "AdvancePayment", label: "Advance Payment" },
    { value: "Leave", label: "Leave" },
    { value: "onDuty", label: "On Duty" },
    { value: "Expense", label: "Expense" },
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Create Approval Rule
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Request Type (Creatable Select) */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Request Type
          </label>
          <CreatableSelect
            isClearable
            autoFocus
            options={options}
            placeholder="Select or type to add new..."
            value={
              formData.requestType
                ? { value: formData.requestType, label: formData.requestType }
                : null
            }
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                requestType: selectedOption ? selectedOption.value : "",
              })
            }
            formatCreateLabel={(inputValue) => ` Add "${inputValue}"`}
            classNamePrefix="select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#93c5fd",
                borderRadius: "0.5rem",
                minHeight: "38px",
                boxShadow: "none",
                "&:hover": { borderColor: "#60a5fa" },
              }),
            }}
          />
        </div>

        {/* Checkbox */}
        <div className="mb-6">
          <label
            htmlFor="customApprover"
            className="flex items-center gap-2 cursor-pointer select-none text-gray-700"
          >
            <input
              id="customApprover"
              type="checkbox"
              checked={formData.allowCustomApprover}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowCustomApprover: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            Allow Custom Approver
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg cursor-pointer border text-sm border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={createRule}
            className="px-5 py-2 rounded-lg cursor-pointer bg-primary text-sm text-white hover:bg-secondary transition shadow-sm"
          >
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleModal;
