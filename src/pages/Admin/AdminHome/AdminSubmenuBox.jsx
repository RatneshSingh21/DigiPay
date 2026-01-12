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
  FaExchangeAlt,
  FaProjectDiagram,
  FaBriefcase,
  FaClock,
  FaRegClock,
  FaCalculator,
} from "react-icons/fa";
import {
  MdAdminPanelSettings,
  MdCelebration,
  MdGavel,
  MdOutlineChecklistRtl,
  MdOutlineCorporateFare,
  MdOutlineMap,
  MdOutlineRequestPage,
  MdOutlineTrackChanges,
  MdPersonAddAlt1,
  MdPunchClock,
  MdWorkOutline,
} from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { GiBookCover } from "react-icons/gi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { AiFillDashboard, AiOutlinePlusCircle, AiOutlineSchedule } from "react-icons/ai";
import { BiTimeFive } from "react-icons/bi";
import { HiOutlineBriefcase, HiOutlineDocumentReport } from "react-icons/hi";
import {
  TbCalendarStats,
  TbCurrencyRupee,
  TbReportMoney,
  TbMathFunction,
  TbDeviceWatch,
} from "react-icons/tb";
import { FaGears } from "react-icons/fa6";
import { BsBriefcase, BsCashStack, BsPeople } from "react-icons/bs";


// Label to path mapping
const labelToPath = {
  // Employee
  "Add Employee": "add",
  "Employee List": "list",
  "Basic Salary": "employee-salary-basic",
  "Employee Salary": "employee-salary-details",
  "Salary Calculation": "employee-salary-calculation",
  "Emp Category": "emp-category",
  "Employment Type": "emp-employmenttype",
  "Work Type": "emp-worktype",
  "Work Nature": "emp-worknature",
  "General Imports": "general-imports",
  "General Settings": "general-settings",
  "FullEmployee Data": "fullemployee-data",

  //Shifts
  "Add Shift": "add-shift",
  "Shift Mapping": "mapp-shift",

  //Attendance
  Attendance: "attendance",
  "Add Attendance": "add-attendance",
  "Manual Attendance": "manual-attendance",
  Punch: "punch",
  "Attendance Policy": "atten-policy",
  "Attendance Record": "atten-record",
  "Attendance Calculation": "atten-calculation",
  "Attendance Report": "attendance-report",
  "Attendance Machine": "attendance-machine",
  "Emp Machine Mapping": "emp-machine-mapping",
  "Machine Data Log": "machine-data-log",

  // Settings
  "Organisation Profile": "organisation-profile",
  "Create Admin": "create-admin",
  "Create From Employee": "create-from-employee",
  Departments: "departments",
  Designation: "designation",
  "Work Locations": "work-locations",
  Permissions: "permissions",
  PaySchedule: "payschedule",
  Shifts: "shifts",
  "Salary Configuration": "salary",
  "Status Master": "status-master",
  "Salary Calculation Type": "salary-calculation-type",

  // Role
  "Role Master": "role-master",
  "Role Approval": "role-approval",
  "Emp. Role Mapping": "emp-role-mapping",

  // Reports
  "Salary Register": "salary-register",
  "Payslip Templates": "payslip-templates",
  "Letter of Intent": "letter-intent",
  "Offer Letter": "offer-letter",
  "Appointment Letter": "appointment-certi",
  "Confirmation Letter": "confirmation-certi",
  "Increment Letter": "increment-letter",
  "Promotion Letter": "promotion-letter",
  "Relieving Letter": "relieving-letter",
  "Experience Cert.": "experience-certi",
  "Nomination-Declaration": "nomination-declaration",
  "Job Posting": "job-posting",
  "Full & Final Statement": "full-&-final-statement",
  "HR Dashboard": "all-reports",

  // Leave
  "Leave Types": "leave-types",
  "Leave Mapping": "leave-mapping",
  "Leave Requests": "leave-requests",
  "Leave Balance": "leave-balance",
  "Holiday List": "holiday-list",
  "Employee Leave": "employee-leave",
  "Leave Allocation": "employee-leave-allocation",
  "Advance Payments": "employee-advance-payments",

  // Policies
  "PF Settings": "pf-settings",
  "PF Transaction": "pf-transaction",
  "PF Contribution Rule": "pf-contribution-rule",
  "ESI Rules": "esi-rule",
  "ESI Transactions": "esi-transaction",
  "Late Policy": "late-policy",
  "Leave Policy": "policy-leave",
  "Weekend Policy": "weekend-policy",
  "Policy Details": "policy-details",

  // Documents
  "Expense Header": "expense-header",
  "Uploaded Documents": "uploaded-documents",
  "Expense Documents": "expense-documents",
  "Travel Details": "travel-details",

  // Compliance
  "Payment Adjustment Policy": "payment-adjustment",
  "OT Master": "otrate",
  "OT Rule": "otrate-rules",
  "OT Calculation": "otrate-calculation",
  "OT Permission" : "ot-permission"
};

