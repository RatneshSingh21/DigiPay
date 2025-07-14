import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";
import { ToastContainer } from "react-toastify";

// Layouts
import AuthLayout from "./Layout/AuthLayout";
import AdminDashboardLayout from "./Layout/AdminDashboardLayout ";

// Public Pages
import LandingPageMain from "./pages/LandingPageDesign/LandingPageMain";
import VerifyOtp from "./pages/Admin/Auth/VerifyOtp";
import SendLoginOtp from "./pages/Admin/Auth/SendLoginOtp";
import ForgetPassword from "./pages/Admin/Auth/ForgetPassword";
import ResetPassword from "./pages/Admin/Auth/ResetPassword";

// Guard
import ProtectedRoute from "./components/ProtectedRoute ";

// Optional pages
import Unauthorized from "./pages/Unauthorized ";

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

const App = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const mode = useThemeStore((state) => state.mode);
  const palette = useThemeStore((state) => state.palette);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

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
      <ToastContainer />
      <Routes>
        {/* If user is logged in, show only dashboard routes */}
        {token ? (
          <>
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} />
              }
            >
              <Route path="/admin-dashboard" element={<AdminDashboardLayout />}>
                <Route index element={<Navigate to="dashboard" />} />

                {/* Employees SubRoutes */}
                <Route path="employees/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="add" />} />
                  <Route path="list" element={<EmployeeList />} />
                  <Route path="add" element={<AddEmployee />} />
                  <Route path="teams" element={<Teams />} />
                </Route>

                {/* Other Routes with no submenu */}
                <Route path="dashboard" element={<AdminContentBox />} />
                
                <Route path="settings/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="organisation-profile" />} />
                  <Route path="organisation-profile" element={<OrganisationProfile />} />
                  <Route path="departments" element={<Departments />} />
                  <Route path="work-locations" element={<WorkLocations />} />
                  <Route path="permissions" element={<Permissions />} />
                  <Route path="payschedule" element={<PaySchedule />} />
                  <Route path="shifts" element={<Shifts />} />
                  <Route path="designation" element={<Designation />} />
                  <Route path="salary" element={<Salary />} />
                </Route>

                <Route path="payschedule" element={<PaySchedule />} />

                <Route path="reports/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="attendance" />} />
                  <Route path="attendance" element={<AttendanceReport />} />
                  <Route path="payroll" element={<PayrollReport />} />
                  <Route path="leave" element={<LeaveReport />} />
                </Route>
              </Route>
            </Route>
            {/* Redirect all other paths to /admin-dashboard */}
            <Route
              path="*"
              element={<Navigate to="/admin-dashboard" replace />}
            />
          </>
        ) : (
          <>
            {/* Public Routes */}
            <Route path="/" element={<LandingPageMain />} />
            <Route path="/auth" element={<AuthLayout />} />
            <Route path="/login-otp" element={<SendLoginOtp />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Redirect all other paths to / (landing) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
};

export default App;
