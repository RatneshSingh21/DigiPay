import React, { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaSignOutAlt as FaLogout,
} from "react-icons/fa";
import useAuthStore from "../../../store/authStore";
import ProfileSettingsDrawer from "../../../components/ProfileSettingsDrawer";
import AdminSettingsDrawer from "./AdminSettingsDrawer";

const AdminNavbar = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false); // ✅ for profile
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false); // ✅ for admin settings
  const profileRef = useRef();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Close profile menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 w-full h-14 bg-white shadow-sm z-20 flex items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm">Digi Payroll</span>
            <span className="text-xs text-gray-500 -mt-1">
              Payroll Software
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Trial Warning */}
          <div className="text-xs text-red-600 hidden md:block">
            Your 7-day free trial ends in 2 days.{" "}
            <button className="text-blue-600 hover:underline">Upgrade</button>
          </div>

          {/* Notification Icon */}
          <button className="text-gray-600 hover:text-black relative">
            <FaBell />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping" />
          </button>

          {/* Settings Cog Icon (optional) */}
          <button
            className="text-gray-600 hover:text-black"
            onClick={() => setAdminDrawerOpen(true)}
          >
            <FaCog />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2"
            >
              <img
                src={user?.profilePicture || "https://i.pravatar.cc/300"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <FaChevronDown className="text-sm text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-30">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => {
                    setProfileDrawerOpen(true); // ✅ now opens profile drawer
                    setProfileMenuOpen(false);
                  }}
                >
                  Profile Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Logout Icon */}
          <button
            className="text-gray-600 hover:text-red-600"
            title="Logout"
            onClick={logout}
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
