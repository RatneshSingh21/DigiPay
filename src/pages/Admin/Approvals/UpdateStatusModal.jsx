import React, { useState } from "react";

const UpdateStatusModal = ({ isOpen, onClose, onSubmit, currentStatus }) => {
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(comments);
    setComments(""); // Reset after submit
  };

  return (
    <div className="fixed inset-x-0 top-16 flex justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-96 p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Update Status
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Current Status: <strong>{currentStatus}</strong>
        </p>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md mb-4 text-sm resize-none"
          placeholder="Enter comments (optional)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 cursor-pointer rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium"
            onClick={handleSubmit}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