// Label to icon mapping
const labelToIcon = {
  // Employee
  "Add Employee": <FaUserPlus className="mr-2" />,
  "Employee List": <FaList className="mr-2" />,
  "Basic Salary": <BsCashStack className="mr-2" />,
  "Employee Salary": <BsCashStack className="mr-2" />,
  "Salary Calculation": <TbCurrencyRupee className="mr-2" />,
  "Emp Category": <BsPeople className="mr-2" />,
  "Employment Type": <BsBriefcase className="mr-2" />,
  "Work Type": <MdWorkOutline className="mr-2" />,
  "Work Nature": <FaBriefcase className="mr-2" />,
  "General Imports": <FaGlobeAmericas className="mr-2" />,
  "General Settings": <FaGears className="mr-2" />,
  "FullEmployee Data": <FaUserPlus className="mr-2" />,

  // Shifts
  "Add Shift": <AiOutlinePlusCircle className="mr-2" />,
  "Shift Mapping": <FaProjectDiagram className="mr-2" />,

  // Attendance
  Attendance: <FaUserCheck className="mr-2" />,
  "Add Attendance": <TbCalendarStats className="mr-2" />,
  "Manual Attendance": <TbCalendarStats className="mr-2" />,
  Punch: <MdPunchClock className="mr-2" />,
  "Attendance Policy": <MdPunchClock className="mr-2" />,
  "Attendance Record": <FaCalendarCheck className="mr-2" />,
  "Attendance Calculation": <FaCalculator className="mr-2" />,
  "Attendance Report": <FaCalendarCheck className="mr-2" />,
  "Attendance Machine": <TbDeviceWatch className="mr-2" />,
  "Emp Machine Mapping": <TbDeviceWatch className="mr-2" />,
  "Machine Data Log": <TbDeviceWatch className="mr-2" />,

  // Documents
  "Expense Header": <FaFileAlt className="mr-2" />,
  "Uploaded Documents": <FaFileAlt className="mr-2" />,
  "Expense Documents": <FaFileAlt className="mr-2" />,
  "Travel Details": <FaFileAlt className="mr-2" />,

  // Settings
  "Organisation Profile": <FaBuilding className="mr-2" />,
  "Create Admin": <MdPersonAddAlt1 className="mr-2" />,
  "Create From Employee": <MdPersonAddAlt1 className="mr-2" />,
  Departments: <MdOutlineCorporateFare className="mr-2" />,
  Designation: <HiOutlineBriefcase className="mr-2" />,
  "Work Locations": <GoLocation className="mr-2" />,
  Permissions: <RiShieldKeyholeLine className="mr-2" />,
  PaySchedule: <AiOutlineSchedule className="mr-2" />,
  Shifts: <BiTimeFive className="mr-2" />,
  "Salary Configuration": <TbCurrencyRupee className="mr-2" />,
  "Status Master": <MdOutlineTrackChanges className="mr-2" />,
  "LetterField Master": <HiOutlineDocumentReport className="mr-2" />,
  "Salary Calculation Type": <TbMathFunction className="mr-2" />,

  // Role
  "Role Master": <MdAdminPanelSettings className="mr-2" />,
  "Role Approval": <MdAdminPanelSettings className="mr-2" />,
  "Emp. Role Mapping": <MdAdminPanelSettings className="mr-2" />,

  // Reports
  "Salary Register": <TbReportMoney className="mr-2" />,
  "Payslip Templates": <HiOutlineDocumentReport className="mr-2" />,
  "Letter of Intent": <FaFileAlt className="mr-2" />,
  "Offer Letter": <FaFileAlt className="mr-2" />,
  "Appointment Letter": <FaFileAlt className="mr-2" />,
  "Confirmation Letter": <FaFileAlt className="mr-2" />,
  "Increment Letter": <FaFileAlt className="mr-2" />,
  "Promotion Letter": <FaFileAlt className="mr-2" />,
  "Relieving Letter": <FaFileAlt className="mr-2" />,
  "Experience Cert.": <FaFileInvoiceDollar className="mr-2" />,
  "Nomination-Declaration": <FaFileAlt className="mr-2" />,
  "Job Posting": <MdGavel className="mr-2" />,
  "Full & Final Statement": <FaFileAlt className="mr-2" />,
  "HR Dashboard": <AiFillDashboard className="mr-2" />,

  // Leave
  "Leave Types": <FaUmbrellaBeach className="mr-2" />,
  "Leave Mapping": <MdOutlineMap className="mr-2" />,
  "Leave Requests": <MdOutlineRequestPage className="mr-2" />,
  "Leave Balance": <FaBalanceScale className="mr-2" />,
  "Holiday List": <MdCelebration className="mr-2" />,
  "Employee Leave": <MdOutlineChecklistRtl className="mr-2" />,
  "Leave Allocation": <FaBalanceScale className="mr-2" />,
  "Advance Payments": <MdOutlineChecklistRtl className="mr-2" />,

  // Policies
  "PF Settings": <FaCogs className="mr-2" />,
  "PF Transaction": <FaFileInvoiceDollar className="mr-2" />,
  "PF Contribution Rule": <FaFileInvoiceDollar className="mr-2" />,
  "ESI Rules": <GiBookCover className="mr-2" />,
  "ESI Transactions": <FaExchangeAlt className="mr-2" />,
  "Late Policy": <FaExchangeAlt className="mr-2" />,
  "Leave Policy": <FaUmbrellaBeach className="mr-2" />,
  "Weekend Policy": <FaUmbrellaBeach className="mr-2" />,
  "Policy Details": <FaFileAlt className="mr-2" />,

  // Compliance
  "Payment Adjustment Policy": <TbReportMoney className="mr-2" />,
  "OT Master": <FaClock className="mr-2" />,
  "OT Rule": <FaRegClock className="mr-2" />,
  "OT Calculation": <FaCalculator className="mr-2" />,
  "OT Permission" : <TbReportMoney className="mr-2" />,
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
