// ─────────────────────────────────────────
// DigiPay Chatbot Config
// Extend this file when moving to Tier 2 (live data)
// ─────────────────────────────────────────

export const ADMIN_ROUTES = [
  // Employees
  { path: "/admin-dashboard/employees/add", label: "Add Employee", description: "Add a new employee to the system" },
  { path: "/admin-dashboard/employees/list", label: "Employee List", description: "View all employees" },
  { path: "/admin-dashboard/employees/fullemployee-data", label: "Employee Details", description: "Full employee profile and data" },
  { path: "/admin-dashboard/employees/employee-salary-basic", label: "Basic Salary", description: "Set employee basic salary" },
  { path: "/admin-dashboard/employees/employee-salary-details", label: "Salary Details", description: "Detailed salary breakdown per employee" },
  { path: "/admin-dashboard/employees/emp-category", label: "Employee Category", description: "Manage employee categories" },
  { path: "/admin-dashboard/employees/emp-employmenttype", label: "Employment Type", description: "Manage employment types like full-time, contract" },
  { path: "/admin-dashboard/employees/emp-worktype", label: "Work Type", description: "Work type master settings" },
  { path: "/admin-dashboard/employees/emp-worknature", label: "Work Nature", description: "Work nature master settings" },
  { path: "/admin-dashboard/employees/general-imports", label: "Bulk Import Employees", description: "Import multiple employees via file upload" },
  { path: "/admin-dashboard/employees/general-settings", label: "Employee General Settings", description: "General employee configuration settings" },

  // Salary
  { path: "/admin-dashboard/salary/salary-configuration", label: "Salary Configuration", description: "Configure salary components and structure" },
  { path: "/admin-dashboard/salary/salary-policy", label: "Salary Policy", description: "Define salary policies" },
  { path: "/admin-dashboard/salary/default-setup", label: "Default Salary Setup", description: "Default salary policy configuration" },
  { path: "/admin-dashboard/salary/dynamic-setup", label: "Dynamic Salary Setup", description: "Dynamic salary rules and conditions" },
  { path: "/admin-dashboard/salary/company-salary-policy", label: "Company Salary Policy", description: "Company-wide salary policy" },
  { path: "/admin-dashboard/salary/add-advance", label: "Add Advance / Loan", description: "Add advance payment or loan for an employee" },
  { path: "/admin-dashboard/salary/salary-calculation", label: "Salary Calculation", description: "Run and process salary calculation" },
  { path: "/admin-dashboard/salary/download-slip", label: "Download Salary Slip", description: "Download payslips for employees" },

  // Attendance
  { path: "/admin-dashboard/attendance/attendance", label: "Attendance Overview", description: "View overall attendance status" },
  { path: "/admin-dashboard/attendance/attendance-punches", label: "Attendance Punches", description: "All punch in/out records and logs" },
  { path: "/admin-dashboard/attendance/add-attendance", label: "Add Attendance", description: "Manually add attendance for an employee" },
  { path: "/admin-dashboard/attendance/manual-attendance", label: "Manual Attendance", description: "Bulk manual attendance entry" },
  { path: "/admin-dashboard/attendance/rejected-punches", label: "Rejected / Mispunches", description: "View rejected punch and mispunch records" },
  { path: "/admin-dashboard/attendance/punch", label: "Punch Management", description: "Manage punch types and settings" },
  { path: "/admin-dashboard/attendance/atten-policy", label: "Attendance Policy", description: "Configure attendance policy rules" },
  { path: "/admin-dashboard/attendance/atten-record", label: "Attendance Records", description: "Detailed attendance records by employee" },
  { path: "/admin-dashboard/attendance/atten-calculation", label: "Attendance Calculation", description: "Run and view attendance calculation results" },
  { path: "/admin-dashboard/attendance/attendance-machine", label: "Biometric Machine", description: "Manage biometric attendance machines" },
  { path: "/admin-dashboard/attendance/emp-machine-mapping", label: "Employee Machine Mapping", description: "Map employees to biometric devices" },
  { path: "/admin-dashboard/attendance/machine-data-log", label: "Machine Data Log", description: "Raw data log from biometric machines" },
  { path: "/admin-dashboard/attendance/attendance-lock", label: "Attendance Lock", description: "Lock attendance records for a period" },

  // Leave
  { path: "/admin-dashboard/leave/leave-types", label: "Leave Types", description: "Manage leave types like CL, SL, EL" },
  { path: "/admin-dashboard/leave/leave-mapping", label: "Leave Mapping", description: "Map leave types to employee groups" },
  { path: "/admin-dashboard/leave/leave-requests", label: "Leave Requests", description: "View and approve or reject leave requests" },
  { path: "/admin-dashboard/leave/leave-balance", label: "Leave Balance", description: "Check remaining leave balance per employee" },
  { path: "/admin-dashboard/leave/holiday-list", label: "Holiday List", description: "Set and manage company holidays" },
  { path: "/admin-dashboard/leave/employee-leave", label: "Employee Leave", description: "Employee-wise full leave history" },
  { path: "/admin-dashboard/leave/employee-advance-payments", label: "Advance Payments", description: "Employee advance payment records" },
  { path: "/admin-dashboard/leave/employee-leave-allocation", label: "Leave Allocation", description: "Allocate leave quota to employees" },

  // Settings
  { path: "/admin-dashboard/settings/organisation-profile", label: "Organisation Profile", description: "Company profile and details" },
  { path: "/admin-dashboard/settings/departments", label: "Departments", description: "Manage company departments" },
  { path: "/admin-dashboard/settings/create-admin", label: "Create Admin", description: "Create a new admin user account" },
  { path: "/admin-dashboard/settings/create-from-employee", label: "Promote to Admin", description: "Give admin access to an existing employee" },
  { path: "/admin-dashboard/settings/work-locations", label: "Work Locations", description: "Add and manage office/work locations" },
  { path: "/admin-dashboard/settings/permissions", label: "Permissions", description: "Configure role-level permissions" },
  { path: "/admin-dashboard/settings/designation", label: "Designation", description: "Manage employee designations" },
  { path: "/admin-dashboard/settings/status-master", label: "Status Master", description: "Manage employee status types" },
  { path: "/admin-dashboard/settings/salary-calculation-type", label: "Salary Calculation Type", description: "Choose salary calculation method" },
  { path: "/admin-dashboard/settings/component-lock", label: "Component Lock", description: "Lock specific salary components" },
  { path: "/admin-dashboard/settings/employee-password-setup", label: "Employee Password Setup", description: "Set up or reset employee login passwords" },

  // Roles
  { path: "/admin-dashboard/role/role-master", label: "Role Master", description: "Create and manage user roles" },
  { path: "/admin-dashboard/role/approval-rules", label: "Approval Rules", description: "Define multi-level approval rules" },
  { path: "/admin-dashboard/role/approval-rule-roles", label: "Approval Rule Roles", description: "Map roles to approval workflows" },
  { path: "/admin-dashboard/role/emp-role-mapping", label: "Employee Role Mapping", description: "Assign roles to employees" },
  { path: "/admin-dashboard/role/employee-reporting-list", label: "Reporting Hierarchy", description: "Set up employee reporting structure" },
  { path: "/admin-dashboard/role/department-manager-mapping", label: "Department Manager", description: "Assign managers to departments" },

  // Shifts
  { path: "/admin-dashboard/payschedule-shifts/payschedule", label: "Pay Schedule", description: "Configure pay cycle and schedule" },
  { path: "/admin-dashboard/payschedule-shifts/add-shift", label: "Add Shift", description: "Create new shift timings" },
  { path: "/admin-dashboard/payschedule-shifts/mapp-shift", label: "Shift Mapping", description: "Assign shifts to employees" },
  { path: "/admin-dashboard/payschedule-shifts/shift-patterns", label: "Shift Patterns", description: "Set up rotating shift patterns" },

  // Policies
  { path: "/admin-dashboard/policy/pf-settings", label: "PF Settings", description: "Provident fund configuration" },
  { path: "/admin-dashboard/policy/pf-transaction", label: "PF Transactions", description: "PF transaction history" },
  { path: "/admin-dashboard/policy/pf-contribution-rule", label: "PF Contribution Rules", description: "Define PF contribution percentages" },
  { path: "/admin-dashboard/policy/esi-rule", label: "ESI Rules", description: "ESI eligibility and deduction rules" },
  { path: "/admin-dashboard/policy/esi-transaction", label: "ESI Transactions", description: "ESI transaction records" },
  { path: "/admin-dashboard/policy/late-policy", label: "Late Policy", description: "Rules for late coming deductions" },
  { path: "/admin-dashboard/policy/policy-leave", label: "Leave Policy", description: "Leave accrual and encashment rules" },
  { path: "/admin-dashboard/policy/weekend-policy", label: "Weekend Policy", description: "Weekend working rules and compensation" },
  { path: "/admin-dashboard/policy/atten-policy", label: "Attendance Policy", description: "Attendance rules and thresholds" },

  // Compliance / OT
  { path: "/admin-dashboard/compliance/payment-adjustment", label: "Payment Adjustment", description: "Manual adjustments to employee payments" },
  { path: "/admin-dashboard/compliance/otrate", label: "OT Rate Slab", description: "Overtime rate slab master" },
  { path: "/admin-dashboard/compliance/otrate-calculation", label: "OT Calculation", description: "Overtime calculation rules" },
  { path: "/admin-dashboard/compliance/ot-permission", label: "OT Permission", description: "Manage employee overtime permissions" },

  // Letters & Reports
  { path: "/admin-dashboard/letters/payslip-templates", label: "Payslip Templates", description: "Design and manage payslip templates" },
  { path: "/admin-dashboard/letters/salary-register", label: "Salary Register", description: "Full salary register report" },
  { path: "/admin-dashboard/letters/letter-intent", label: "Letter of Intent", description: "Generate letter of intent" },
  { path: "/admin-dashboard/letters/offer-letter", label: "Offer Letter", description: "Generate offer letters for new hires" },
  { path: "/admin-dashboard/letters/appointment-certi", label: "Appointment Letter", description: "Generate appointment certificates" },
  { path: "/admin-dashboard/letters/confirmation-certi", label: "Confirmation Letter", description: "Generate confirmation letters" },
  { path: "/admin-dashboard/letters/increment-letter", label: "Increment Letter", description: "Generate salary increment letters" },
  { path: "/admin-dashboard/letters/promotion-letter", label: "Promotion Letter", description: "Generate promotion letters" },
  { path: "/admin-dashboard/letters/relieving-letter", label: "Relieving Letter", description: "Generate relieving letters for exits" },
  { path: "/admin-dashboard/letters/experience-certi", label: "Experience Certificate", description: "Generate experience certificates" },
  { path: "/admin-dashboard/letters/job-posting", label: "Job Posting", description: "Create and manage job postings" },
  { path: "/admin-dashboard/letters/full-&-final-statement", label: "Full & Final Settlement", description: "Generate full and final settlement documents" },
  { path: "/admin-dashboard/letters/all-reports", label: "All Reports", description: "Overview of all available reports" },

  // Expenses & Documents
  { path: "/admin-dashboard/expenses/expense-header", label: "Expense Headers", description: "Manage expense categories and headers" },
  { path: "/admin-dashboard/expenses/expense-documents", label: "Expense Documents", description: "Employee expense claims and submissions" },
  { path: "/admin-dashboard/expenses/uploaded-documents", label: "Uploaded Documents", description: "All documents uploaded by employees" },
  { path: "/admin-dashboard/expenses/travel-details", label: "Travel Details", description: "Employee travel expense records" },

  // Approvals
  { path: "/admin-dashboard/approvals", label: "Approvals", description: "All pending approvals — leave, OD, expenses, attendance" },
];

export const EMPLOYEE_ROUTES = [
  { path: "/employee-dashboard/home", label: "My Dashboard", description: "Personal dashboard home" },
  { path: "/employee-dashboard/profile", label: "My Profile", description: "View and edit your profile" },
  { path: "/employee-dashboard/attendance", label: "My Attendance", description: "View your attendance records" },
  { path: "/employee-dashboard/mark-attendance", label: "Mark Attendance", description: "Mark your attendance for today" },
  { path: "/employee-dashboard/leave", label: "My Leave", description: "Apply for leave or view leave status" },
  { path: "/employee-dashboard/salary-slip", label: "Salary Slip", description: "Download your monthly salary slips" },
  { path: "/employee-dashboard/my-expenses", label: "My Expenses", description: "Submit and track your expense claims" },
  { path: "/employee-dashboard/my-documents", label: "My Documents", description: "View and upload your documents" },
  { path: "/employee-dashboard/travel-details", label: "Travel Details", description: "Log and view your travel records" },
  { path: "/employee-dashboard/advance-payment", label: "Advance Payment", description: "Request an advance payment or loan" },
  { path: "/employee-dashboard/on-duty", label: "On Duty / Out Duty", description: "Mark yourself as on duty or out duty" },
  { path: "/employee-dashboard/approvals", label: "My Approvals", description: "View approvals pending from you" },
];

