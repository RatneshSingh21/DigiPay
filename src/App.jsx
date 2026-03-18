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
import EmpForgetPassword from "./pages/EmployeePages/Auth/EmpForgetPassword";
import EmpResetPassword from "./pages/EmployeePages/Auth/EmpResetPassword";

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
import EmpCategory from "./pages/Admin/Employees/EmpCategory";
import EmpEmploymentType from "./pages/Admin/Employees/EmpEmploymentType";
import EmpWorkType from "./pages/Admin/Employees/EmpWorkType";
import EmpWorkNature from "./pages/Admin/Employees/EmpWorkNature";
import GeneralImports from "./pages/Admin/Employees/GeneralImports";
import GeneralSettings from "./pages/Admin/Employees/GeneralSettings/GeneralSettings";
import EmployeeDetails from "./pages/Admin/Employees/EmployeeDetails";

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
import SalaryCalculationType from "./pages/Admin/Settings/SalaryCalculationType/SalaryCalculationType";
import ComponentLock from "./pages/Admin/Settings/ComponentLock/ComponentLock";
import EmployeePasswordSetup from "./pages/Admin/Settings/EmployeePasswordSetUp/EmployeePasswordSetup";

//Admin Role Pages
import RoleMaster from "./pages/Admin/Role/RoleMaster";
import ApprovalRules from "./pages/Admin/Role/ApprovalRules/ApprovalRules";
import ApprovalRuleRoles from "./pages/Admin/Role/ApprovalRuleRoles/ApprovalRuleRoles";
import EmpRoleMapping from "./pages/Admin/Role/EmpRole/EmpRoleMapping";
import EmployeeReportingList from "./pages/Admin/Role/EmployeeReporting/EmployeeReportingList";
import DepartmentAuthorityList from "./pages/Admin/Role/DepartmentManager/DepartmentAuthorityList";

//Admin Shift Pages
import Shifts from "./pages/Admin/Shift/Shifts";
import ShiftMapping from "./pages/Admin/Shift/ShiftMapping";
import ShiftPatternPage from "./pages/Admin/Shift/ShiftPattern/ShiftPatternPage";

//Admin Attendance Pages
import AttendanceAllPunches from "./pages/Admin/Attendance/AttendanceAllPunches/AttendanceAllPunches";
import Attendance from "./pages/Admin/Attendance/Attendance";
import AttendanceForm from "./pages/Admin/Attendance/AttendanceForm";
import ManualAttendance from "./pages/Admin/Attendance/ManualAttendance/ManualAttendance";
import AttendancePunch from "./pages/Admin/Attendance/AttendancePunch";
import AttendanceRejectedPunches from "./pages/Admin/Attendance/AttendanceRejectedPunches/AttendanceRejectedPunches";
import AttendancePolicy from "./pages/Admin/Attendance/AttendancePolicy";
import AttendanceRecord from "./pages/Admin/Attendance/AttendanceRecord";
import AttendanceCalculationResult from "./pages/Admin/Attendance/AttendanceCalculationResult/AttendanceCalculationResult";
import AttendanceMachine from "./pages/Admin/Attendance/AttendanceMachine/AttendanceMachine";
import BiometricEmployeeMapping from "./pages/Admin/Attendance/AttendanceMachine/BiometricEmployeeMapping";
import AttendanceMachineData from "./pages/Admin/Attendance/AttendanceMachine/AttendanceMachineData";
import AttendanceLock from "./pages/Admin/Attendance/AttendanceLock/AttendanceLock";

// Admin Reports Pages
import AttendanceReport from "./pages/Admin/Reports/AttendanceReport/AttendanceReport";
import SalaryRegister from "./pages/Admin/Reports/SalaryRegister";

