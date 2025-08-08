import { create } from 'zustand';

const useEmployeeAddFormStore = create((set) => ({
  employeeId: null,
  currentStep: 0,
  loading: false,
  formData: {
    basicDetails: {},
    salaryDetails: {},
    personalDetails: {},
    paymentInfo: {},
  },

  // Step Navigation
  goToNextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  goToPreviousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  setStep: (step) => set({ currentStep: step }),

  // Employee ID
  setEmployeeId: (id) => set({ employeeId: id }),

  // Form data
  updateFormData: (step, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [step]: {
          ...state.formData[step],
          ...data,
        },
      },
    })),

  // Loading
  setLoading: (loading) => set({ loading }),

  // Reset All
  resetForm: () =>
    set({
      employeeId: null,
      currentStep: 0,
      loading: false,
      formData: {
        basicDetails: {},
        salaryDetails: {},
        documents: {},
      },
    }),
}));

export default useEmployeeAddFormStore;
