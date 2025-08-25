import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import AuthLayout from "./Layout/AuthLayout";
import AdminDashboardLayout from "./Layout/AdminDashboardLayout";
import EmployeeDashboardLayout from "./Layout/EmployeeDashboardLayout";
import AddCompanyModal from "./components/AddCompanyModel";

// Dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeePages/EmployeeDashboard/EmployeeDashboard";

// Public Pages
import LandingPageMain from "./pages/LandingPageDesign/LandingPageMain";
import VerifyOtp from "./pages/Admin/Auth/VerifyOtp";
import SendLoginOtp from "./pages/Admin/Auth/SendLoginOtp";
import ForgetPassword from "./pages/Admin/Auth/ForgetPassword";
import ResetPassword from "./pages/Admin/Auth/ResetPassword";
import EmpCreatePassword from "./pages/EmployeePages/Auth/EmpCreatePassword";

// Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Optional pages
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

import AdminContentBox from "./pages/Admin/AdminHome/AdminContentBox";

// Admin Dashboard Pages
import EmployeeList from "./pages/Admin/Employees/EmployeeList";
import AddEmployee from "./pages/Admin/Employees/AddEmployee";
import GeneralImports from "./pages/Admin/Employees/GeneralImports";
import GeneralSettings from "./pages/Admin/Employees/GeneralSettings/GeneralSettings";

//Admin Settings Pages
import OrganisationProfile from "./pages/Admin/Settings/OrganisationProfile";
import Departments from "./pages/Admin/Settings/Departments";
import WorkLocations from "./pages/Admin/Settings/WorkLocations";
import PaySchedule from "./pages/Admin/Settings/PaySchedule";
import Permissions from "./pages/Admin/Settings/Permissions";
import Shifts from "./pages/Admin/Settings/Shifts";
import Designation from "./pages/Admin/Settings/Designation";
import Salary from "./pages/Admin/Settings/Salary";
import Attendance from "./pages/Admin/Settings/Attendance";

// Admin Reports Pages
import AttendanceReport from "./pages/Admin/Reports/AttendanceReport";
import PayrollReport from "./pages/Admin/Reports/PayrollReport";
import SalaryRegister from "./pages/Admin/Reports/SalaryRegister";
import PayslipTemplates from "./pages/Admin/Reports/PayslipTemplates";

// Leave Pages
import Leave from "./pages/Admin/Leave/Leave";
import LeaveRequests from "./pages/Admin/Leave/LeaveRequests";
import LeaveBalance from "./pages/Admin/Leave/LeaveBalance";
import LeaveMapping from "./pages/Admin/Leave/LeaveMapping";
import HolidayList from "./pages/Admin/Leave/HolidayList";

// Policy Pages
import PolicyDetails from "./pages/Admin/Policies/PolicyDetails";
import PolicySettings from "./pages/Admin/Policies/PolicySettings";
import WeekendPolicy from "./pages/Admin/Policies/WeekendPolicy/WeekendPolicy";

// Compliance Pages
import ComplianceDetails from "./pages/Admin/Compliance/ComplianceDetails";
import ComplianceRules from "./pages/Admin/Compliance/ComplianceRules";

// Employee Pages
import EmployeeProfile from "./pages/EmployeePages/EmployeeComponents/EmployeeProfile";
import EmpAttendance from "./pages/EmployeePages/EmployeeComponents/EmpAttendance";
import EmpLeaveRequest from "./pages/EmployeePages/EmployeeComponents/EmpLeaveRequest";
import EmpSettings from "./pages/EmployeePages/EmployeeComponents/EmpSettings";
import EmpAdvancePayment from "./pages/EmployeePages/EmployeeComponents/EmpAdvancePayment";
import EmpOutDuty from "./pages/EmployeePages/EmployeeComponents/EmpOutDuty";
import EmpSalarySlip from "./pages/EmployeePages/EmployeeComponents/EmpSalarySlip";


