import { useState } from "react";
import {
  FaUser,
  FaMoneyCheckAlt,
  FaAddressCard,
  FaCreditCard,
  FaEye,
} from "react-icons/fa";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import BasicDetails from "../EmployeeSteps/BasicDetails";
import SalaryDetails from "../EmployeeSteps/SalaryDetails";
import PersonalDetails from "../EmployeeSteps/PersonalDetails";
import PaymentInfo from "../EmployeeSteps/PaymentInfo";
import PreviewPage from "../EmployeeSteps/PreviewPage";

const steps = [
  { label: "Basic Detail", icon: <FaUser /> },
  { label: "Salary Details", icon: <FaMoneyCheckAlt /> },
  { label: "Personal Details", icon: <FaAddressCard /> },
  { label: "Payment Info", icon: <FaCreditCard /> },
  { label: "Preview", icon: <FaEye /> }, // preview step
];

const StepTabs = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    basicDetails: {},
    salaryDetails: {},
    personalDetails: {},
    paymentInfo: {},
  });
  const [employeeId, setEmployeeId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const goNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const goToStep = (index) => {
    if (index <= activeStep) setActiveStep(index); // allow only completed steps to go back
  };

  const updateData = (stepKey, data) => {
    setFormData((prev) => ({ ...prev, [stepKey]: data }));
  };

  const handleStepSubmit = async () => {
    try {
      if (activeStep === 0) {
        const fullName = `${formData.basicDetails.firstName || ""} ${
          formData.basicDetails.middleName || ""
        } ${formData.basicDetails.lastName || ""}`.trim();

        const payload = {
          fullName, // Required field for API
          employeeCode: formData.basicDetails.employeeId, // Correct mapping
          dateOfJoining: formData.basicDetails.dateOfJoining,
          workEmail: formData.basicDetails.workEmail,
          mobileNumber: formData.basicDetails.mobileNumber,
          isDirector: formData.basicDetails.isDirector || false,
          portalAccessEnabled: formData.basicDetails.portalAccess || false,
          gender: formData.basicDetails.gender?.value || "",
          departmentId: formData.basicDetails.department?.value || 0,
          designationId: formData.basicDetails.designation?.value || 0,
          workLocationId: formData.basicDetails.workLocation?.value || 0,
          payScheduleId: formData.basicDetails.payschedule?.value || 0,
        };

        let res;
        if (!isEditing) {
          res = await axiosInstance.post("/Employee", payload);
          setEmployeeId(res.data?.id);
          setIsEditing(true);
        } else {
          await axiosInstance.put(`/Employee/${employeeId}`, payload);
        }
        goNext();
      }

      if (activeStep === 1) {
        const { ctc = 0, components = {} } = formData.salaryDetails || {};

        const componentMap = {
          basicSalary: +(components["basicSalary"] || 0).toFixed(4),
          hra: +(components["hra"] || 0).toFixed(4),
          conveyanceAllowance: +(
            components["conveyanceAllowance"] || 0
          ).toFixed(4),
          fixedAllowance: +(components["fixedAllowance"] || 0).toFixed(4),
          bonus: +(components["bonus"] || 0).toFixed(4),
          arrears: +(components["arrears"] || 0).toFixed(4),
          leaveEncashment: +(components["leaveEncashment"] || 0).toFixed(4),
          specialAllowance: +(components["specialAllowance"] || 0).toFixed(4),
          pfEmployee: +(components["pfEmployee"] || 0).toFixed(4),
          esicEmployee: +(components["esicEmployee"] || 0).toFixed(4),
          professionalTax: +(components["professionalTax"] || 0).toFixed(4),
          tds: +(components["tds"] || 0).toFixed(4),
          loanRepayment: +(components["loanRepayment"] || 0).toFixed(4),
          otherDeductions: +(components["otherDeductions"] || 0).toFixed(4),
        };

        const payload = {
          employeeId,
          orgId: 6,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          employeeCategory: 1,
          ...componentMap,
        };

        console.log("✅ Salary Components (Rounded):", componentMap);
        console.log("📤 Salary Payload to POST:", payload);

        await axiosInstance.post("/Salary/create", payload);
        goNext();
      }

      if (activeStep === 2) {
        const payload = {
          ...formData.personalDetails,
          employeeId,
        };
        console.log(payload);
        await axiosInstance.post("/PersonalDetails/save", payload);
        goNext();
      }

      if (activeStep === 3) {
        // const payload = {
        //   ...formData.paymentInfo,
        //   employeeId,
        // };
        // await axiosInstance.post("/Employee/payment-info", payload);
        // toast.success("Employee created successfully!");
        goNext();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const renderStepComponent = () => {
    const commonProps = {
      data: formData,
      updateData,
      goNext: handleStepSubmit,
      employeeId,
      isEditing,
    };

    switch (activeStep) {
      case 0:
        return <BasicDetails {...commonProps} />;
      case 1:
        return <SalaryDetails {...commonProps} />;
      case 2:
        return <PersonalDetails {...commonProps} />;
      case 3:
        return <PaymentInfo {...commonProps} />;
      case 4:
        return (
          <PreviewPage
            data={formData}
            onBack={goBack}
            onFinish={() => {
              toast.success("Employee record Added Successfully! Redirecting...", {
                autoClose: 2000,
              });

              console.log("Final Submitted Data:", formData);

              setTimeout(() => {
                navigate("/admin-dashboard/employees/list");
              }, 2000); // Delay for 2 seconds
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-14 z-20 bg-white shadow px-5 py-4">
        <div className="flex items-center justify-center">
          <button
            onClick={goBack}
            disabled={activeStep === 0}
            className="p-2 text-gray-500 hover:text-primary disabled:opacity-30"
          >
            <FiArrowLeft size={22} />
          </button>

          <div className="flex w-full justify-between px-4 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center relative group cursor-pointer z-10"
                onClick={() => goToStep(index)}
              >
                {index !== 0 && (
                  <div className="absolute left-0 top-5 w-1/2 h-0.5 bg-secondary z-0"></div>
                )}
                {index !== steps.length - 1 && (
                  <div className="absolute right-0 top-5 w-1/2 h-0.5 bg-secondary z-0"></div>
                )}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    index === activeStep
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-secondary border-secondary group-hover:border-primary"
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    index === activeStep
                      ? "text-primary font-medium"
                      : "text-secondary group-hover:text-primary"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStepSubmit}
            className="p-2 text-gray-500 hover:text-primary"
            disabled={activeStep === steps.length - 1}
          >
            <FiArrowRight size={22} />
          </button>
        </div>
      </div>

      {renderStepComponent()}
    </div>
  );
};

export default StepTabs;
