import React, { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaSignOutAlt as FaLogout,
} from "react-icons/fa";
import useAuthStore from "../../../store/authStore";


const AdminNavbar = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef();
  const logout = useAuthStore((state) => state.logout); // ✅ Get logout method

  // Close dropdown on outside click
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
      {/* Left Section: Logo/Brand */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm">Digi Payroll</span>
          <span className="text-xs text-gray-500 -mt-1">Payroll Software</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Trial warning */}
        <div className="text-xs text-red-600 hidden md:block">
          Your 7-day free trial ends in 2 days.{" "}
          <button className="text-blue-600 hover:underline">Upgrade</button>
        </div>

        {/* Icons */}
        <button className="text-gray-600 hover:text-black relative">
          <FaBell />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping" />
        </button>

        <button className="text-gray-600 hover:text-black">
          <FaCog />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2"
          >
            <img
              src="https://i.pravatar.cc/300"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <FaChevronDown className="text-sm text-gray-600" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-30">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                Settings
              </button>
              <hr className="my-1" />
              <button
                onClick={logout} // ✅ Logout from dropdown
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 text-sm flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Logout Icon (outside dropdown) */}
        <button
          className="text-gray-600 hover:text-red-600"
          title="Logout"
          onClick={logout} // ✅ Logout from navbar icon
        >
          <FaLogout />
        </button>
      </div>
    </nav>

    
    </>
  );
};

export default AdminNavbar;
