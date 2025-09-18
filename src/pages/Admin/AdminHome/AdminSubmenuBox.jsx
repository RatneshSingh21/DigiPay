import { Link, useLocation } from "react-router-dom";

// Icons
import {
  FaUserPlus,
  FaList,
  FaBuilding,
  FaUserCheck,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaUmbrellaBeach,
  FaGlobeAmericas,
  FaFileAlt,
  FaCogs,
  FaBalanceScale,
} from "react-icons/fa";
import {
  MdAdminPanelSettings,
  MdCelebration,
  MdOutlineCorporateFare,
  MdOutlineMap,
  MdOutlineRequestPage,
  MdOutlineTrackChanges,
} from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { AiOutlineSchedule } from "react-icons/ai";
import { BiTimeFive } from "react-icons/bi";
import { HiOutlineBriefcase, HiOutlineDocumentReport } from "react-icons/hi";
import { TbCurrencyRupee, TbReportMoney } from "react-icons/tb";
import { FaGears } from "react-icons/fa6";

// Label to path mapping
const labelToPath = {
  "Add Employee": "add",
  "Employee List": "list",
  "General Imports": "general-imports",
  "General Settings": "general-settings",
  "Organisation Profile": "organisation-profile",
  Departments: "departments",
  "Work Locations": "work-locations",
  Permissions: "permissions",
  PaySchedule: "payschedule",
  Shifts: "shifts",
  Designation: "designation",
  "Salary Configuration": "salary",
  "Status Master": "status-master",
  "Role Master": "role-master",
  "Role Approval": "role-approval",
  "Emp. Role Mapping": "emp-role-mapping",
  "Attendance Report": "attendance-report",
  "Payroll Report": "payroll-report",
  "Salary Register": "salary-register",
  Attendance: "attendance",
  "Payslip Templates": "payslip-templates",
  "Leave Types": "leave-types",
  "Leave Mapping": "leave-mapping",
  "Leave Requests": "leave-requests",
  "Leave Balance": "leave-balance",
  "Holiday List": "holiday-list",
  "Policy Details": "policy-details",
  "PF Settings": "pf-settings",
  "Weekend Policy": "weekend-policy",
  "Compliance Details": "compliance-details",
  "Compliance Rules": "compliance-rules",
};

// Label to icon mapping
const labelToIcon = {
  "Add Employee": <FaUserPlus className="mr-2" />,
  "Employee List": <FaList className="mr-2" />,
  "General Imports": <FaGlobeAmericas className="mr-2" />,
  "General Settings": <FaGears className="mr-2" />,
  "Organisation Profile": <FaBuilding className="mr-2" />,
  Departments: <MdOutlineCorporateFare className="mr-2" />,
  "Work Locations": <GoLocation className="mr-2" />,
  Permissions: <RiShieldKeyholeLine className="mr-2" />,
  PaySchedule: <AiOutlineSchedule className="mr-2" />,
  Shifts: <BiTimeFive className="mr-2" />,
  Designation: <HiOutlineBriefcase className="mr-2" />,
  "Role Master": <MdAdminPanelSettings className="mr-2" />,
  "Role Approval": <MdAdminPanelSettings className="mr-2" />,
  "Emp. Role Mapping": <MdAdminPanelSettings className="mr-2" />,
  "Status Master": <MdOutlineTrackChanges className="mr-2" />,
  "Salary Configuration": <TbCurrencyRupee className="mr-2" />,
  "Attendance Report": <FaCalendarCheck className="mr-2" />,
  "Payroll Report": <FaFileInvoiceDollar className="mr-2" />,
  "Salary Register": <TbReportMoney className="mr-2" />,
  Attendance: <FaUserCheck className="mr-2" />,
  "Payslip Templates": <HiOutlineDocumentReport className="mr-2" />,
  "Leave Types": <FaUmbrellaBeach className="mr-2" />,
  "Leave Mapping": <MdOutlineMap className="mr-2" />,
  "Leave Requests": <MdOutlineRequestPage className="mr-2" />,
  "Leave Balance": <FaBalanceScale className="mr-2" />,
  "Holiday List": <MdCelebration className="mr-2" />,
  "Policy Details": <FaFileAlt className="mr-2" />,
  "PF Settings": <FaCogs className="mr-2" />,
  "Weekend Policy": <FaUmbrellaBeach className="mr-2" />,
  "Compliance Details": <FaFileAlt className="mr-2" />,
  "Compliance Rules": <FaBalanceScale className="mr-2" />,
};

const AdminSubmenuBox = ({ items, selectedMenu }) => {
  const location = useLocation();
  const base = `/admin-dashboard/${selectedMenu.toLowerCase()}`;

  return (
    <div className="bg-white border-r p-4 h-full w-52 fixed shadow-md">
      <h3 className="text-xl font-semibold mb-3 text-gray-700">
        {selectedMenu}
      </h3>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => {
          const path = `${base}/${
            labelToPath[item] || item.toLowerCase().replace(/\s+/g, "-")
          }`;
          const isActive = location.pathname === path;
          const icon = labelToIcon[item] || null;

          return (
            <li key={idx}>
              <Link
                to={path}
                className={`flex items-center p-2 text-xs rounded transition-all duration-200 ${
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
