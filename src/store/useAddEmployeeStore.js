import { create } from "zustand";

export const useAddEmployeeStore = create((set) => ({
  currentStep: 0,
  totalSteps: 5, 
  employeeId: null,
  basicDetails: {},
  salaryDetails: {},
  personalDetails: {},
  paymentInfo: {},

  setCurrentStep: (updater) =>
    set((state) => ({
      currentStep:
        typeof updater === "function"
          ? updater(state.currentStep)
          : updater,
    })),
  setEmployeeId: (id) => set({ employeeId: id }),
  setStepData: (step, data) =>
    set((state) => ({
      [step]: { ...state[step], ...data },
    })),
  resetStore: () =>
    set({
      currentStep: 0,
      employeeId: null,
      basicDetails: {},
      salaryDetails: {},
      personalDetails: {},
      paymentInfo: {},
    }),
}));
