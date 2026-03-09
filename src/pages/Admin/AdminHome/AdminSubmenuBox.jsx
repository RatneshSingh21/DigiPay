import { Link, useLocation } from "react-router-dom";

// Icons
import {
  UserPlus,
  List,
  Building2,
  BadgeCheck,
  CalendarCheck,
  FileText,
  Umbrella,
  Globe,
  Settings,
  Scale,
  Repeat,
  GitBranch,
  Briefcase,
  Clock,
  Calculator,
  Wallet,
  Users,
  FolderKanban,
  CalendarDays,
  ClipboardList,
  Fingerprint,
  ShieldCheck,
  Lock,
  MapPin,
  UserCog,
  UserCheck,
  FileSpreadsheet,
  FileSignature,
  FileBadge,
  FileBarChart,
  Landmark,
  BookOpen,
  Receipt,
  TrendingUp,
  Timer,
  Database,
  MonitorSmartphone,
  LayoutDashboard,
  UserRoundCog,
  Network,
  HandCoins,
  LandmarkIcon,
  XCircle,
  Download,
} from "lucide-react";

// Label to path mapping
const labelToPath = {
  // Employee
  "Add Employee": "add",
  "Employee List": "list",
  "Basic Salary": "employee-salary-basic",
  "Employee Salary": "employee-salary-details",
  "Emp Category": "emp-category",
  "Employment Type": "emp-employmenttype",
  "Work Type": "emp-worktype",
  "Work Nature": "emp-worknature",
  "General Imports": "general-imports",
  "General Settings": "general-settings",
  "FullEmployee Data": "fullemployee-data",

  //Salary
  "Salary Configuration": "salary-configuration",
  "Default SetUp": "default-setup",
  "Dynamic SetUp": "dynamic-setup",
  "Company Salary Policy": "company-salary-policy",
  "Salary Calculation": "salary-calculation",
  "Download SalarySlip": "download-slip",

  //Shifts
  "Add Shift": "add-shift",
  "Shift Mapping": "mapp-shift",
  "Shift Patterns": "shift-patterns",

  //Attendance
  Attendance: "attendance",
  "Attendance Punches": "attendance-punches",
  "Add Attendance": "add-attendance",
  "Manual Attendance": "manual-attendance",
  "Rejected Punches": "rejected-punches",
  Punch: "punch",
  "Attendance Policy": "atten-policy",
  "Attendance Record": "atten-record",
  "Attendance Calculation": "atten-calculation",
  "Attendance Report": "attendance-report",
  "Attendance Machine": "attendance-machine",
  "Emp Machine Mapping": "emp-machine-mapping",
  "Machine Data Log": "machine-data-log",
  "Attendance Lock": "attendance-lock",

  // Settings
  "Organisation Profile": "organisation-profile",
  "Create Admin": "create-admin",
  "Create From Employee": "create-from-employee",
  Departments: "departments",
  Designation: "designation",
  "Work Locations": "work-locations",
  Permissions: "permissions",
  PaySchedule: "payschedule",
  "Status Master": "status-master",
  "Salary Calculation Type": "salary-calculation-type",
  "Component Lock": "component-lock",
  "Employee Password Setup": "employee-password-setup",

  // Role
  "Role Master": "role-master",
  "Approval Rules": "approval-rules",
  "Approval RuleRoles": "approval-rule-roles",
  "Emp. Role Mapping": "emp-role-mapping",
  "Employee Reporting List": "employee-reporting-list",
  "Department Manager Mapping": "department-manager-mapping",

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
  "OT Permission": "ot-permission",
};

