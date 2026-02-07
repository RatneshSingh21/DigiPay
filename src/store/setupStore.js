import { create } from "zustand";

const DEFAULT_STATUS = {
  company: false,
  financialYear: false,
  departments: false,
  designations: false,
  employees: false,
  salary: false,
  attendance: false,
  payroll: false,
  setupCompleted: false,
};

export const useSetupStore = create((set, get) => ({
  setupStatus:
    JSON.parse(localStorage.getItem("setupStatus")) || DEFAULT_STATUS,

  markStepComplete: (key) => {
    const updated = {
      ...get().setupStatus,
      [key]: true,
    };

    updated.setupCompleted = Object.entries(updated)
      .filter(([k]) => k !== "setupCompleted")
      .every(([, v]) => v === true);

    localStorage.setItem("setupStatus", JSON.stringify(updated));
    set({ setupStatus: updated });
  },

  resetSetup: () => {
    localStorage.removeItem("setupStatus");
    set({ setupStatus: DEFAULT_STATUS });
  },
}));
