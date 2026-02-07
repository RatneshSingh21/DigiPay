export const SETUP_STEPS = [
  {
    key: "company",
    title: "Company Profile",
    description: "Add your organisation details",
    route: "/admin/settings/company-profile",
  },
  {
    key: "financialYear",
    title: "Financial Year",
    description: "Configure payroll financial year",
    route: "/admin/payroll/financial-year",
  },
  {
    key: "departments",
    title: "Departments",
    description: "Create at least one department",
    route: "/admin/master/departments",
  },
  {
    key: "designations",
    title: "Designations",
    description: "Create designations for employees",
    route: "/admin/master/designations",
  },
  {
    key: "employees",
    title: "Employees",
    description: "Add at least one employee",
    route: "/admin/employees",
  },
  {
    key: "salary",
    title: "Salary Structure",
    description: "Define earnings & deductions",
    route: "/admin/payroll/salary-structure",
  },
  {
    key: "attendance",
    title: "Attendance Policy",
    description: "Configure attendance rules",
    route: "/admin/attendance/policy",
  },
  {
    key: "payroll",
    title: "Payroll Configuration",
    description: "Finalize payroll settings",
    route: "/admin/payroll/settings",
  },
];
