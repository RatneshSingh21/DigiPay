import { Outlet, useLocation } from "react-router-dom";
import AdminSubmenuBox from "./AdminSubmenuBox";

const submenuMap = {
  Employees: [
    "Add Employee",
    "Employee List",
    "Basic Salary",
    "Employee Salary",
    "Salary Calculation",
    "Emp Category",
    "Employment Type",
    "Work Nature",
    "Work Type",
    "General Imports",
    "General Settings",
  ],

  Role: ["Role Master", "Role Approval", "Emp. Role Mapping"],

  Leave: [
    "Leave Types",
    "Leave Mapping",
    "Holiday List",
    "Employee Leave",
    "Leave Allocation",
    "Advance Payments",
  ],

  Policy: [
    "PF Settings",
    "PF Contribution Rule",
    "PF Transaction",
    "ESI Rules",
    "ESI Transactions",
    "Late Policy",
    "Leave Policy",
    "Weekend Policy",
    "Attendance Policy",
  ],

  Compliance: [
    "Compliance Details",
    "Compliance Rules",
    "Payment Adjustment Policy",
    "OT Master",
    "OT Rule",
    "OT Calculation",
    "OT Permission"
  ],

  Attendance: [
    "Attendance",
    "Add Attendance",
    "Manual Attendance",
    "Punch",
    "Attendance Policy",
    "Attendance Record",
    "Attendance Calculation",
    "Attendance Report",
  ],

  Reports: [
    "Salary Register",
    "Payslip Templates",
    "Letter of Intent",
    "Offer Letter",
    "Appointment Letter",
    "Confirmation Letter",
    "Increment Letter",
    // "Promotion Letter",
    // "Relieving Letter",
    "Experience Cert.",
    "Full & Final Statement",
    "HR Dashboard",
    // "Nomination-Declaration",
    // "Job Posting",
  ],

  Expenses: [
    "Expense Header",
    "Expense Documents",
    "Uploaded Documents",
    "Travel Details",
  ],

  Shifts: ["Add Shift", "Shift Mapping"],

  Settings: [
    "Organisation Profile",
    "Create Admin",
    "Create From Employee",
    "Departments",
    "Designation",
    "Work Locations",
    "Permissions",
    "Shifts",
    "Salary Configuration",
    "Salary Calculation Type",
    "Status Master",
  ],
};

const getMenuFromPath = (pathname) => {
  if (pathname.includes("/employees")) return "Employees";
  if (pathname.includes("/settings")) return "Settings";
  if (pathname.includes("/reports")) return "Reports";
  if (pathname.includes("/expenses")) return "Expenses";
  if (pathname.includes("/role")) return "Role";
  if (pathname.includes("/shifts")) return "Shifts";
  if (pathname.includes("/reports")) return "Reports";
  if (pathname.includes("/attendance")) return "Attendance";
  if (pathname.includes("/payschedule")) return "Payschedule";
  if (pathname.includes("/approvals")) return "Approvals";
  if (pathname.includes("/leave")) return "Leave";
  if (pathname.includes("/policy")) return "Policy";
  if (pathname.includes("/compliance")) return "Compliance";
  return "Dashboard";
};

const AdminContentBox = () => {
  const location = useLocation();
  const selectedMenu = getMenuFromPath(location.pathname);
  const submenuItems = submenuMap[selectedMenu] || [];

  return (
    <main className="flex h-full">
      {submenuItems.length > 0 && (
        <div className="w-48 h-[86vh] z-20">
          <AdminSubmenuBox items={submenuItems} selectedMenu={selectedMenu} />
        </div>
      )}
      <div className="flex-1 ml-4 bg-white shadow-md">
        {submenuItems.length === 0 ? (
          <>
            <h2 className="text-xl font-semibold mb-4">{selectedMenu}</h2>
            <p>
              This is the main content area for <strong>{selectedMenu}</strong>.
            </p>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </main>
  );
};

export default AdminContentBox;
