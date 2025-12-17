import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
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

// Admin Employee Pages
import EmployeeList from "./pages/Admin/Employees/EmployeeList";
import AddEmployee from "./pages/Admin/Employees/AddEmployee";
import EmpBasicSalary from "./pages/Admin/Employees/EmpBasicSalary";
import EmpSalaryDetails from "./pages/Admin/Employees/EmpSalaryDetails";
import SalaryCalculate from "./pages/Admin/Employees/SalaryCalculate/SalaryCalculate";
import EmpCategory from "./pages/Admin/Employees/EmpCategory";
import EmpEmploymentType from "./pages/Admin/Employees/EmpEmploymentType";
import EmpWorkType from "./pages/Admin/Employees/EmpWorkType";
import EmpWorkNature from "./pages/Admin/Employees/EmpWorkNature";
import GeneralImports from "./pages/Admin/Employees/GeneralImports";
import GeneralSettings from "./pages/Admin/Employees/GeneralSettings/GeneralSettings";

//Admin Settings Pages
import OrganisationProfile from "./pages/Admin/Settings/OrganisationProfile";
import CreateSuperAdmin from "./pages/Admin/Settings/CreateSuperAdmin";
import CreateAdminFromEmployee from "./pages/Admin/Settings/CreateAdminFromEmployee";
import Departments from "./pages/Admin/Settings/Departments";
import WorkLocations from "./pages/Admin/Settings/WorkLocations";
import PaySchedule from "./pages/Admin/PaySchedule/PaySchedule";
import Permissions from "./pages/Admin/Settings/Permissions";
import Designation from "./pages/Admin/Settings/Designation";
import StatusMaster from "./pages/Admin/Settings/StatusMaster";
import Salary from "./pages/Admin/Settings/Salary";
import SalaryCalculationType from "./pages/Admin/Settings/SalaryCalculationType/SalaryCalculationType";

//Admin Role Pages
import RoleMaster from "./pages/Admin/Role/RoleMaster";
import RoleApproval from "./pages/Admin/Role/RoleApproval/RoleApproval";
import EmpRoleMapping from "./pages/Admin/Role/EmpRole/EmpRoleMapping";

//Admin Shift Pages
import Shifts from "./pages/Admin/Settings/Shifts";
import ShiftMapping from "./pages/Admin/Shift/ShiftMapping";

//Admin Attendance Pages
import Attendance from "./pages/Admin/Settings/Attendance";
import AttendanceForm from "./pages/Admin/Attendance/AttendanceForm";
import ManualAttendance from "./pages/Admin/Attendance/ManualAttendance/ManualAttendance";
import AttendancePunch from "./pages/Admin/Attendance/AttendancePunch";
import AttendancePolicy from "./pages/Admin/Attendance/AttendancePolicy";
import AttendanceRecord from "./pages/Admin/Attendance/AttendanceRecord";
import AttendanceCalculationResult from "./pages/Admin/Attendance/AttendanceCalculationResult/AttendanceCalculationResult";

// Admin Reports Pages
import AttendanceReport from "./pages/Admin/Reports/AttendanceReport";
import SalaryRegister from "./pages/Admin/Reports/SalaryRegister";
import PayslipTemplates from "./pages/Admin/Reports/PayslipTemplates";
import AppointmentLetter from "./pages/Admin/Reports/PayrollReport/AppointmentLetter";
import ConfirmationLetter from "./pages/Admin/Reports/PayrollReport/ConfirmationLetter";
import IncrementLetter from "./pages/Admin/Reports/PayrollReport/IncrementLetter";
import JobPosting from "./pages/Admin/Reports/PayrollReport/JobPosting";
import OfferLetter from "./pages/Admin/Reports/PayrollReport/OfferLetter";
import LetterOfIntent from "./pages/Admin/Reports/PayrollReport/LetterOfIntent";
import NominationDeclaration from "./pages/Admin/Reports/PayrollReport/NominationDeclaration";
import FullFinalStatement from "./pages/Admin/Reports/PayrollReport/FullFinalStatement";
import ExperienceCertificateEditor from "./pages/Admin/Reports/PayrollReport/ExperienceCertificateEditor";
import AdminReports from "./pages/Admin/Reports/AdminReports";

//Admin Leave Pages
import Leave from "./pages/Admin/Leave/LeaveType/Leave";
import LeaveRequests from "./pages/Admin/Leave/LeaveRequests";
import LeaveBalance from "./pages/Admin/Leave/LeaveBalance";
import LeaveMapping from "./pages/Admin/Leave/Leave Mapping/LeaveMapping";
import HolidayList from "./pages/Admin/Leave/HolidayList/HolidayList";
import EmployeeLeave from "./pages/Admin/Leave/EmployeeLeave/EmployeeLeave";
import EmployeeLeaveAllocation from "./pages/Admin/Leave/EmployeeLeaveAllocation/EmployeeLeaveAllocation";
import EmployeeAdvancePayments from "./pages/Admin/Leave/EmployeeAdvancePayments/EmployeeAdvancePayments";

