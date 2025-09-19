import React, { useState, useEffect, useRef } from "react";
import {
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaSignOutAlt as FaLogout,
} from "react-icons/fa";
import { RiBellFill } from "react-icons/ri";
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

    // Auto refresh every 30 sec (optional)
    const interval = setInterval(fetchApprovals, 30000);
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
      <nav className="sticky top-0 w-full h-14 bg-white shadow-sm z-20 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-primary">
              {companyName}
            </span>
            <span className="text-xs text-gray-500 -mt-1">
              Payroll Software
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Icon */}
          <div className="relative" ref={notificationRef}>
            <button
              className="w-14 h-14 flex items-center cursor-pointer justify-center text-gray-600 hover:text-black relative notification-btn rounded-full"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <RiBellFill className="text-lg" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Settings Icon */}
          <button
            className="text-gray-600 cursor-pointer hover:text-black"
            onClick={() => setAdminDrawerOpen(true)}
          >
            <FaCog />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center cursor-pointer gap-2"
            >
              <img
                src={user?.profilePicture || "https://i.pravatar.cc/300"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <FaChevronDown className="text-sm text-gray-600" />
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-30">
                <button
                  className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
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
                  className="w-full text-left px-4 py-2 cursor-pointer text-red-500 hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            className="text-gray-600 cursor-pointer hover:text-red-600"
            title="Logout"
            onClick={handleLogout}
          >
            <FaLogout />
          </button>
        </div>
      </nav>

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
