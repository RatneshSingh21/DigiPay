import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineSquares2X2,
  HiOutlineIdentification,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const settingsItems = [
  { label: "Organisation Profile", path: "organisation-profile", icon: <HiOutlineBuildingOffice2 /> },
  { label: "Work Locations", path: "work-locations", icon: <HiOutlineMapPin /> },
  { label: "Departments", path: "departments", icon: <HiOutlineSquares2X2 /> },
  { label: "Designations", path: "designation", icon: <HiOutlineIdentification /> },
  { label: "Salary", path: "salary", icon: <HiOutlineBanknotes /> },
  { label: "Pay Schedule", path: "payschedule", icon: <HiOutlineCalendarDays /> },
  { label: "Shifts", path: "shifts", icon: <HiOutlineCalendarDays /> },
  { label: "Permissions", path: "permissions", icon: <HiOutlineCheckCircle /> },
];

const AdminSettingsDrawer = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.split("/").pop();
  const activeRef = useRef(null); // for auto-scroll

  // Auto-scroll to the active item when the drawer opens
  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-screen w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 cursor-pointer hover:text-red-500 transition-colors duration-150"
          >
            <IoClose />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {settingsItems.map((item) => {
            const isActive = current === item.path;
            return (
              <button
                key={item.path}
                ref={isActive ? activeRef : null}
                onClick={() => {
                  navigate(`/admin-dashboard/settings/${item.path}`);
                  onClose();
                }}
                className={`flex items-center cursor-pointer w-full gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  ${
                    isActive
                      ? "bg-primary text-white shadow"
                      : "text-gray-700 dark:text-white hover:bg-primary hover:text-white"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsDrawer;
