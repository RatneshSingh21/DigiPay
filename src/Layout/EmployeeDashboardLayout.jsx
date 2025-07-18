import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
// import useAuthStore from "../store/authStore"; // 🔒 Real auth store

const EmployeeDashboardLayout = () => {
  const navigate = useNavigate();

  // ✅ Dummy user for testing
  const user = {
    name: "John Doe",
    role: "Employee", // or "User"
  };

  // const user = useAuthStore((state) => state.user); // 🔒 Real user
  // const logout = useAuthStore((state) => state.logout); // 🔒 Real logout

  useEffect(() => {
    if (!user || (user.role !== "Employee" && user.role !== "User")) {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("loginRole");
    // logout(); // 🔒 Real logout call to Zustand
    navigate("/"); // Redirect to landing
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 p-4 shadow-md">
        <h2 className="text-xl font-bold mb-6">Employee Panel</h2>
        <nav className="flex flex-col space-y-2">
          <NavLink
            to="/employee-dashboard/home"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/employee-dashboard/profile"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500"
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/employee-dashboard/attendance"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500"
            }
          >
            Attendance
          </NavLink>
          <NavLink
            to="/employee-dashboard/payslips"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500"
            }
          >
            Payslips
          </NavLink>
          <NavLink
            to="/employee-dashboard/leave"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500"
            }
          >
            Leave
          </NavLink>

          <button
            onClick={handleLogout}
            className="mt-6 text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="mb-6 border-b pb-2">
          <h1 className="text-2xl font-semibold">
            {user?.name || "Employee Dashboard"}
          </h1>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeDashboardLayout;