//Admin Policy Pages
import PFSettings from "./pages/Admin/Policies/PFSettings/PFSettings";
import PFTransaction from "./pages/Admin/Policies/PFTransaction/PFTransaction";
import PFContributionRule from "./pages/Admin/Policies/PFContributionRule/PFContributionRule";
import ESIRules from "./pages/Admin/Policies/ESI/ESIRule/ESIRules";
import ESITransactions from "./pages/Admin/Policies/ESI/ESITransaction/ESITransactions";
import LeavePolicy from "./pages/Admin/Policies/LeavePolicy/LeavePolicy";
import LatePolicy from "./pages/Admin/Policies/LatePolicy/LatePolicy";
import WeekendPolicy from "./pages/Admin/Policies/WeekendPolicy/WeekendPolicy";

//Admin Approvals Pages
import ApprovalWrapper from "./pages/Admin/Approvals/ApprovalWrapper";

//Admin Documents Pages
import UploadedDocuments from "./pages/Admin/Documents/UploadedDocuments";
import ExpenseDocuments from "./pages/Admin/Documents/Expense/ExpenseDocuments";
import ExpenseHeader from "./pages/Admin/Documents/Expense/ExpenseHeader/ExpenseHeader";
import TravelDetails from "./pages/Admin/Documents/TravelDetails";

//Admin Compliance Pages
import ComplianceDetails from "./pages/Admin/Compliance/ComplianceDetails";
import ComplianceRules from "./pages/Admin/Compliance/ComplianceRules";
import PaymentAdjustment from "./pages/Admin/Policies/PaymentAdjustment/PaymentAdjustment";
import OTSlabMaster from "./pages/Admin/Policies/OT/OTMaster/OTSlabMaster";
import OTSlabMasterRules from "./pages/Admin/Policies/OT/OTRules/OTSlabMasterRules";
import OTCalculation from "./pages/Admin/Policies/OT/OTCalculation/OTCalculation";
import EmployeeOtPermission from "./pages/Admin/Policies/OT/OTPermission/EmployeeOtPermission";

// Employee Pages
import EmployeeProfile from "./pages/EmployeePages/EmployeeComponents/EmployeeProfile";
import EmpAttendance from "./pages/EmployeePages/EmployeeComponents/EmpAttendance";
import EmpLeaveRequest from "./pages/EmployeePages/EmployeeComponents/EmpLeaveRequest";
import EmpMarkAttendance from "./pages/EmployeePages/EmployeeComponents/EmpMarkAttendance";
import EmpAdvancePayment from "./pages/EmployeePages/EmployeeComponents/EmpAdvancePayment";
import EmpOutDuty from "./pages/EmployeePages/EmployeeComponents/EmpOutDuty";
import EmpSalarySlip from "./pages/EmployeePages/EmployeeComponents/EmpSalarySlip";
import EmpExpenses from "./pages/EmployeePages/EmployeeExpense/EmpExpenses";
import EmpDocuments from "./pages/EmployeePages/EmployeeDocuments/EmpDocuments";
import EmpTravel from "./pages/EmployeePages/EmployeeTravel/EmpTravel";
import EmpApprovals from "./pages/EmployeePages/EmployeeComponents/EmpApprovals";


