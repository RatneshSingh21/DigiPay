import React, { useState, useEffect, useRef } from "react";
import {
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaSignOutAlt as FaLogout,
} from "react-icons/fa";
import { RiBellFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../../store/authStore";
import ProfileSettingsDrawer from "../../../components/ProfileSettingsDrawer";
import AdminSettingsDrawer from "./AdminSettingsDrawer";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import NotificationPanel from "./NotificationPanel";

const AdminNavbar = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Loading...");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef();
  const notificationRef = useRef();

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const companyId = useAuthStore((state) => state.companyId);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loginRole");
    logout();
    navigate("/");
  };

  // 🔹 Fetch company
  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      try {
        const response = await axiosInstance.get(`/Company/${companyId}`);
        setCompanyName(response.data.companyName || "My Company");
      } catch {
        setCompanyName("My Company");
      }
    };
    fetchCompany();
  }, [companyId]);

  // 🔹 Fetch notifications
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await axiosInstance.get(`/ApprovalMaster`);
        setNotifications(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchApprovals();

    const interval = setInterval(fetchApprovals, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target) &&
        !e.target.closest(".notification-btn")
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 w-full h-14 bg-white/70 backdrop-blur-md shadow-sm z-20 flex items-center justify-between px-4 md:px-6 border-b border-gray-200">
        {/* Company Branding */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-primary tracking-wide">
              {companyName}
            </span>
            <span className="text-xs text-gray-500 -mt-1">
              Payroll Software
            </span>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center">
          {/* Notification Icon */}
          <div className="relative" ref={notificationRef}>
            <button
              className="flex items-center cursor-pointer justify-center text-gray-600 hover:text-black relative notification-btn p-2 rounded-full hover:bg-gray-200 transition"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <RiBellFill className="text-xl" />
              {notifications.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse"
                >
                  {notifications.length}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2"
                >
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings Icon */}
          <button
            className="text-gray-600 cursor-pointer hover:text-black p-2 rounded-full hover:bg-gray-200 transition"
            onClick={() => setAdminDrawerOpen(true)}
          >
            <FaCog />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center cursor-pointer gap-2 group"
            >
              <img
                src={user?.profilePicture || "https://i.pravatar.cc/300"}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition"
              />
              <FaChevronDown className="text-sm text-gray-600 group-hover:text-primary transition" />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl py-2 z-30 border border-gray-100"
                >
                  <button
                    className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm transition"
                    onClick={() => {
                      setProfileDrawerOpen(true);
                      setProfileMenuOpen(false);
                    }}
                  >
                    Profile Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 cursor-pointer text-red-500 hover:bg-red-200 text-sm flex items-center gap-2 transition"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Direct Logout Button */}
          <button
            className="text-gray-600 cursor-pointer hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
            title="Logout"
            onClick={handleLogout}
          >
            <FaLogout />
          </button>
        </div>
      </nav>

      {/* Drawers */}
      <ProfileSettingsDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
      <AdminSettingsDrawer
        isOpen={adminDrawerOpen}
        onClose={() => setAdminDrawerOpen(false)}
      />
    </>
  );
};

export default AdminNavbar;
