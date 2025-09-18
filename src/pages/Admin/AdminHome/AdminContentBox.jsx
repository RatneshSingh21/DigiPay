import { Outlet, useLocation } from "react-router-dom";
import AdminSubmenuBox from "./AdminSubmenuBox";

const submenuMap = {
  Settings: [
    "Organisation Profile",
    "Departments",
    "Designation",
    "Work Locations",
    "Permissions",
    "PaySchedule",
    "Shifts",
    "Salary Configuration",
    "Status Master",
    "Attendance"
  ],
  Employees: [
    "Add Employee",
    "Employee List",
    "General Imports",
    "General Settings",
  ],
  Role: ["Role Master", "Role Approval" ,"Emp. Role Mapping"],
  Reports: [
    "Attendance Report",
    "Salary Register",
    "Payslip Templates",
    "Payroll Report",
  ],
  Leave: ["Leave Types", "Leave Mapping", "Leave Requests", "Leave Balance", "Holiday List"],
  Policy: ["Policy Details", "PF Settings", "Weekend Policy"],
  Compliance: ["Compliance Details", "Compliance Rules"],
};

const getMenuFromPath = (pathname) => {
  if (pathname.includes("/employees")) return "Employees";
  if (pathname.includes("/settings")) return "Settings";
  if (pathname.includes("/reports")) return "Reports";
  if (pathname.includes("/role")) return "Role";
  if (pathname.includes("/payschedule")) return "Payschedule";
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
