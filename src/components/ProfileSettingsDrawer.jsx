import { IoClose } from "react-icons/io5";
import ProfileSettings from "./ProfileSettings";

const ProfileSettingsDrawer = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 h-screen bg-black/20 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`absolute top-0 right-0 h-screen w-80 bg-white dark:bg-gray-900 shadow-xl rounded-l-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-red-500"
          >
            <IoClose />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 text-sm flex-1">
          <ProfileSettings />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsDrawer;
