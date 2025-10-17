import { useEffect } from "react";

const ModalOverlay = ({ isOpen, children, onClose, title }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null; // Only render if open

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded shadow-lg p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-red-600 text-xl"
        >
          &times;
        </button>

        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

        {children}
      </div>
    </div>
  );
};

export default ModalOverlay;
