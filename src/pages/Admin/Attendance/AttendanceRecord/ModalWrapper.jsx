import React from "react";
import { FiX } from "react-icons/fi";

const ModalWrapper = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-600 bg-gray-100 hover:bg-red-100 rounded hover:text-red-600 text-xl"
        >
          <FiX />
        </button>

        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