// Label to icon mapping
const labelToIcon = {
  // Employee
  "Add Employee": <UserPlus size={16} className="mr-2" />,
  "Employee List": <List size={16} className="mr-2" />,
  "Basic Salary": <Wallet size={16} className="mr-2" />,
  "Employee Salary": <Wallet size={16} className="mr-2" />,
  "Emp Category": <Users size={16} className="mr-2" />,
  "Employment Type": <Briefcase size={16} className="mr-2" />,
  "Work Type": <Briefcase size={16} className="mr-2" />,
  "Work Nature": <Briefcase size={16} className="mr-2" />,
  "General Imports": <Database size={16} className="mr-2" />,
  "General Settings": <Settings size={16} className="mr-2" />,
  "FullEmployee Data": <FileSpreadsheet size={16} className="mr-2" />,

  // Salary
  // "Salary Policy": <LandmarkIcon size={16} className="mr-2" />,
  "Salary Configuration": <Wallet size={16} className="mr-2" />,
  "Default SetUp": <Settings size={16} className="mr-2" />,
  "Dynamic SetUp": <Settings size={16} className="mr-2" />,
  "Company Salary Policy": <LandmarkIcon size={16} className="mr-2" />,
  "Salary Calculation": <Calculator size={16} className="mr-2" />,
  "Download SalarySlip": <Download size={16} className="mr-2" />,

  // Shifts
  "Add Shift": <CalendarDays size={16} className="mr-2" />,
  "Shift Mapping": <GitBranch size={16} className="mr-2" />,
  "Shift Patterns": <CalendarCheck size={16} className="mr-2" />,

  // Attendance
  Attendance: <UserCheck size={16} className="mr-2" />,
  "Attendance Punches": <Fingerprint size={16} className="mr-2" />,
  "Add Attendance": <CalendarCheck size={16} className="mr-2" />,
  "Manual Attendance": <ClipboardList size={16} className="mr-2" />,
  "Rejected Punches": <XCircle size={16} className="mr-2" />,
  Punch: <Timer size={16} className="mr-2" />,
  "Attendance Policy": <ShieldCheck size={16} className="mr-2" />,
  "Attendance Record": <FileText size={16} className="mr-2" />,
  "Attendance Calculation": <Calculator size={16} className="mr-2" />,
  "Attendance Report": <FileBarChart size={16} className="mr-2" />,
  "Attendance Machine": <MonitorSmartphone size={16} className="mr-2" />,
  "Emp Machine Mapping": <Network size={16} className="mr-2" />,
  "Machine Data Log": <Database size={16} className="mr-2" />,
  "Attendance Lock": <Lock size={16} className="mr-2" />,

  // Documents
  "Expense Header": <Receipt size={16} className="mr-2" />,
  "Uploaded Documents": <FileText size={16} className="mr-2" />,
  "Expense Documents": <Receipt size={16} className="mr-2" />,
  "Travel Details": <MapPin size={16} className="mr-2" />,

  // Settings
  "Organisation Profile": <Building2 size={16} className="mr-2" />,
  "Create Admin": <UserCog size={16} className="mr-2" />,
  "Create From Employee": <UserPlus size={16} className="mr-2" />,
  Departments: <Building2 size={16} className="mr-2" />,
  Designation: <BadgeCheck size={16} className="mr-2" />,
  "Work Locations": <MapPin size={16} className="mr-2" />,
  Permissions: <ShieldCheck size={16} className="mr-2" />,
  PaySchedule: <CalendarDays size={16} className="mr-2" />,

  "Status Master": <TrendingUp size={16} className="mr-2" />,
  "LetterField Master": <FileSignature size={16} className="mr-2" />,
  "Salary Calculation Type": <Calculator size={16} className="mr-2" />,
  "Component Lock": <Lock size={16} className="mr-2" />,
  "Employee Password Setup": <UserRoundCog size={16} className="mr-2" />,

  // Role
  "Role Master": <BadgeCheck size={16} className="mr-2" />,
  "Approval Rules": <Scale size={16} className="mr-2" />,
  "Approval RuleRoles": <Scale size={16} className="mr-2" />,
  "Emp. Role Mapping": <GitBranch size={16} className="mr-2" />,
  "Employee Reporting List": <FolderKanban size={16} className="mr-2" />,
  "Department Manager Mapping": <Network size={16} className="mr-2" />,

  // Reports
  "Salary Register": <FileSpreadsheet size={16} className="mr-2" />,
  "Payslip Templates": <FileBadge size={16} className="mr-2" />,
  "Letter of Intent": <FileSignature size={16} className="mr-2" />,
  "Offer Letter": <FileText size={16} className="mr-2" />,
  "Appointment Letter": <FileText size={16} className="mr-2" />,
  "Confirmation Letter": <FileText size={16} className="mr-2" />,
  "Increment Letter": <TrendingUp size={16} className="mr-2" />,
  "Promotion Letter": <TrendingUp size={16} className="mr-2" />,
  "Relieving Letter": <FileText size={16} className="mr-2" />,
  "Experience Cert.": <FileBadge size={16} className="mr-2" />,
  "Nomination-Declaration": <FileText size={16} className="mr-2" />,
  "Job Posting": <Briefcase size={16} className="mr-2" />,
  "Full & Final Statement": <HandCoins size={16} className="mr-2" />,
  "HR Dashboard": <LayoutDashboard size={16} className="mr-2" />,

  // Leave
  "Leave Types": <Umbrella size={16} className="mr-2" />,
  "Leave Mapping": <MapPin size={16} className="mr-2" />,
  "Leave Requests": <ClipboardList size={16} className="mr-2" />,
  "Leave Balance": <Scale size={16} className="mr-2" />,
  "Holiday List": <CalendarDays size={16} className="mr-2" />,
  "Employee Leave": <ClipboardList size={16} className="mr-2" />,
  "Leave Allocation": <Scale size={16} className="mr-2" />,
  "Advance Payments": <Wallet size={16} className="mr-2" />,

  // Policies
  "PF Settings": <Landmark size={16} className="mr-2" />,
  "PF Transaction": <Receipt size={16} className="mr-2" />,
  "PF Contribution Rule": <Scale size={16} className="mr-2" />,
  "ESI Rules": <BookOpen size={16} className="mr-2" />,
  "ESI Transactions": <Repeat size={16} className="mr-2" />,
  "Late Policy": <Clock size={16} className="mr-2" />,
  "Leave Policy": <Umbrella size={16} className="mr-2" />,
  "Weekend Policy": <CalendarDays size={16} className="mr-2" />,
  "Policy Details": <FileText size={16} className="mr-2" />,

  // Compliance
  "Payment Adjustment Policy": <Receipt size={16} className="mr-2" />,
  "OT Master": <Clock size={16} className="mr-2" />,
  "OT Rule": <Timer size={16} className="mr-2" />,
  "OT Calculation": <Calculator size={16} className="mr-2" />,
  "OT Permission": <ShieldCheck size={16} className="mr-2" />,
};

const AdminSubmenuBox = ({ items, selectedMenu }) => {
  const location = useLocation();
  const base = `/admin-dashboard/${selectedMenu.toLowerCase()}`;

  return (
    <div className="bg-white border-r border-gray-400 p-4 h-full w-52 fixed shadow-md">
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
