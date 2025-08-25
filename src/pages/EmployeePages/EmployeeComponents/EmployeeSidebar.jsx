import {
  MdHome,
  MdOutlineRequestQuote,
  MdOutlineBadge,
  MdOutlineCalendarMonth,
  MdSettings,
} from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BsPersonCircle } from "react-icons/bs";
import { RiTimeLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import assets from "../../../assets/assets";
import EmployeeSidebarItem from "./EmployeeSidebarItem";

const menuItems = [
  {
    label: "Home",
    icon: <MdHome />,
    to: "/employee-dashboard/home",
  },
  {
    label: "My Attendance",
    icon: <RiTimeLine />,
    to: "/employee-dashboard/attendance",
  },
  {
    label: "Salary Slip",
    icon: <MdOutlineRequestQuote />,
    to: "/employee-dashboard/salary-slip",
  },
  {
    label: "Leave Balance",
    icon: <HiOutlineClipboardList />,
    to: "/employee-dashboard/leave",
  },
  {
    label: "Advance Payment",
    icon: <MdOutlineBadge />,
    to: "/employee-dashboard/advance-payment",
  },
  {
    label: "On Duty (OD)",
    icon: <MdOutlineCalendarMonth />,
    to: "/employee-dashboard/on-duty",
  },
  {
    label: "My Profile",
    icon: <BsPersonCircle />,
    to: "/employee-dashboard/profile",
  },
  {
    label: "Settings",
    icon: <MdSettings />,
    to: "/employee-dashboard/settings",
  },
];

const EmployeeSidebar = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={`text-white fixed top-0 left-0 h-screen z-30 shadow-md transition-all duration-300 ${
        collapsed ? "w-16" : "w-52"
      } md:${collapsed ? "w-16" : "w-52"}`}
    >
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

      <div className="absolute bottom-0 left-0 w-full">
        <button
          className="w-full py-2 text-sm text-center bg-primary hover:bg-gray-500"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➤" : "⮜ Collapse"}
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
