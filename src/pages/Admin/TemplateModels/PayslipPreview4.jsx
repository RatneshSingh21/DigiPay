import React from "react";
import AmountInWords from "../../../components/AmountInWords";

const PayslipPreview4 = ({ config }) => {
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
    department,
    workLocation,
  } = config;

  const earnings = [
    { label: "Basic", amount: "₹60,000.00", ytd: "₹2,40,000.00" },
    {
      label: "House Rent Allowance",
      amount: "₹60,000.00",
      ytd: "₹2,40,000.00",
    },
    { label: "Conveyance Allowance", amount: "₹0.00", ytd: "₹0.00" },
    { label: "Fixed Allowance", amount: "₹0.00", ytd: "₹0.00" },
    { label: "Bonus", amount: "₹0.00", ytd: "₹0.00" },
    { label: "Commission", amount: "₹0.00", ytd: "₹0.00" },
    { label: "Leave Encashment", amount: "₹0.00", ytd: "₹0.00" },
  ];

  const deductions = [
    { label: "Income Tax", amount: "₹22,130.00", ytd: "₹2,65,554.00" },
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
    <div className="bg-white text-black text-sm max-w-4xl mx-auto p-6 border border-gray-300 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          {showOrgName && <h1 className="font-bold text-lg">{orgName}</h1>}
          {showOrgAddress && (
            <p className="text-xs text-gray-600 whitespace-pre-line">
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

      <h2 className="text-center text-sm font-semibold border-t border-b py-2 my-2">
        Payslip for the month of July 2025
      </h2>

      {/* Pay Summary & Net Pay Side-by-Side */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 space-y-1">
          <p>
            <strong>Employee Name</strong> : Preet Setty, emp012
          </p>
          {showDesignation && (
            <p>
              <strong>Designation</strong> : Software Engineer
            </p>
          )}
          {showDepartment && (
            <p>
              <strong>Department</strong> : {department || "Engineering"}
            </p>
          )}
          {showWorkLocation && (
            <p>
              <strong>Work Location</strong> : {workLocation || "Noida"}
            </p>
          )}
          <p>
            <strong>Date of Joining</strong> : 21-09-2014
          </p>
          <p>
            <strong>Pay Period</strong> : July 2025
          </p>
          <p>
            <strong>Pay Date</strong> : 31/07/2025
          </p>
          <p>
            <strong>PF A/C Number</strong> : AA/AAA/0000000/000/0000000
          </p>
          {showPAN && (
            <p>
              <strong>UAN</strong> : 101010101010
            </p>
          )}
          <p>
            <strong>ESI Number</strong> : 1234567890
          </p>
          {showBank && (
            <p>
              <strong>Bank Account No</strong> : 101010101010101
            </p>
          )}
        </div>
        <div className="border p-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-700">
            ₹{netPay.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-sm">Paid Days : 28</p>
          <p className="mt-2 text-sm"> LOP Days : 3</p>
        </div>
      </div>

      {/* Earnings & Deductions Table */}
      <div className="mb-4 border border-gray-300">
        <table className="w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="border px-2 py-1 text-left">EARNINGS</th>
              <th className="border px-2 py-1 text-right">AMOUNT</th>
              {showYTD && <th className="border px-2 py-1 text-right">YTD</th>}
              <th className="border px-2 py-1 text-left">DEDUCTIONS</th>
              <th className="border px-2 py-1 text-right">AMOUNT</th>
              {showYTD && <th className="border px-2 py-1 text-right">YTD</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({
              length: Math.max(earnings.length, deductions.length),
            }).map((_, index) => {
              const earning = earnings[index] || {
                label: "",
                amount: "",
                ytd: "",
              };
              const deduction = deductions[index] || {
                label: "",
                amount: "",
                ytd: "",
              };
              return (
                <tr key={index}>
                  <td className="border px-2 py-1">{earning.label}</td>
                  <td className="border px-2 py-1 text-right">
                    {earning.amount}
                  </td>
                  {showYTD && (
                    <td className="border px-2 py-1 text-right">
                      {earning.ytd}
                    </td>
                  )}
                  <td className="border px-2 py-1">{deduction.label}</td>
                  <td className="border px-2 py-1 text-right">
                    {deduction.amount}
                  </td>
                  {showYTD && (
                    <td className="border px-2 py-1 text-right">
                      {deduction.ytd}
                    </td>
                  )}
                </tr>
              );
            })}
            <tr className="font-semibold bg-gray-50">
              <td className="border px-2 py-1">Gross Earnings</td>
              <td className="border px-2 py-1 text-right">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </td>
              {showYTD && <td className="border px-2 py-1"></td>}
              <td className="border px-2 py-1">Total Deductions</td>
              <td className="border px-2 py-1 text-right">
                ₹{totalDeductions.toLocaleString("en-IN")}
              </td>
              {showYTD && <td className="border px-2 py-1"></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay Section Table */}
      <div className="border border-gray-300 mb-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left px-2 py-1" colSpan={2}>
                NET PAY
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">Gross Earnings</td>
              <td className="border px-2 py-1 text-right">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Total Deductions</td>
              <td className="border px-2 py-1 text-right">
                (-) ₹{totalDeductions.toLocaleString("en-IN")}
              </td>
            </tr>
            <tr className="font-bold bg-gray-50">
              <td className="border px-2 py-1">Total Net Payable</td>
              <td className="border px-2 py-1 text-right">
                ₹{netPay.toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <p className="text-sm font-medium text-center mt-2">
        Total Net Payable{" "}
        <span className="font-bold text-black">
          ₹{netPay.toLocaleString("en-IN")}
        </span>{" "}
        (
        <AmountInWords amount={netPay} currency="Indian Rupee" /> Only)
      </p>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-500 mt-2">
        **Total Net Payable = Gross Earnings − Total Deductions**
      </p>

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

      <p className="text-center text-gray-400 text-xs mt-4">
        — This is a system-generated document —
      </p>
    </div>
  );
};

export default PayslipPreview4;
