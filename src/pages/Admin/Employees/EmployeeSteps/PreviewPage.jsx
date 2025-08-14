import React from "react";
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

  const renderValue = (val) => {
    if (val === undefined || val === null || val === "") return "—";
    if (typeof val === "object" && val.label) return val.label; // nested object
    if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
      // date string
      return val.split("T")[0];
    }
    return val;
  };

  const handleFinish = () => {
    // reset the store
    resetStore();

    // show toast
    toast.success("Employee added successfully");

    // navigate after small delay to let toast appear
    setTimeout(() => {
      navigate("/admin-dashboard/employees/list");
    }, 500);
  };

  return (
    <div className="p-2 md:px-8 bg-white min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 border-b border-blue-300 pb-2 mb-3">
        Preview Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">
            Basic Details
          </h3>
          <p>
            <strong>Employee Code:</strong>{" "}
            {renderValue(basicDetails.employeeId)}
          </p>
          <p>
            <strong>Full Name:</strong>{" "}
            {renderValue(
              `${basicDetails.firstName || ""} ${
                basicDetails.middleName || ""
              } ${basicDetails.lastName || ""}`
            )}
          </p>
          <p>
            <strong>Email:</strong> {renderValue(basicDetails.workEmail)}
          </p>
          <p>
            <strong>Mobile:</strong> {renderValue(basicDetails.mobileNumber)}
          </p>
          <p>
            <strong>Gender:</strong> {renderValue(basicDetails.gender)}
          </p>
          <p>
            <strong>Department:</strong> {renderValue(basicDetails.department)}
          </p>
          <p>
            <strong>Designation:</strong>{" "}
            {renderValue(basicDetails.designation)}
          </p>
          <p>
            <strong>Work Location:</strong>{" "}
            {renderValue(basicDetails.workLocation)}
          </p>
          <p>
            <strong>Pay Schedule:</strong>{" "}
            {renderValue(basicDetails.payschedule)}
          </p>
          <p>
            <strong>Date of Joining:</strong>{" "}
            {renderValue(basicDetails.dateOfJoining)}
          </p>
        </div>

        {/* Salary Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">
            Salary Details
          </h3>
          <p>
            <strong>Basic Salary:</strong> ₹
            {renderValue(salaryDetails.basicSalary)}
          </p>
          <p>
            <strong>HRA:</strong> ₹{renderValue(salaryDetails.hra)}
          </p>
          <p>
            <strong>Bonus:</strong> ₹{renderValue(salaryDetails.bonus)}
          </p>
          <p>
            <strong>Fixed Allowance:</strong> ₹
            {renderValue(salaryDetails.fixedAllowance)}
          </p>
          <p>
            <strong>PF:</strong> ₹{renderValue(salaryDetails.pfEmployee)}
          </p>
          <p>
            <strong>TDS:</strong> ₹{renderValue(salaryDetails.tds)}
          </p>
          <p>
            <strong>Other Deductions:</strong> ₹
            {renderValue(salaryDetails.otherDeductions)}
          </p>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">
            Personal Details
          </h3>
          {Object.entries(personalDetails).map(([key, val]) => (
            <p key={key} className="capitalize">
              <strong>{key.replace(/([A-Z])/g, " $1")}: </strong>
              {renderValue(val)}
            </p>
          ))}
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">
            Payment Info
          </h3>
          <p>
            <strong>Bank Name:</strong> {renderValue(paymentInfo.bankName)}
          </p>
          <p>
            <strong>Branch:</strong> {renderValue(paymentInfo.bankBranch)}
          </p>
          <p>
            <strong>Account Number:</strong>{" "}
            {renderValue(paymentInfo.accountNumber)}
          </p>
          <p>
            <strong>IFSC Code:</strong> {renderValue(paymentInfo.ifscCode)}
          </p>
          <p>
            <strong>Payment Mode:</strong>{" "}
            {renderValue(paymentInfo.paymentMode)}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className=" flex justify-end">
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-primary text-white mt-2 mr-2 rounded-full hover:bg-secondary transition"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;
