import { useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../pages/EmployeePages/EmployeeComponents/EmployeeSidebar";
import EmployeeNavbar from "../pages/EmployeePages/EmployeeComponents/EmployeeNavbar";


const EmployeeDashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-52"
        }`}
      >
        <EmployeeNavbar />
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardLayout;
