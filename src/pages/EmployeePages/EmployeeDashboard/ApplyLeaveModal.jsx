import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { X } from "lucide-react";

const ApplyLeaveModal = ({ isOpen, onClose, selectedDate }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Leave requested for ${selectedDate}\nReason: ${reason}`);
    onClose();
    setReason("");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Apply Leave / Raise Concern
            </Dialog.Title>
            <button onClick={onClose}>
              <X className="text-gray-500 hover:text-red-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Date
              </label>
              <input
                type="text"
                value={selectedDate}
                readOnly
                className="w-full border rounded px-3 py-2 mt-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason / Concern
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ApplyLeaveModal;
