import { Outlet, useLocation } from "react-router-dom";
import AdminSubmenuBox from "./AdminSubmenuBox";

const submenuMap = {
  Settings: ["Organisation Profile", "Departments", "Work Locations", "Permissions", "PaySchedule", "Shifts", "Designation", "Salary" , "Attendance"],
  Employees: [ "Add Employee","Employee List", "Teams"],
  Reports: ["Attendance Report", "Payroll Report", "Leave Report"],
};

const getMenuFromPath = (pathname) => {
  if (pathname.includes("/employees")) return "Employees";
  if (pathname.includes("/settings")) return "Settings";
  if (pathname.includes("/reports")) return "Reports";
  if (pathname.includes("/payschedule")) return "Payschedule";
  return "Dashboard";
};

const AdminContentBox = () => {
  const location = useLocation();
  const selectedMenu = getMenuFromPath(location.pathname);
  const submenuItems = submenuMap[selectedMenu] || [];

  return (
    <main className="flex h-full">
      {submenuItems.length > 0 && (
        <div className="w-48 h-[86vh]">
          <AdminSubmenuBox items={submenuItems} selectedMenu={selectedMenu} />
        </div>
      )}
      <div className="flex-1 ml-4 bg-white shadow-md">
        {submenuItems.length === 0 ? (
          <>
            <h2 className="text-xl font-semibold mb-4">{selectedMenu}</h2>
            <p>This is the main content area for <strong>{selectedMenu}</strong>.</p>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </main>
  );
};

export default AdminContentBox;