//Admin Letter Pages
import PayslipTemplates from "./pages/Admin/Letters/PayslipTemplates";
import LetterOfIntent from "./pages/Admin/Letters/PayrollReport/LetterOfIntent";
import OfferLetter from "./pages/Admin/Letters/PayrollReport/OfferLetter";
import AppointmentLetter from "./pages/Admin/Letters/PayrollReport/AppointmentLetter";
import ConfirmationLetter from "./pages/Admin/Letters/PayrollReport/ConfirmationLetter";
import IncrementLetter from "./pages/Admin/Letters/PayrollReport/IncrementLetter";
import PromotionLetter from "./pages/Admin/Letters/PayrollReport/PromotionLetter";
import RelievingLetter from "./pages/Admin/Letters/PayrollReport/RelievingLetter";
import ExperienceCertificateEditor from "./pages/Admin/Letters/PayrollReport/ExperienceCertificate";
import FullFinalStatement from "./pages/Admin/Letters/PayrollReport/FullFinalStatement";
import JobPosting from "./pages/Admin/Letters/PayrollReport/JobPosting";
import AdminReports from "./pages/Admin/Letters/AdminReports";

//Admin Leave Pages
import Leave from "./pages/Admin/Leave/LeaveType/Leave";
import LeaveRequests from "./pages/Admin/Leave/LeaveRequests";
import LeaveBalance from "./pages/Admin/Leave/LeaveBalance";
import LeaveMapping from "./pages/Admin/Leave/Leave Mapping/LeaveMapping";
import HolidayList from "./pages/Admin/Leave/HolidayList/HolidayList";
import EmployeeLeave from "./pages/Admin/Leave/EmployeeLeave/EmployeeLeave";
import EmployeeAdvancePayments from "./pages/Admin/Leave/EmployeeAdvancePayments/EmployeeAdvancePayments";
import EmployeeLeaveAllocation from "./pages/Admin/Leave/EmployeeLeaveAllocation/EmployeeLeaveAllocation";

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
import PaymentAdjustment from "./pages/Admin/Policies/PaymentAdjustment/PaymentAdjustment";
import OTSlabMaster from "./pages/Admin/Policies/OT/OTMaster/OTSlabMaster";
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

