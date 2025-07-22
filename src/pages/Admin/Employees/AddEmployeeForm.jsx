import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StepProgress from "./EmployeeComponents/StepProgress";
import BasicDetails from "./EmployeeSteps/BasicDetails";
import SalaryDetails from "./EmployeeSteps/SalaryDetails";
import PaymentInfo from "./EmployeeSteps/PaymentInfo";
import PreviewModal from "./EmployeeComponents/PreviewModal";

const AddEmployeeForm = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin-dashboard/employees");
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    employeeId: "",    
    dateOfJoining: "",
    workEmail: "",
    mobileNumber: "",
    gender: null,
    workLocation: null,
    designation: null,
    department: null,
    isDirector: false,
    portalAccess: false,
  });

  const [previewStep, setPreviewStep] = useState(null);
  const [editStep, setEditStep] = useState(null);

  const onNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onEdit = (step) => {
    setCurrentStep(step);
    setPreviewStep(null);
    setEditStep(step);
  };

  const onPreview = (step) => {
    setPreviewStep(step);
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-primary hover:scale-105 transition"
            title="Back to List"
          >
            <FaArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Employee
          </h2>
        </div>
      </div>

      <div>
        <StepProgress
          currentStep={currentStep}
          formData={formData}
          onEdit={onEdit}
          onPreview={onPreview}
        />

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Show form for currentStep */}
          {currentStep === 1 && (
            <BasicDetails
              formData={formData}
              setFormData={setFormData}
              onNext={() => {
                onNext();
                setEditStep(null);
              }}
              isEdit={editStep === 1}
            />
          )}
          {currentStep === 2 && (
            <SalaryDetails
              formData={formData}
              setFormData={setFormData}
              onNext={onNext}
              onBack={onBack}
            />
          )}
          {currentStep === 3 && (
            <PersonalDetails
              formData={formData}
              setFormData={setFormData}
              onNext={onNext}
              onBack={onBack}
            />
          )}
          {currentStep === 4 && (
            <PaymentInfo
              formData={formData}
              setFormData={setFormData}
              onBack={onBack}
              submitForm={() => alert("Form submitted!")}
            />
          )}
        </div>

        {/* Preview modal */}
        <PreviewModal
          visible={previewStep !== null}
          onClose={() => setPreviewStep(null)}
          title={`${
            previewStep?.charAt(0).toUpperCase() + previewStep?.slice(1)
          } Details`}
          data={formData}
          step={previewStep}
        />
      </div>
    </div>
  );
};

export default AddEmployeeForm;
