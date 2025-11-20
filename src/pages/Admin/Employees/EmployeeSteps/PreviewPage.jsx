import React, { useEffect } from "react";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PreviewPage = () => {
  const {
    basicDetails,
    salaryDetails,
    personalDetails,
    paymentInfo,
    resetStore,
  } = useAddEmployeeStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Payment Details:", paymentInfo);
  }, [paymentInfo]);

  const renderValue = (val) => {
    if (val === undefined || val === null || val === "") return "—";
    if (typeof val === "object" && val.label) return val.label;
    if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return val.split("T")[0]; // date formatting
    }
    return val;
  };

  const handleFinish = () => {
    resetStore();
    toast.success("Employee added successfully");
    setTimeout(() => {
      navigate("/admin-dashboard/employees/list");
    }, 500);
  };

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-3">
        {title}
      </h3>
      <div className="divide-y text-sm">{children}</div>
    </div>
  );

  const Row = ({ label, value }) => (
    <div className="flex py-2">
      <span className="w-48 font-medium text-gray-600">{label} :</span>
      <span className="flex-1 text-gray-800">{renderValue(value)}</span>
    </div>
  );

  return (
    <div className="p-3 md:px-8 bg-gray-50 min-h-screen space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-200 text-white rounded-2xl p-6 shadow">
        <h2 className="text-2xl font-bold">
          {renderValue(
            `${basicDetails.firstName || ""} ${basicDetails.middleName || ""} ${
              basicDetails.lastName || ""
            }`
          )}
        </h2>
        <p className="text-sm opacity-90">
          Designation : {renderValue(basicDetails.designation)} <br />
          Department : {renderValue(basicDetails.department)}
        </p>
        <p className="text-sm">
          Employee Code: {renderValue(basicDetails.employeeId)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Details */}
        <Section title="Basic Details">
          <Row label="Email" value={basicDetails.workEmail} />
          <Row label="Mobile" value={basicDetails.mobileNumber} />
          <Row label="Gender" value={basicDetails.gender} />
          <Row label="Work Location" value={basicDetails.workLocation} />
          <Row label="Pay Schedule" value={basicDetails.payschedule} />
          <Row label="Date of Joining" value={basicDetails.dateOfJoining} />
        </Section>

        {/* Salary Details */}
        <Section title="Salary Details">
          <Row label="Basic Salary" value={`₹${salaryDetails.basicSalary}`} />
          <Row label="HRA" value={`₹${salaryDetails.hra}`} />
          <Row label="Bonus" value={`₹${salaryDetails.bonus}`} />
          <Row
            label="Fixed Allowance"
            value={`₹${salaryDetails.fixedAllowance}`}
          />
          <Row label="PF" value={`₹${salaryDetails.pfEmployee}`} />
          <Row label="TDS" value={`₹${salaryDetails.tds}`} />
          <Row
            label="Other Deductions"
            value={`₹${salaryDetails.otherDeductions}`}
          />
        </Section>

        {/* Personal Details */}
        <Section title="Personal Details">
          {Object.entries(personalDetails).map(([key, val]) => {
            const label = key
              .replace(/([A-Z])/g, " $1") // split camelCase
              .replace(/^./, (c) => c.toUpperCase()); // capitalize first letter
            return <Row key={key} label={label} value={val} />;
          })}
        </Section>

        {/* Payment Info */}
        <Section title="Payment Info">
          {paymentInfo ? (
            <>
              <Row
                label="Account Holder Name"
                value={paymentInfo.accountHolderName}
              />
              <Row label="Bank Name" value={paymentInfo.bankName} />
              <Row label="Branch Name" value={paymentInfo.branchName} />
              <Row label="Branch Address" value={paymentInfo.branchAddress} />
              <Row label="Account Number" value={paymentInfo.accountNumber} />
              <Row label="Account Type" value={paymentInfo.accountType} />
              <Row label="IFSC Code" value={paymentInfo.ifscCode} />
              <Row label="Payment Mode" value={paymentInfo.paymentMode} />
            </>
          ) : (
            <p className="text-gray-500 italic py-2">
              No payment info available
            </p>
          )}
        </Section>
      </div>

      {/* Buttons */}
      <div className="flex justify-center">
        <button
          onClick={handleFinish}
          className="px-6 py-2 bg-primary text-white rounded-full shadow-md hover:bg-secondary transition"
        >
          Finish & Save
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;
