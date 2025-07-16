import { Link, useLocation } from "react-router-dom";

// Icons
import { FaUserPlus, FaList, FaUsers, FaBuilding } from "react-icons/fa";
import { MdOutlineCorporateFare } from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { AiOutlineSchedule } from "react-icons/ai";
import { BiTimeFive } from "react-icons/bi";
import { HiOutlineBriefcase } from "react-icons/hi";
import { TbCurrencyRupee } from "react-icons/tb";
import { FaCalendarCheck, FaMoneyCheckAlt, FaCalendarTimes } from "react-icons/fa";

// Label to path mapping
const labelToPath = {
  "Add Employee": "add",
  "Employee List": "list",
  "Teams": "teams",
  "Organisation Profile": "organisation-profile",
  "Departments": "departments",
  "Work Locations": "work-locations",
  "Permissions": "permissions",
  "PaySchedule": "payschedule",
  "Shifts": "shifts",
  "Designation": "designation",
  "Salary": "salary",
  "Attendance Report": "attendance",
  "Payroll Report": "payroll",
  "Leave Report": "leave",
};

// Label to icon mapping
const labelToIcon = {
  "Add Employee": <FaUserPlus className="mr-2" />,
  "Employee List": <FaList className="mr-2" />,
  "Teams": <FaUsers className="mr-2" />,
  "Organisation Profile": <FaBuilding className="mr-2" />,
  "Departments": <MdOutlineCorporateFare className="mr-2" />,
  "Work Locations": <GoLocation className="mr-2" />,
  "Permissions": <RiShieldKeyholeLine className="mr-2" />,
  "PaySchedule": <AiOutlineSchedule className="mr-2" />,
  "Shifts": <BiTimeFive className="mr-2" />,
  "Designation": <HiOutlineBriefcase className="mr-2" />,
  "Salary": <TbCurrencyRupee className="mr-2" />,
  "Attendance Report": <FaCalendarCheck className="mr-2" />,
  "Payroll Report": <FaMoneyCheckAlt className="mr-2" />,
  "Leave Report": <FaCalendarTimes className="mr-2" />,
};

const AdminSubmenuBox = ({ items, selectedMenu }) => {
  const location = useLocation();
  const base = `/admin-dashboard/${selectedMenu.toLowerCase()}`;

  return (
    <div className="bg-white border-r p-4 h-full w-52 fixed shadow-md">
      <h3 className="text-xl font-semibold mb-3 text-gray-700">{selectedMenu}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => {
          const path = `${base}/${labelToPath[item] || item.toLowerCase().replace(/\s+/g, "-")}`;
          const isActive = location.pathname === path;
          const icon = labelToIcon[item] || null;

          return (
            <li key={idx}>
              <Link
                to={path}
                className={`flex items-center p-2 rounded transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white text-gray-700"
                }`}
              >
                {icon}
                {item}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdminSubmenuBox;