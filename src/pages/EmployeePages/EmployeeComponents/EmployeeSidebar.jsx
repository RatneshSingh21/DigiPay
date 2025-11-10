import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaClipboardList,
  FaHandHoldingUsd,
  FaCalendarAlt,
  FaUserCircle,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaTrain,
} from "react-icons/fa";
import { RiUserStarFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import assets from "../../../assets/assets";
import EmployeeSidebarItem from "./EmployeeSidebarItem";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmployeeSidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuthStore();
  const [hasApprovalAccess, setHasApprovalAccess] = useState(false);

  const menuItems = [
    { label: "Home", icon: <FaHome />, to: "/employee-dashboard/home" },
    {
      label: "My Attendance",
      icon: <FaCalendarCheck />,
      to: "/employee-dashboard/attendance",
    },
    {
      label: "Salary Slip",
      icon: <FaMoneyCheckAlt />,
      to: "/employee-dashboard/salary-slip",
    },
    {
      label: "Leave Balance",
      icon: <FaClipboardList />,
      to: "/employee-dashboard/leave",
    },
    {
      label: "Advance Payment",
      icon: <FaHandHoldingUsd />,
      to: "/employee-dashboard/advance-payment",
    },
    {
      label: "On Duty (OD)",
      icon: <FaCalendarAlt />,
      to: "/employee-dashboard/on-duty",
    },
    {
      label: "My Profile",
      icon: <FaUserCircle />,
      to: "/employee-dashboard/profile",
    },
    {
      label: "Mark Attendance",
      icon: <RiUserStarFill />,
      to: "/employee-dashboard/mark-attendance",
    },
    {
      label: "My Expenses",
      icon: <FaFileInvoiceDollar />,
      to: "/employee-dashboard/my-expenses",
    },
    {
      label: "My Documents",
      icon: <FaFileAlt />,
      to: "/employee-dashboard/my-documents",
    },
    {
      label: "Travel Details",
      icon: <FaTrain />,
      to: "/employee-dashboard/travel-details",
    },
  ];

  // Conditionally add Approvals tab if user has mapping
  if (hasApprovalAccess) {
    menuItems.push({
      label: "Approvals",
      icon: <FaClipboardList />,
      to: "/employee-dashboard/approvals",
    });
  }

  useEffect(() => {
    const fetchRoleMapping = async () => {
      try {
        const res = await axiosInstance.get("/EmployeeRoleMapping");
        const mappings = res.data;

        // Check if logged-in employeeId exists in mapping list
        const found = mappings.some(
          (m) => m.employeeId === Number(user?.userId)
        );

        setHasApprovalAccess(found);
      } catch (error) {
        console.error("Error fetching employee role mapping:", error);
      }
    };

    if (user?.userId) {
      fetchRoleMapping();
    }
  }, [user]);

  return (
    <aside
      className={`text-white fixed top-0 left-0 h-screen z-30 shadow-md transition-all duration-300 ${
        collapsed ? "w-16" : "w-52"
      } md:${collapsed ? "w-16" : "w-52"}`}
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-center bg-white">
        <div className="flex items-center">
          <img src={assets.logo} alt="Logo" className="w-8 h-8" />
          {!collapsed && (
            <Link to="/" className="text-orange-500 text-xl font-bold">
              Digi<span className="text-black">Pay</span>
            </Link>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-secondary h-full pt-5 m-1 rounded-md">
        <nav className="px-2">
          {menuItems.map((item) => (
            <EmployeeSidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
              to={item.to}
            />
          ))}
        </nav>
      </div>

      {/* Collapse Button */}
      <div className="absolute bottom-0 left-0 w-full">
        <button
          className="w-full py-2 text-sm text-center cursor-pointer bg-primary hover:bg-gray-500"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➤" : "⮜ Collapse"}
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
