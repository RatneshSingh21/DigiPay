import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ShieldCheck,
  FileText,
  FolderOpen,
  Settings,
  Fingerprint,
  ClipboardList,
  Scale,
  Wallet,
  UserCheck,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";

import AdminSidebarItem from "./AdminSidebarItem";
import assets from "../../../assets/assets";
import { Link } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={15} />,
    to: "/admin-dashboard/dashboard",
    collapseOnClick: false,
  },
  {
    label: "Employees",
    icon: <Users size={15} />,
    to: "/admin-dashboard/employees",
    collapseOnClick: true,
  },
  // {
  //   label: "Salary",
  //   icon: <IndianRupee size={15} />,
  //   to: "/admin-dashboard/salary",
  //   collapseOnClick: true,
  // },
  {
    label: "Payschedule & Shifts",
    icon: <CalendarDays size={15} />,
    to: "/admin-dashboard/payschedule-shifts",
    collapseOnClick: false,
  },
  {
    label: "Role",
    icon: <BadgeCheck size={15} />,
    to: "/admin-dashboard/role",
    collapseOnClick: true,
  },
  {
    label: "Leave",
    icon: <ClipboardList size={15} />,
    to: "/admin-dashboard/leave",
    collapseOnClick: true,
  },
  {
    label: "Policy",
    icon: <Scale size={15} />,
    to: "/admin-dashboard/policy",
    collapseOnClick: true,
  },
  {
    label: "Compliance",
    icon: <ShieldCheck size={15} />,
    to: "/admin-dashboard/compliance",
    collapseOnClick: true,
  },
  {
    label: "Attendance",
    icon: <Fingerprint size={15} />,
    to: "/admin-dashboard/attendance",
    collapseOnClick: true,
  },
  {
    label: "Reports",
    icon: <FolderOpen size={15} />,
    to: "/admin-dashboard/reports",
    collapseOnClick: true,
  },
  {
    label: "Letters",
    icon: <FileText size={15} />,
    to: "/admin-dashboard/letters",
    collapseOnClick: true,
  },
  {
    label: "Expenses",
    icon: <Wallet size={15} />,
    to: "/admin-dashboard/expenses",
    collapseOnClick: true,
  },
  {
    label: "Approvals",
    icon: <UserCheck size={15} />,
    to: "/admin-dashboard/approvals",
    collapseOnClick: true,
  },
  {
    label: "Settings",
    icon: <Settings size={15} />,
    to: "/admin-dashboard/settings",
    collapseOnClick: true,
  },
];

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={`text-white fixed top-0 left-0 max-h-[100vh] z-30 shadow-md transition-all duration-300 ${
        collapsed ? "w-16" : "w-52"
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-center bg-white h-[9vh]">
        <div className="flex items-center">
          <img src={assets.logo} alt="DigiCode Logo" className="w-8 h-8" />
          {!collapsed && (
            <Link to="/" className="text-orange-500 text-xl font-bold">
              Digi<span className="text-black">Pay</span>
            </Link>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="bg-secondary h-[90vh] pt-5 m-1 rounded-md">
        <nav className="px-2 rounded-sm text-lg">
          {menuItems.map((item) => (
            <AdminSidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
              to={item.to}
              onClick={() => {
                if (item.collapseOnClick) {
                  setCollapsed(true);
                }
              }}
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

export default AdminSidebar;
