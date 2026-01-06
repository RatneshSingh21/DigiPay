import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import useAuthStore from "../../../store/authStore";
import ProfileSettingsDrawer from "../../../components/ProfileSettingsDrawer";
import { useNavigate } from "react-router-dom";

const EmployeeNavbar = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const profileRef = useRef();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loginRole");
    logout();
    navigate("/");
  };

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
      <nav className="sticky top-0 w-full h-14 bg-white shadow-sm z-20 flex items-center justify-between px-4 md:px-6">
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm">Employee Dashboard</span>
          <span className="text-xs text-gray-500 mt-0.5">
            Welcome, {user?.fullName || "User"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-black relative cursor-pointer">
            <FaBell />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping" />
          </button>

          <button className="text-gray-600 hover:text-black cursor-pointer">
            <FaCog onClick={() => setProfileDrawerOpen(true)} />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center cursor-pointer gap-2"
            >
              <img
                src={user?.profileImageUrl || "https://i.pravatar.cc/300"}
                alt="Profile"
                className="w-9 h-9 rounded-full object-contain bg-gray-300 border-2 border-transparent group-hover:border-primary transition"
              />
              <FaChevronDown className="text-sm text-gray-600" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white cursor-pointer shadow-lg rounded-md py-2 z-30">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                  className="w-full text-left cursor-pointer px-4 py-2 text-red-500 hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <ProfileSettingsDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
    </>
  );
};

export default EmployeeNavbar;