//Admin Salary Pages
import SalaryPolicy from "./pages/NEWSALARYLOGIC/SalaryPolicy";
import SalaryCalculate from "./pages/Admin/Employees/SalaryCalculate/SalaryCalculate";
import SalaryConfig from "./pages/Admin/Salary/SalaryConfig";
import CompanySalaryPolicyPage from "./pages/NEWSALARYLOGIC/CompanySalaryPolicy/CompanySalaryPolicyPage";
import DefaultSalaryPolicyPage from "./pages/NEWSALARYLOGIC/DefaultSalaryPolicy/DefaultSalaryPolicyPage";
import DynamicSalaryPolicyPage from "./pages/NEWSALARYLOGIC/DynamicSalaryPolicy/DynamicSalaryPolicyPage";
import DownloadSlip from "./pages/NEWSALARYLOGIC/DownloadSlip";
import AdvanceLoanMonthly from "./pages/NEWSALARYLOGIC/ADVANCENEW/AdvanceLoanMonthly";
import SalaryCalculateRich from "./pages/Admin/Employees/SalaryCalculate/SalaryCalculateRich";
import ComplianceSalaryPolicy from "./pages/NEWSALARYLOGIC/ComplianceSalaryPolicy/ComplianceSalaryPolicy";
import EmployeeActualSalary from "./pages/ComplainceSalaryPages/ActualSalary/EmployeeActualSalary";

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
      <div key={companyId || "no-company"}>
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
                <Route
                  path="/admin-dashboard"
                  element={<AdminDashboardLayout />}
                >
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

                    <Route path="emp-category" element={<EmpCategory />} />
                    <Route
                      path="emp-employmenttype"
                      element={<EmpEmploymentType />}
                    />
                    <Route path="emp-worktype" element={<EmpWorkType />} />
                    <Route path="emp-worknature" element={<EmpWorkNature />} />
                    <Route
                      path="general-imports"
                      element={<GeneralImports />}
                    />
                    <Route
                      path="general-settings"
                      element={<GeneralSettings />}
                    />
                    <Route
                      path="fullemployee-data"
                      element={<EmployeeDetails />}
                    />
                  </Route>

                  {/* Dashboard Main Page */}
                  <Route path="dashboard" element={<AdminDashboard />} />

                  {/* Salary SubRoutes */}
                  <Route path="salary/*" element={<AdminContentBox />}>
                    <Route
                      index
                      element={<Navigate to="salary-configuration" />}
                    />
                    <Route path="salary-policy" element={<SalaryPolicy />} />
                    <Route
                      path="salary-configuration"
                      element={<SalaryConfig />}
                    />
                    <Route
                      path="default-setup"
                      element={<DefaultSalaryPolicyPage />}
                    />
                    <Route
                      path="dynamic-setup"
                      element={<DynamicSalaryPolicyPage />}
                    />
                    <Route
                      path="complaince-setup"
                      element={<ComplianceSalaryPolicy />}
                    />
                    <Route
                      path="company-salary-policy"
                      element={<CompanySalaryPolicyPage />}
                    />
                    <Route
                      path="complaince-setup"
                      element={<ComplianceSalaryPolicy />}
                    />
                    <Route
                      path="actual-salary"
                      element={<EmployeeActualSalary />}
                    />
                    <Route
                      path="complaince-setup"
                      element={<ComplianceSalaryPolicy />}
                    />
                    <Route
                      path="add-advance"
                      element={<AdvanceLoanMonthly />}
                    />
                    <Route
                      path="salary-calculation"
                      element={<SalaryCalculateRich />}
                    />
                    <Route
                      path="download-slip"
                      element={<DownloadSlip />}
                    />
                    
                  </Route>

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
                    <Route path="designation" element={<Designation />} />
                    <Route path="status-master" element={<StatusMaster />} />
                    <Route
                      path="salary-calculation-type"
                      element={<SalaryCalculationType />}
                    />
                    <Route path="component-lock" element={<ComponentLock />} />
                    <Route
                      path="employee-password-setup"
                      element={<EmployeePasswordSetup />}
                    />
                  </Route>

                  {/* Role SubRoutes */}
                  <Route path="role/*" element={<AdminContentBox />}>
                    <Route index element={<Navigate to="role-master" />} />
                    <Route path="role-master" element={<RoleMaster />} />
                    <Route path="approval-rules" element={<ApprovalRules />} />
                    <Route
                      path="approval-rule-roles"
                      element={<ApprovalRuleRoles />}
                    />

                    <Route
                      path="emp-role-mapping"
                      element={<EmpRoleMapping />}
                    />

                    <Route
                      path="employee-reporting-list"
                      element={<EmployeeReportingList />}
                    />
                    <Route
                      path="department-manager-mapping"
                      element={<DepartmentAuthorityList />}
                    />
                  </Route>

                  {/* Shift SubRoutes */}
                  <Route
                    path="payschedule-shifts/*"
                    element={<AdminContentBox />}
                  >
                    <Route index element={<Navigate to="payschedule" />} />
                    <Route path="payschedule" element={<PaySchedule />} />
                    <Route path="add-shift" element={<Shifts />} />
                    <Route path="mapp-shift" element={<ShiftMapping />} />
                    <Route
                      path="shift-patterns"
                      element={<ShiftPatternPage />}
                    />
                  </Route>

                  {/* Attendance SubRoutes */}
                  <Route path="attendance/*" element={<AdminContentBox />}>
                    <Route index element={<Navigate to="attendance" />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route
                      path="attendance-punches"
                      element={<AttendanceAllPunches />}
                    />
                    <Route path="add-attendance" element={<AttendanceForm />} />
                    <Route
                      path="manual-attendance"
                      element={<ManualAttendance />}
                    />
                    <Route
                      path="rejected-punches"
                      element={<AttendanceRejectedPunches />}
                    />
                    <Route path="punch" element={<AttendancePunch />} />
                    <Route path="atten-policy" element={<AttendancePolicy />} />
                    <Route path="atten-record" element={<AttendanceRecord />} />
                    <Route
                      path="atten-calculation"
                      element={<AttendanceCalculationResult />}
                    />
                    <Route
                      path="attendance-report"
                      element={<AttendanceReport />}
                    />
                    <Route
                      path="attendance-machine"
                      element={<AttendanceMachine />}
                    />
                    <Route
                      path="emp-machine-mapping"
                      element={<BiometricEmployeeMapping />}
                    />
                    <Route
                      path="machine-data-log"
                      element={<AttendanceMachineData />}
                    />
                    <Route
                      path="attendance-lock"
                      element={<AttendanceLock />}
                    />
                  </Route>

                  {/* Reports SubRoutes */}
                  <Route path="letters/*" element={<AdminContentBox />}>
                    <Route
                      index
                      element={<Navigate to="payslip-templates" />}
                    />
                    <Route
                      path="payslip-templates"
                      element={<PayslipTemplates />}
                    />
                    <Route
                      path="salary-register"
                      element={<SalaryRegister />}
                    />

                    <Route path="letter-intent" element={<LetterOfIntent />} />
                    <Route path="offer-letter" element={<OfferLetter />} />
                    <Route
                      path="appointment-certi"
                      element={<AppointmentLetter />}
                    />
                    <Route
                      path="confirmation-certi"
                      element={<ConfirmationLetter />}
                    />
                    <Route
                      path="increment-letter"
                      element={<IncrementLetter />}
                    />
                    <Route
                      path="promotion-letter"
                      element={<PromotionLetter />}
                    />
                    <Route
                      path="relieving-letter"
                      element={<RelievingLetter />}
                    />
                    <Route
                      path="experience-certi"
                      element={<ExperienceCertificateEditor />}
                    />
                    <Route path="job-posting" element={<JobPosting />} />
                    <Route
                      path="full-&-final-statement"
                      element={<FullFinalStatement />}
                    />
                    <Route path="all-reports" element={<AdminReports />} />
                  </Route>

                  <Route path="reports/*" element={<AdminContentBox />}>
                    <Route
                      index
                      element={<Navigate to="attendance-report" />}
                    />
                    <Route
                      path="attendance-report"
                      element={<AttendanceReport />}
                    />
                  </Route>

                  {/* Documents SubRoutes */}
                  <Route path="expenses/*" element={<AdminContentBox />}>
                    <Route
                      index
                      element={<Navigate to="expense-documents" />}
                    />
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
                    <Route
                      path="esi-transaction"
                      element={<ESITransactions />}
                    />
                    <Route path="late-policy" element={<LatePolicy />} />
                    <Route path="policy-leave" element={<LeavePolicy />} />
                    <Route path="weekend-policy" element={<WeekendPolicy />} />
                    <Route path="atten-policy" element={<AttendancePolicy />} />
                  </Route>

                  {/* Approvals Main Page */}
                  <Route path="approvals" element={<ApprovalWrapper />} />

                  {/* Compliance SubRoutes */}
                  <Route path="compliance/*" element={<AdminContentBox />}>
                    <Route
                      index
                      element={<Navigate to="payment-adjustment" />}
                    />
                    <Route
                      path="payment-adjustment"
                      element={<PaymentAdjustment />}
                    />
                    <Route path="otrate" element={<OTSlabMaster />} />
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
                  <Route
                    path="mark-attendance"
                    element={<EmpMarkAttendance />}
                  />
                  <Route path="my-expenses" element={<EmpExpenses />} />
                  <Route path="my-documents" element={<EmpDocuments />} />
                  <Route path="travel-details" element={<EmpTravel />} />
                  <Route
                    path="advance-payment"
                    element={<EmpAdvancePayment />}
                  />
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
              <Route
                path="/employee/setup-password"
                element={<EmpCreatePassword />}
              />
              <Route
                path="/employee/forgot-password"
                element={<EmpForgetPassword />}
              />
              <Route
                path="/employee/reset-password"
                element={<EmpResetPassword />}
              />

              {/* Unauthorized Page for public access violations */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Catch-all for public users: show 404 */}
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default App;
