import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl border border-gray-200 shadow-2xl p-6 animate-fadeIn">
        {/* HEADER */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
