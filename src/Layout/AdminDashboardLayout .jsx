import AdminSidebar from "../pages/Admin/AdminHome/AdminSidebar";
import AdminNavbar from "../pages/Admin/AdminHome/AdminNavbar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const AdminDashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-52"
        }`}
      >
        <AdminNavbar />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
