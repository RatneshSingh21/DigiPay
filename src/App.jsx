import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import AuthLayout from "./Layout/AuthLayout";
import AdminDashboardLayout from "./Layout/AdminDashboardLayout";
import EmployeeDashboardLayout from "./Layout/EmployeeDashboardLayout";

// Public Pages
import LandingPageMain from "./pages/LandingPageDesign/LandingPageMain";
import VerifyOtp from "./pages/Admin/Auth/VerifyOtp";
import SendLoginOtp from "./pages/Admin/Auth/SendLoginOtp";
import ForgetPassword from "./pages/Admin/Auth/ForgetPassword";
import ResetPassword from "./pages/Admin/Auth/ResetPassword";

// Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Optional pages
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound"; // 404 Page Not Found

import AdminContentBox from "./pages/Admin/AdminHome/AdminContentBox";

// Admin Dashboard Pages
import EmployeeList from "./pages/Admin/Employees/EmployeeList";
import AddEmployee from "./pages/Admin/Employees/AddEmployee";
import Teams from "./pages/Admin/Employees/Teams";

//Admin Settings Pages
import OrganisationProfile from "./pages/Admin/Settings/OrganisationProfile";
import Departments from "./pages/Admin/Settings/Departments";
import WorkLocations from "./pages/Admin/Settings/WorkLocations";
import PaySchedule from "./pages/Admin/Settings/PaySchedule";
import Permissions from "./pages/Admin/Settings/Permissions";
import Shifts from "./pages/Admin/Settings/Shifts";
import Designation from "./pages/Admin/Settings/Designation";
import Salary from "./pages/Admin/Settings/Salary";

// Admin Reports Pages
import AttendanceReport from "./pages/Admin/Reports/AttendanceReport";
import PayrollReport from "./pages/Admin/Reports/PayrollReport";
import LeaveReport from "./pages/Admin/Reports/LeaveReport";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeePages/EmployeeDashboard/EmployeeDashboard";


const App = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const mode = useThemeStore((state) => state.mode);
  const palette = useThemeStore((state) => state.palette);

  // Apply theme mode and selected color palette to the root html element
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Remove all possible theme color classes before adding new one
    root.classList.remove(
      "theme-orange",
      "theme-blue",
      "theme-green",
      "theme-red",
      "theme-purple",
      "theme-teal",
      "theme-rose",
      "theme-indigo",
      "theme-pink"
    );
    root.classList.add(`theme-${palette}`);
  }, [mode, palette]);

  return (
    <div>
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* If user is logged in, show only dashboard routes */}
        {token ? (
          <>
            {/* Redirect "/" to the correct dashboard based on role */}
            <Route
              path="/"
              element={
                user?.role === "SuperAdmin" || user?.role === "Admin" ? (
                  <Navigate to="/admin-dashboard" replace />
                ) : user?.role === "Employee" || user?.role === "User" ? (
                  <Navigate to="/employee-dashboard" replace />
                ) : (
                  <Navigate to="/unauthorized" replace />
                )
              }
            />

            {/* Protected Admin Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} />
              }
            >
              <Route path="/admin-dashboard" element={<AdminDashboardLayout />}>
                {/* Default route for admin-dashboard */}
                <Route index element={<Navigate to="dashboard" />} />

                {/* Employees SubRoutes */}
                <Route path="employees/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="add" />} />
                  <Route path="list" element={<EmployeeList />} />
                  <Route path="add" element={<AddEmployee />} />
                  <Route path="teams" element={<Teams />} />
                </Route>

                {/* Dashboard Main Page */}
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* PaySchedule Main Page */}
                <Route path="payschedule" element={<PaySchedule />} />

                {/* Settings SubRoutes */}
                <Route path="settings/*" element={<AdminContentBox />}>
                  <Route
                    index
                    element={<Navigate to="organisation-profile" />}
                  />
                  <Route
                    path="organisation-profile"
                    element={<OrganisationProfile />}
                  />
                  <Route path="departments" element={<Departments />} />
                  <Route path="work-locations" element={<WorkLocations />} />
                  <Route path="permissions" element={<Permissions />} />
                  <Route path="payschedule" element={<PaySchedule />} />
                  <Route path="shifts" element={<Shifts />} />
                  <Route path="designation" element={<Designation />} />
                  <Route path="salary" element={<Salary />} />
                </Route>

                {/* Reports SubRoutes */}
                <Route path="reports/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="attendance" />} />
                  <Route path="attendance" element={<AttendanceReport />} />
                  <Route path="payroll" element={<PayrollReport />} />
                  <Route path="leave" element={<LeaveReport />} />
                </Route>

                {/* Nested 404 Catcher for /admin-dashboard/* */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            {/* Protected Employee Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={["Employee", "User"]} />}
            >
              <Route
                path="/employee-dashboard"
                element={<EmployeeDashboardLayout />}
              >
                <Route index element={<Navigate to="home" />} />
                <Route path="home" element={<EmployeeDashboard />} />
                {/* <Route path="profile" element={<EmployeeProfile />} /> */}
                {/* <Route path="attendance" element={<Attendance />} />
                <Route path="payslips" element={<PayslipHistory />} />
                <Route path="leave" element={<LeaveRequest />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} /> */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            {/* Unauthorized Page for blocked access */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Catch-all for logged-in user: show 404 */}
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <>
            {/* Public Routes (when user is not logged in) */}
            <Route path="/" element={<LandingPageMain />} />
            <Route path="/auth" element={<AuthLayout />} />
            <Route path="/login-otp" element={<SendLoginOtp />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* Unauthorized Page for public access violations */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Catch-all for public users: show 404 */}
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </div>
  );
};

export default App;


// import React from 'react'
// import EmployeeDashboardLayout from './Layout/EmployeeDashboardLayout'

// const App = () => {
//   return (
//     <div>
//       <EmployeeDashboardLayout/>
//     </div>
//   )
// }

// export default App