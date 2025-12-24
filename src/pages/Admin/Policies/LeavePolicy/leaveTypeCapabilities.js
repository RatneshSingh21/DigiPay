// leaveTypeCapabilities.js
export const LEAVE_TYPE_CAPABILITIES = {
  CL: {
    accrual: true,
    carryForward: false,
    encashment: false,
    halfDay: true,
    includeWeekends: false,
    includeHolidays: false,
    documentRequired: false
  },

  SL: {
    accrual: true,
    carryForward: true,
    encashment: false,
    halfDay: true,
    includeWeekends: false,
    includeHolidays: false,
    documentRequired: true
  },

  EL: {
    accrual: true,
    carryForward: true,
    encashment: true,
    halfDay: false,
    includeWeekends: false,
    includeHolidays: false,
    documentRequired: false
  },

  LWP: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: true,
    includeWeekends: true,
    includeHolidays: true,
    documentRequired: false
  },

  CO: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: false,
    includeWeekends: true,
    includeHolidays: true,
    documentRequired: false
  },

  ML: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: false,
    includeWeekends: true,
    includeHolidays: true,
    documentRequired: true,
    genderRestriction: "Female",
    fixedDaysInfo: "As per law (e.g. 182 days)"
  },

  PL: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: false,
    includeWeekends: true,
    includeHolidays: true,
    documentRequired: true,
    genderRestriction: "Male",
    fixedDaysInfo: "Typically 5–15 days"
  },

  RH: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: false,
    includeWeekends: false,
    includeHolidays: false,
    documentRequired: false,
    fixedDaysInfo: "Limited per year (selective)"
  },

  BL: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: false,
    includeWeekends: true,
    includeHolidays: true,
    documentRequired: true,
    fixedDaysInfo: "Typically 3–7 days"
  },

  MRL: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: false,
    includeWeekends: true,
    includeHolidays: true,
    documentRequired: true,
    fixedDaysInfo: "One-time event"
  },

  AL: {
    accrual: false,
    carryForward: false,
    encashment: false,
    halfDay: false,
    includeWeekends: true,
    includeHolidays: true,
    documentRequired: true
  }
};