const App = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const companyId = useAuthStore((state) => state.companyId);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // Show modal only if Admin/SuperAdmin has no company yet
  useEffect(() => {
    console.log(companyId);
    if (
      isAuthReady &&
      (user?.role === "Admin" || user?.role === "SuperAdmin") &&
      !companyId
    ) {
      setShowCompanyModal(true);
    } else {
      setShowCompanyModal(false);
    }
  }, [isAuthReady, user, companyId]);

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={3000} />

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
                  <Route
                    path="employee-salary-basic"
                    element={<EmpBasicSalary />}
                  />
                  <Route
                    path="employee-salary-details"
                    element={<EmpSalaryDetails />}
                  />
                  <Route
                    path="employee-salary-calculation"
                    element={<SalaryCalculate />}
                  />
                  <Route path="emp-category" element={<EmpCategory />} />
                  <Route
                    path="emp-employmenttype"
                    element={<EmpEmploymentType />}
                  />
                  <Route path="emp-worktype" element={<EmpWorkType />} />
                  <Route path="emp-worknature" element={<EmpWorkNature />} />
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
                  <Route path="create-admin" element={<CreateSuperAdmin />} />
                  <Route
                    path="create-from-employee"
                    element={<CreateAdminFromEmployee />}
                  />
                  <Route path="work-locations" element={<WorkLocations />} />
                  <Route path="permissions" element={<Permissions />} />
                  <Route path="shifts" element={<Shifts />} />
                  <Route path="designation" element={<Designation />} />
                  <Route path="salary" element={<Salary />} />
                  <Route path="status-master" element={<StatusMaster />} />
                  <Route path="salary-calculation-type" element={<SalaryCalculationType />} />    
                </Route>

                {/* Role SubRoutes */}
                <Route path="role/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="role-master" />} />
                  <Route path="role-master" element={<RoleMaster />} />
                  <Route path="role-approval" element={<RoleApproval />} />
                  <Route path="emp-role-mapping" element={<EmpRoleMapping />} />
                </Route>

                {/* Shift SubRoutes */}
                <Route path="shifts/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="add-shift" />} />
                  <Route path="add-shift" element={<Shifts />} />
                  <Route path="mapp-shift" element={<ShiftMapping />} />
                </Route>

                {/* Attendance SubRoutes */}
                <Route path="attendance/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="attendance" />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="add-attendance" element={<AttendanceForm />} />
                  <Route
                    path="manual-attendance"
                    element={<ManualAttendance />}
                  />
                  <Route path="punch" element={<AttendancePunch />} />
                  <Route path="atten-policy" element={<AttendancePolicy />} />
                  <Route path="atten-record" element={<AttendanceRecord />} />
                  <Route
                    path="atten-calculation"
                    element={<AttendanceCalculationResult />}
                  />
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
                  <Route path="salary-register" element={<SalaryRegister />} />
                  <Route
                    path="appointment-certi"
                    element={<AppointmentLetter />}
                  />
                  <Route
                    path="confirmation-certi"
                    element={<ConfirmationLetter />}
                  />
                  <Route path="offer-letter" element={<OfferLetter />} />
                  <Route path="letter-intent" element={<LetterOfIntent />} />
                  <Route
                    path="increment-letter"
                    element={<IncrementLetter />}
                  />
                  <Route
                    path="experience-certi"
                    element={<ExperienceCertificateEditor />}
                  />
                  <Route
                    path="nomination-declaration"
                    element={<NominationDeclaration />}
                  />
                  <Route path="job-posting" element={<JobPosting />} />
                  <Route
                    path="full-&-final-statement"
                    element={<FullFinalStatement />}
                  />
                  <Route path="all-reports" element={<AdminReports />} />
                </Route>

                {/* Documents SubRoutes */}
                <Route path="expenses/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="expense-documents" />} />
                  <Route path="expense-header" element={<ExpenseHeader />} />
                  <Route
                    path="uploaded-documents"
                    element={<UploadedDocuments />}
                  />
                  <Route
                    path="expense-documents"
                    element={<ExpenseDocuments />}
                  />
                  <Route path="travel-details" element={<TravelDetails />} />
                </Route>

                {/* Leave SubRoutes */}
                <Route path="leave/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="leave-types" />} />
                  <Route path="leave-types" element={<Leave />} />
                  <Route path="leave-mapping" element={<LeaveMapping />} />
                  <Route path="leave-requests" element={<LeaveRequests />} />
                  <Route path="leave-balance" element={<LeaveBalance />} />
                  <Route path="holiday-list" element={<HolidayList />} />
                  <Route path="employee-leave" element={<EmployeeLeave />} />
                  <Route
                    path="employee-advance-payments"
                    element={<EmployeeAdvancePayments />}
                  />
                  <Route
                    path="employee-leave-allocation"
                    element={<EmployeeLeaveAllocation />}
                  />
                </Route>

                {/* Policy SubRoutes */}
                <Route path="policy/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="pf-settings" />} />
                  <Route path="pf-settings" element={<PFSettings />} />
                  <Route path="pf-transaction" element={<PFTransaction />} />
                  <Route
                    path="pf-contribution-rule"
                    element={<PFContributionRule />}
                  />
                  <Route path="esi-rule" element={<ESIRules />} />
                  <Route path="esi-transaction" element={<ESITransactions />} />
                  <Route path="late-policy" element={<LatePolicy />} />
                  <Route path="policy-leave" element={<LeavePolicy />} />
                  <Route path="weekend-policy" element={<WeekendPolicy />} />
                  <Route path="atten-policy" element={<AttendancePolicy />} />
                </Route>

                {/* Approvals Main Page */}
                <Route path="approvals" element={<ApprovalWrapper />} />

                {/* Compliance SubRoutes */}
                <Route path="compliance/*" element={<AdminContentBox />}>
                  <Route index element={<Navigate to="compliance-details" />} />
                  <Route
                    path="compliance-details"
                    element={<ComplianceDetails />}
                  />
                  <Route
                    path="compliance-rules"
                    element={<ComplianceRules />}
                  />
                  <Route
                    path="payment-adjustment"
                    element={<PaymentAdjustment />}
                  />
                  <Route path="otrate" element={<OTSlabMaster />} />
                  <Route path="otrate-rules" element={<OTSlabMasterRules />} />
                  <Route
                    path="otrate-calculation"
                    element={<OTCalculation />}
                  />
                  <Route
                    path="ot-permission"
                    element={<EmployeeOtPermission />}
                  />
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
                <Route path="mark-attendance" element={<EmpMarkAttendance />} />
                <Route path="my-expenses" element={<EmpExpenses />} />
                <Route path="my-documents" element={<EmpDocuments />} />
                <Route path="travel-details" element={<EmpTravel />} />
                <Route path="advance-payment" element={<EmpAdvancePayment />} />
                <Route path="on-duty" element={<EmpOutDuty />} />
                <Route path="approvals" element={<EmpApprovals />} />
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