const App = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const companyId = useAuthStore((state) => state.companyId);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  const mode = useThemeStore((state) => state.mode);
  const palette = useThemeStore((state) => state.palette);

  const [showCompanyModal, setShowCompanyModal] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Reset theme classes
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

  // Show modal only if Admin/SuperAdmin has no company yet
  useEffect(() => {
    console.log(companyId);
    if (
      isAuthReady &&
      (user?.role === "Admin" || user?.role === "SuperAdmin") &&
      (!companyId || companyId === 1)
    ) {
      setShowCompanyModal(true);
    } else {
      setShowCompanyModal(false);
    }
  }, [isAuthReady, user, companyId]);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Company creation modal (blocking if no companyId) */}
      {showCompanyModal && (
        <AddCompanyModal
          isOpen={showCompanyModal}
          onClose={() => setShowCompanyModal(false)}
        />
      )}

      <Routes>
        {token ? (
          <>
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
                  <Route path="general-imports" element={<GeneralImports />} />
                  <Route
                    path="general-settings"
                    element={<GeneralSettings />}
                  />
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
                  <Route path="attendance" element={<Attendance />} />
                </Route>

                {/* Reports SubRoutes */}
                <Route path="reports/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="attendance-report" />} />
                  <Route
                    path="attendance-report"
                    element={<AttendanceReport />}
                  />
                  <Route
                    path="payslip-templates"
                    element={<PayslipTemplates />}
                  />
                  <Route path="payroll-report" element={<PayrollReport />} />
                  <Route path="salary-register" element={<SalaryRegister />} />
                </Route>

                {/* Leave SubRoutes */}
                <Route path="leave/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="leave-types" />} />
                  <Route path="leave-types" element={<Leave />} />
                  <Route path="leave-mapping" element={<LeaveMapping />} />
                  <Route path="leave-requests" element={<LeaveRequests />} />
                  <Route path="leave-balance" element={<LeaveBalance />} />
                  <Route path="holiday-list" element={<HolidayList />} />
                </Route>

                {/* Policy SubRoutes */}
                <Route path="policy/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="policy-details" />} />
                  <Route path="weekend-policy" element={<WeekendPolicy />} />
                  <Route path="policy-details" element={<PolicyDetails />} />
                  <Route path="policy-settings" element={<PolicySettings />} />
                </Route>

              {/* Compliance SubRoutes */}
                <Route path="compliance/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="compliance-details" />} />
                  <Route path="compliance-details" element={<ComplianceDetails />} />
                  <Route path="compliance-rules" element={<ComplianceRules />} />
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
                <Route path="home" element={<EmployeeDashboard />} />{" "}
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="attendance" element={<EmpAttendance />} />
                <Route path="leave" element={<EmpLeaveRequest />} />
                <Route path="salary-slip" element={<EmpSalarySlip />} />
                <Route path="settings" element={<EmpSettings />} />
                <Route path="advance-payment" element={<EmpAdvancePayment />} />
                <Route path="on-duty" element={<EmpOutDuty />} />
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
            <Route path="/setup-password" element={<EmpCreatePassword />} />

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

// import React from "react";
// import EmployeeDashboardLayout from "./Layout/EmployeeDashboardLayout";
// import { Navigate, Route, Routes } from "react-router-dom";
// import EmployeeDashboard from "./pages/EmployeePages/EmployeeDashboard/EmployeeDashboard";
// import EmployeeProfile from "./pages/EmployeePages/EmployeeComponents/EmployeeProfile";
// import EmpAttendance from "./pages/EmployeePages/EmployeeComponents/EmpAttendance";
// import EmpLeaveRequest from "./pages/EmployeePages/EmployeeComponents/EmpLeaveRequest";
// import EmpSettings from "./pages/EmployeePages/EmployeeComponents/EmpSettings";
// import EmpAdvancePayment from "./pages/EmployeePages/EmployeeComponents/EmpAdvancePayment";
// import EmpOutDuty from "./pages/EmployeePages/EmployeeComponents/EmpOutDuty";
// import NotFound from "./pages/NotFound";
// import EmpSalarySlip from "./pages/EmployeePages/EmployeeComponents/EmpSalarySlip";

// const App = () => {
//   return (
//     <div>
//       {/* <EmployeeDashboardLayout/> */}
//       <Routes>
//         <Route path="/employee-dashboard" element={<EmployeeDashboardLayout />}>
//           <Route index element={<Navigate to="home" />} />
//           <Route path="home" element={<EmployeeDashboard />} />
//           <Route path="profile" element={<EmployeeProfile />} />
//           <Route path="attendance" element={<EmpAttendance />} />
//           <Route path="leave" element={<EmpLeaveRequest />} />
//           <Route path="salary-slip" element={<EmpSalarySlip />} />
//           <Route path="settings" element={<EmpSettings />} />
//           <Route path="advance-payment" element={<EmpAdvancePayment />} />
//           <Route path="out-duty" element={<EmpOutDuty />} />
//           <Route path="*" element={<NotFound />} />
//         </Route>
//       </Routes>
//     </div>
//   );
// };

// export default App;
