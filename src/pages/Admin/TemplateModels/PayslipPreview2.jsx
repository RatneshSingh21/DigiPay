import React from "react";
import assets from "../../../assets/assets";
import AmountInWords from "../../../components/AmountInWords";

const PayslipPreview2 = ({ config }) => {
  const {
    showPAN,
    showYTD,
    showBank,
    showWorkLocation,
    showDepartment,
    showDesignation,
    showOrgName,
    showOrgAddress,
    showLogo,
    showSignature,
    logo,
    logoSize,
    signature,
    signatureAlign,
    orgName,
    orgAddress,
  } = config;

  const earnings = [
    { label: "Basic", amount: "₹80,000", ytd: "₹1,80,000" },
    { label: "House Rent Allowance", amount: "₹30,000", ytd: "₹1,20,000" },
    { label: "Conveyance Allowance", amount: "₹10.00", ytd: "₹0.00" },
    { label: "Fixed Allowance", amount: "₹10.00", ytd: "₹0.00" },
    { label: "Bonus", amount: "₹0.00", ytd: "₹0.00" },
    { label: "Commission", amount: "₹0.00", ytd: "₹0.00" },
    { label: "Leave Encashment", amount: "₹0.00", ytd: "₹0.00" },
  ];

  const deductions = [
    { label: "Income Tax", amount: "₹21,130.00", ytd: "₹2,68,545.40" },
  ];

  const parseAmount = (amountStr) =>
    parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;

  const totalEarnings = earnings.reduce(
    (sum, item) => sum + parseAmount(item.amount),
    0,
  );
  const totalDeductions = deductions.reduce(
    (sum, item) => sum + parseAmount(item.amount),
    0,
  );
  const netPay = totalEarnings - totalDeductions;

  return (
    <div className="bg-white shadow-lg p-8 border rounded-md text-sm text-gray-800 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-6">
          {showOrgName && (
            <h1 className="text-xl font-bold text-gray-900">{orgName}</h1>
          )}
          {showOrgAddress && (
            <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
              {orgAddress}
            </p>
          )}
        </div>
        {showLogo && logo && (
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="Company Logo"
              style={{ width: `${logoSize}px` }}
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Payslip Title */}
      <div className="mb-4">
        <h2 className="text-base font-bold border-b pb-1 border-gray-200">
          Payslip for the month of June 2025
        </h2>
      </div>

      {/* Employee Info Table */}
      <table className="w-full text-sm mb-6 border border-gray-200">
        <tbody>
          <tr>
            <td className="border p-2 font-medium">Employee Name</td>
            <td className="border p-2">Atul Shivaan</td>
          </tr>
          <tr>
            <td className="border p-2 font-medium">Employee Code</td>
            <td className="border p-2">EMP012</td>
          </tr>
          {showDesignation && (
            <tr>
              <td className="border p-2 font-medium">Designation</td>
              <td className="border p-2">Software Engineer</td>
            </tr>
          )}
          {showDepartment && (
            <tr>
              <td className="border p-2 font-medium">Department</td>
              <td className="border p-2">Software Development</td>
            </tr>
          )}
          {showWorkLocation && (
            <tr>
              <td className="border p-2 font-medium">Work Location</td>
              <td className="border p-2">Gurgaon Office</td>
            </tr>
          )}
          <tr>
            <td className="border p-2 font-medium">Date of Joining</td>
            <td className="border p-2">21-09-2014</td>
          </tr>
          <tr>
            <td className="border p-2 font-medium">Pay Period</td>
            <td className="border p-2">June 2025</td>
          </tr>
          <tr>
            <td className="border p-2 font-medium">Pay Date</td>
            <td className="border p-2">30/06/2025</td>
          </tr>
          <tr>
            <td className="border p-2 font-medium">PF A/C Number</td>
            <td className="border p-2">AAAA/000000/000/0000000</td>
          </tr>
          {showPAN && (
            <tr>
              <td className="border p-2 font-medium">UAN</td>
              <td className="border p-2">100100100100</td>
            </tr>
          )}
          <tr>
            <td className="border p-2 font-medium">ESI Number</td>
            <td className="border p-2">1234567890</td>
          </tr>
          {showBank && (
            <tr>
              <td className="border p-2 font-medium">Bank Account No</td>
              <td className="border p-2">101010101010101</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Net Pay Summary */}
      <div className="flex justify-end mb-6">
        <div className="border p-4 text-right rounded shadow-sm bg-gray-50 w-64">
          <p className="text-gray-600">Total Net Pay</p>
          <p className="text-green-600 text-2xl font-bold">₹97,870.00</p>
          <p className="text-xs text-gray-500 mt-1">
            Paid Days: 28 | Leave Days: 3
          </p>
        </div>
      </div>

      {/* Earnings & Deductions */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Earnings</h3>
          <table className="w-full text-left border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Component</th>
                <th className="p-2">Amount</th>
                {showYTD && <th className="p-2">YTD</th>}
              </tr>
            </thead>
            <tbody>
              {earnings.map((item) => (
                <tr key={item.label} className="border-t">
                  <td className="p-2">{item.label}</td>
                  <td className="p-2">{item.amount}</td>
                  {showYTD && <td className="p-2">{item.ytd}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Deductions</h3>
          <table className="w-full text-left border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Component</th>
                <th className="p-2">Amount</th>
                {showYTD && <th className="p-2">YTD</th>}
              </tr>
            </thead>
            <tbody>
              {deductions.map((item) => (
                <tr key={item.label} className="border-t">
                  <td className="p-2">{item.label}</td>
                  <td className="p-2">{item.amount}</td>
                  {showYTD && <td className="p-2">{item.ytd}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gross & Deduction Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm font-medium mb-6">
        <div className="bg-blue-50 text-blue-800 border rounded p-3">
          <p>Gross Earnings</p>
          <p className="text-lg font-bold">
            ₹{totalEarnings.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-red-50 text-red-800 border rounded p-3 text-right">
          <p>Total Deductions</p>
          <p className="text-lg font-bold">
            ₹{totalDeductions.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Net Pay Footer */}
      <div className="mt-4 bg-green-100 text-green-800 p-4 border rounded text-sm font-semibold">
        Total Net Payable: ₹{netPay.toLocaleString("en-IN")} (
        <AmountInWords amount={netPay} currency="Indian Rupee" />)
      </div>

      {/* Signature */}
      {showSignature && signature && (
        <div
          className={`mt-6 ${
            signatureAlign === "left"
              ? "text-left"
              : signatureAlign === "center"
                ? "text-center"
                : "text-right"
          }`}
        >
          <img
            src={signature}
            alt="Signature"
            className="inline-block"
            style={{ width: "90px" }}
          />
          <p className="text-xs mt-1">Authorized Signatory</p>
        </div>
      )}

      <p className="text-center text-gray-400 text-xs mt-6">
        — This is a system-generated document —
      </p>
    </div>
  );
};

export default PayslipPreview2;
