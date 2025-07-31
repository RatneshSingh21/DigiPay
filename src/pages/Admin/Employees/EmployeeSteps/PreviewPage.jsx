import React from "react";

const PreviewPage = ({ data = {}, onBack, onFinish }) => {
  const {
    basicDetails = {},
    salaryDetails = {},
    personalDetails = {},
    paymentInfo = {},
  } = data;

  const renderValue = (val) => (val !== undefined && val !== null ? val : "—");

  return (
    <div className="p-6 md:p-10 bg-blue-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 border-b border-blue-300 pb-4 mb-6">
        Preview Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Basic Details</h3>
          <p><strong>Employee Code:</strong> {renderValue(basicDetails.employeeCode)}</p>
          <p><strong>Full Name:</strong> {renderValue(`${basicDetails.firstName || ""} ${basicDetails.middleName || ""} ${basicDetails.lastName || ""}`)}</p>
          <p><strong>Email:</strong> {renderValue(basicDetails.workEmail)}</p>
          <p><strong>Mobile:</strong> {renderValue(basicDetails.mobileNumber)}</p>
          <p><strong>Gender:</strong> {renderValue(basicDetails.gender?.label)}</p>
        </div>

        {/* Salary Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Salary Details</h3>
          <p><strong>CTC:</strong> ₹{renderValue(salaryDetails.ctc)}</p>
          {salaryDetails.components && (
            <ul className="list-disc ml-6">
              {Object.entries(salaryDetails.components).map(([key, val]) => (
                <li key={key}>
                  <strong>{key}:</strong> ₹{val}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Personal Details</h3>
          {Object.entries(personalDetails).map(([key, val]) => (
            <p key={key}>
              <strong>{key.replace(/([A-Z])/g, " $1")}: </strong>{renderValue(val)}
            </p>
          ))}
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-2 border">
          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Payment Info</h3>
          <p><strong>Bank Name:</strong> {renderValue(paymentInfo.bankName)}</p>
          <p><strong>Branch:</strong> {renderValue(paymentInfo.bankBranch)}</p>
          <p><strong>Account Number:</strong> {renderValue(paymentInfo.accountNumber)}</p>
          <p><strong>IFSC Code:</strong> {renderValue(paymentInfo.ifscCode)}</p>
          <p><strong>Payment Mode:</strong> {renderValue(paymentInfo.paymentMode)}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            Back
          </button>
        )}
        {onFinish && (
          <button
            onClick={onFinish}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
