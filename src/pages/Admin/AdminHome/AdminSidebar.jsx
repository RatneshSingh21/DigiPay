import { AiFillDashboard, AiFillSetting } from "react-icons/ai";
import { RiArticleFill, RiFolderOpenFill } from "react-icons/ri";
import { FaClipboardCheck, FaBusinessTime, FaUsers } from "react-icons/fa";
import { IoDocuments } from "react-icons/io5";
import {
  MdAdminPanelSettings,
  MdChecklistRtl,
  MdEventAvailable,
  MdPolicy,
} from "react-icons/md";
import AdminSidebarItem from "./AdminSidebarItem";
import assets from "../../../assets/assets";
import { Link } from "react-router-dom";


const menuItems = [
  {
    label: "Dashboard",
    icon: <AiFillDashboard />,
    to: "/admin-dashboard/dashboard",
    collapseOnClick: false,
  },
  {
    label: "Employees",
    icon: <FaUsers />,
    to: "/admin-dashboard/employees",
    collapseOnClick: true,
  },
  {
    label: "Payschedule",
    icon: <RiArticleFill />,
    to: "/admin-dashboard/payschedule",
    collapseOnClick: false,
  },
  {
    label: "Role",
    icon: <MdAdminPanelSettings />,
    to: "/admin-dashboard/role",
    collapseOnClick: true,
  },
  {
    label: "Shifts",
    icon: <FaBusinessTime />,
    to: "/admin-dashboard/shifts",
    collapseOnClick: true,
  },
  {
    label: "Leave",
    icon: <MdEventAvailable />,
    to: "/admin-dashboard/leave",
    collapseOnClick: true,
  },
  {
    label: "Policy",
    icon: <MdPolicy />,
    to: "/admin-dashboard/policy",
    collapseOnClick: true,
  },
  {
    label: "Compliance",
    icon: <FaClipboardCheck />,
    to: "/admin-dashboard/compliance",
    collapseOnClick: true,
  },
   {
    label: "Attendance",
    icon: <MdChecklistRtl />,
    to: "/admin-dashboard/attendance",
    collapseOnClick: true,
  },
  {
    label: "Reports",
    icon: <RiFolderOpenFill />,
    to: "/admin-dashboard/reports",
    collapseOnClick: true,
  },
  {
    label: "Documents",
    icon: <IoDocuments />,
    to: "/admin-dashboard/documents",
    collapseOnClick: true,
  },
  {
    label: "Settings",
    icon: <AiFillSetting />,
    to: "/admin-dashboard/settings",
    collapseOnClick: true,
  },
];

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={`text-white fixed top-0 left-0 h-screen z-30 shadow-md transition-all duration-300 ${
        collapsed ? "w-16" : "w-52"
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-center bg-white">
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
      <div className="bg-secondary h-full pt-5 m-1 rounded-md">
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
