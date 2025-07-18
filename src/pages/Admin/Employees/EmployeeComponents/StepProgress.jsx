import { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";

export default function StepProgress({
  currentStep,
  formData,
  onEdit,
  onPreview,
}) {
  const steps = [
    "Basic Detail",
    "Salary Details",
    "Personal Details",
    "Payment Information",
  ];

  // Check if any summary card is visible
  const showSummary = currentStep > 1 || currentStep > 2 || currentStep > 3;

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 40);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <div className={`sticky bg-white top-14 flex flex-col items-center justify-center px-4  ${isScrolled ? "py-2" : "py-6"
        }`}>
      {/* Step Progress Bar */}
      <div
        className={`mb-6 transition-all duration-300 transform ${
          isScrolled ? "scale-70" : "scale-90"
        }`}
      >
        <div className="flex items-center space-x-6">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;

            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <div className="mt-2 text-sm text-center font-medium">
                    {label}
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className="w-10 h-0.5 bg-gray-400 mx-2 mb-4"></div>
                )}
              </div>
            );
          })}
        </div>
        <hr className="mt-3" />
      </div>

      {/* Summary Cards */}
      {showSummary && (
        <div className="w-full max-w-4xl">
          {currentStep > 1 && (
            <SummaryCard
              stepTitle="Basic Details"
              summaryLines={[
                `Name: ${formData.firstName || ""} ${formData.lastName || ""}`,
                `Employee ID: ${formData.employeeId || ""}`,
                `Work Email: ${formData.workEmail || ""}`,
              ]}
              onEdit={() => onEdit(1)}
              onPreview={() => onPreview("basic")}
            />
          )}

          {currentStep > 2 && (
            <SummaryCard
              stepTitle="Salary Details"
              summaryLines={[`CTC: ₹${formData.ctc || ""}`]}
              onEdit={() => onEdit(2)}
              onPreview={() => onPreview("salary")}
            />
          )}

          {currentStep > 3 && (
            <SummaryCard
              stepTitle="Personal Details"
              summaryLines={[
                `DOB: ${formData.dob || ""}`,
                `Father: ${formData.fatherName || ""}`,
              ]}
              onEdit={() => onEdit(3)}
              onPreview={() => onPreview("personal")}
            />
          )}
        </div>
      )}
    </div>
  );
}