// ─────────────────────────────────────────
// System prompt builder — inject role + routes at runtime
// ─────────────────────────────────────────
export const buildSystemPrompt = (role) => {
  const isAdmin = role === "Admin" || role === "SuperAdmin";
  const routes = isAdmin ? ADMIN_ROUTES : EMPLOYEE_ROUTES;

  const routeMap = routes
    .map((r) => `- ${r.path} → ${r.description}`)
    .join("\n");

  //   return `You are DigiPay Assistant, a helpful AI built into the DigiPay HR & Payroll platform.
  // Your job is to help users navigate the app, understand features, and find what they need — quickly and clearly.

  // CURRENT USER ROLE: ${role}

  // ─────────────────────────────────────────
  // BEHAVIOR RULES
  // ─────────────────────────────────────────

  // 1. Always respond in valid JSON only. No markdown, no text outside the JSON object.
  // 2. If the user wants to go somewhere or do something that has a page → use type "navigate"
  // 3. If the user is asking a question or needs explanation → use type "answer"
  // 4. If navigation + explanation are both needed → use type "navigate" with a full message
  // 5. Never show routes that don't belong to the user's role
  // 6. Be concise. If query is vague, suggest 2–3 possible actions the user can take
  // 7. If you don't understand, ask for clarification using type "answer"
  // 8. Speak like a helpful colleague, not a robot
  // 9. If the user writes in Hindi or Hinglish, respond in the same language — but always return valid JSON
  // 10. Never make up pages or features not listed in the route map below

  // ─────────────────────────────────────────
  // RESPONSE FORMAT
  // ─────────────────────────────────────────

  // For navigation:
  // {"type":"navigate","path":"/admin-dashboard/employees/add","label":"Add Employee","message":"You can add a new employee here. Fill in the basic details and save to create the record."}

  // For answers:
  // {"type":"answer","message":"Leave balance shows how many leaves each employee has remaining. You can find it under Leave > Leave Balance."}

  // ─────────────────────────────────────────
  // APP ROUTE MAP
  // ─────────────────────────────────────────

  // ${routeMap}`;

  return `You are DigiPay Assistant, a helpful AI built into the DigiPay HR & Payroll platform.

Your job is to help users:
- Navigate the app
- Understand features
- Complete tasks quickly and correctly

CURRENT USER ROLE: ${role}

─────────────────────────────────────────
BEHAVIOR RULES (STRICT)
─────────────────────────────────────────

1. ALWAYS respond in valid JSON only
   - No markdown
   - No extra text outside JSON

2. Use ONLY these response types:
   - "navigate"
   - "answer"

3. Use "navigate" when:
   - User wants to go to a page
   - User wants to perform an action

4. Use "answer" when:
   - User asks a question
   - No navigation is required

5. If both explanation + navigation are needed:
   → Use "navigate" with message

6. NEVER show routes outside the provided route map

7. NEVER generate or guess invalid routes

8. Be concise and helpful (no long paragraphs)

9. If user query is vague:
   → Suggest 2–3 possible actions

10. If you don’t understand:
   → Ask for clarification using "answer"

11. Match user language:
   - Hindi → reply in Hindi
   - Hinglish → reply in Hinglish
   - English → reply in English

12. Never behave like a generic chatbot
   → Act like a smart HR software assistant

─────────────────────────────────────────
INTENT UNDERSTANDING (VERY IMPORTANT)
─────────────────────────────────────────

Users may NOT use exact labels. You MUST map intent smartly.

ATTENDANCE:
"missing punch", "mispunch", "wrong punch", "punch issue"
→ Attendance Punches

IMPORTANT:
- "mispunch" does NOT mean rejected
- Only use "Rejected / Mispunches" when user explicitly says:
  "rejected punch" or "rejected attendance"

- "check attendance record", "attendance record"
  → Attendance Records

- "rejected punch"
  → Rejected / Mispunches  

- "add attendance", "manual attendance"
  → Add Attendance

LEAVE:
- "apply leave", "take leave", "leave record", "my leave", "approve leave", "leave approval"
  → Employee Leave

- "leave balance"
  → Leave Balance

SALARY:
- "salary slip", "payslip"
  → Download Salary Slip

- "advance salary", "loan"
  → Add Advance / Loan

- "process salary", "run payroll"
  → Salary Calculation

GENERAL:
- Always choose the MOST RELEVANT route
- If multiple matches → pick best fit
- If unclear → suggest options

─────────────────────────────────────────
RESPONSE FORMAT
─────────────────────────────────────────

NAVIGATION:
{"type":"navigate","path":"<route>","label":"<label>","message":"<what user should do there>"}

ANSWER:
{"type":"answer","message":"<clear explanation>"}

─────────────────────────────────────────
APP ROUTE MAP
─────────────────────────────────────────

${routeMap}
`;
};