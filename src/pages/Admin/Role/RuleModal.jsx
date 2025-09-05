import React from "react";

const RuleModal = ({ isOpen, onClose, formData, setFormData, createRule }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Create Approval Rule
        </h3>
        <input
          type="text"
          placeholder="Enter request type (e.g. Leave, Travel, Expense)"
          className="w-full border px-3 py-2 rounded-lg mb-3 focus:ring focus:ring-blue-200"
          value={formData.requestType}
          onChange={(e) =>
            setFormData({ ...formData, requestType: e.target.value })
          }
        />
        <label className="flex items-center gap-2 mb-4 text-gray-700">
          <input
            type="checkbox"
            checked={formData.allowCustomApprover}
            onChange={(e) =>
              setFormData({
                ...formData,
                allowCustomApprover: e.target.checked,
              })
            }
            className="w-4 h-4"
          />
          Allow Custom Approver
        </label>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={createRule}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleModal;
