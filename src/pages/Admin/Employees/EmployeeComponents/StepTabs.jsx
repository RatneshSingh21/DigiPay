import React from "react";
import {
  FaUser,
  FaMoneyCheckAlt,
  FaAddressCard,
  FaCreditCard,
  FaEye,
} from "react-icons/fa";

import BasicDetails from "../EmployeeSteps/BasicDetails";
import SalaryDetails from "../EmployeeSteps/SalaryDetails";
import PersonalDetails from "../EmployeeSteps/PersonalDetails";
import PaymentInfo from "../EmployeeSteps/PaymentInfo";
import PreviewPage from "../EmployeeSteps/PreviewPage";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";

const steps = [
  { label: "Basic Detail", icon: FaUser, component: BasicDetails },
  { label: "Salary Details", icon: FaMoneyCheckAlt, component: SalaryDetails },
  { label: "Personal Details", icon: FaAddressCard, component: PersonalDetails },
  { label: "Payment Info", icon: FaCreditCard, component: PaymentInfo },
  { label: "Preview", icon: FaEye, component: PreviewPage },
];

const StepTabs = () => {
  const { currentStep, setCurrentStep } = useAddEmployeeStore();
   // Prevent index out of range
  const safeStepIndex = Math.min(Math.max(currentStep, 0), steps.length - 1);
const CurrentComponent = steps[safeStepIndex]?.component || (() => null);

  return (
    <div>
      {/* Stepper UI */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-6 sticky top-14 px-4 sm:px-16 py-3 mx-auto bg-white dark:bg-gray-900 shadow-lg z-10">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <React.Fragment key={index}>
              <div
                className="flex flex-col items-center cursor-pointer text-center"
                onClick={() => index <= currentStep && setCurrentStep(index)}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-blue-500 text-white border-blue-500"
                      : isCompleted
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-100 text-gray-400 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
                  }`}
                >
                  <Icon />
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-medium ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Horizontal line between steps */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <CurrentComponent />
      </div>
    </div>
  );
};

export default StepTabs;
