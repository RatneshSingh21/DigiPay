import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 ">
      <div className="bg-white p-6 rounded shadow-2xl max-w-sm w-full mx-auto border border-gray-200">
        <h2 className="text-lg font-semibold flex gap-2">
          <AlertTriangle className="text-red-600" size={24} />{title || "Are you sure?"}
        </h2>
        <p className="text-sm text-gray-600">
          {message || "Please confirm your action."}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
