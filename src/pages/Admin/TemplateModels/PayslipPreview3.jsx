import React from "react";
import AmountInWords from "../../../components/AmountInWords";

const PayslipPreview3 = ({ config }) => {
  const {
    showPAN,
    showYTD,
    showBank,
    showWorkLocation,
    showDepartment,
    showDesignation,
    showOrgName,
    showOrgAddress,
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
    0
  );
  const totalDeductions = deductions.reduce(
    (sum, item) => sum + parseAmount(item.amount),
    0
  );
  const netPay = totalEarnings - totalDeductions;

  return (
    <div className="bg-white p-8 shadow-md max-w-4xl mx-auto text-sm text-gray-800 border rounded-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          {logo && (
            <img
              src={logo}
              alt="Company Logo"
              style={{ width: `${logoSize}px` }}
              className="mb-2"
            />
          )}
          {showOrgName && (
            <h1 className="text-lg font-bold text-gray-900">{orgName}</h1>
          )}
          {showOrgAddress && (
            <p className="text-xs text-gray-600 whitespace-pre-line">
              {orgAddress}
            </p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-xs font-medium text-gray-500">
            Payslip For the Month
          </h2>
          <p className="text-base font-semibold">July 2025</p>
        </div>
      </div>

      {/* Employee Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p>
            <span className="font-semibold">Employee Name</span> : Preet Setty
          </p>
          {showDesignation && (
            <p>
              <span className="font-semibold">Designation</span> : Software
              Engineer
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
            <span className="font-semibold">Employee ID</span> : emp012
          </p>
          <p>
            <span className="font-semibold">Date of Joining</span> : 21-09-2014
          </p>
          <p>
            <span className="font-semibold">Pay Period</span> : July 2025
          </p>
          <p>
            <span className="font-semibold">Pay Date</span> : 31/07/2025
          </p>
        </div>
        <div className="bg-green-50 border rounded p-4">
          <p className="text-sm text-gray-500">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-600">₹97,870.00</p>
          <div className="mt-2 text-sm">
            <p>
              <span className="font-semibold">Paid Days</span> : 28
            </p>
            <p>
              <span className="font-semibold">LOP Days</span> : 3
            </p>
          </div>
        </div>
      </div>

      {/* Bank and ID Info */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p>
            <span className="font-semibold">PF A/C Number</span> :
            AA/AAA/0000000/000/0000000
          </p>
          {showBank && (
            <p>
              <span className="font-semibold">Bank Account No</span> :
              101010101010101
            </p>
          )}
        </div>
        <div>
          {showPAN && (
            <p>
              <span className="font-semibold">UAN</span> : 101010101010
            </p>
          )}
          <p>
            <span className="font-semibold">ESI Number</span> : 1234567890
          </p>
        </div>
      </div>

      {/* Earnings & Deductions - Exact Layout Match */}
      <div className="mb-6 border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 ">
            <tr>
              <th className="p-2 text-left w-1/6">EARNINGS</th>
              <th className="p-2 text-right w-1/6">AMOUNT</th>
              {showYTD && <th className="p-2 text-right w-1/6">YTD</th>}
              <th className="p-2 text-left l w-1/6">DEDUCTIONS</th>
              <th className="p-2 text-right w-1/6">AMOUNT</th>
              {showYTD && <th className="p-2 text-right w-1/6">YTD</th>}
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
                <tr key={index} className="border-t">
                  <td className="p-2">{earning.label}</td>
                  <td className="p-2 text-right">{earning.amount}</td>
                  {showYTD && <td className="p-2 text-right">{earning.ytd}</td>}
                  <td className="p-2">{deduction.label}</td>
                  <td className="p-2 text-right">{deduction.amount}</td>
                  {showYTD && (
                    <td className="p-2 text-right">{deduction.ytd}</td>
                  )}
                </tr>
              );
            })}

            <tr className="bg-gray-50 border-t font-semibold">
              <td className="p-2">Gross Earnings</td>
              <td className="p-2 text-right">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </td>
              {showYTD && <td className="p-2 text-right"></td>}
              <td className="p-2">Total Deductions</td>
              <td className="p-2 text-right">
                ₹{totalDeductions.toLocaleString("en-IN")}
              </td>
              {showYTD && <td className="p-2 text-right"></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay Box */}
      <div className="border rounded p-4 mb-2 bg-gray-50">
        <p className="text-xs text-gray-500 mb-1">TOTAL NET PAYABLE</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Gross Earnings − Total Deductions
          </span>
          <span className="text-xl font-bold text-green-700 bg-green-100 px-4 py-1 rounded">
            ₹{netPay.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Amount in Words */}
      <p className="text-center text-xs text-gray-400 mt-1">
        Amount In Words :{" "}
        <AmountInWords amount={netPay} currency="Indian Rupee" />
      </p>

      {/* Signature */}
      {signature && (
        <div className={`mt-6 text-${signatureAlign}`}>
          <img
            src={signature}
            alt="Signature"
            className="inline-block"
            style={{ width: "90px" }}
          />
          <p className="text-xs mt-1 text-gray-500">Authorized Signatory</p>
        </div>
      )}

      <p className="text-center text-gray-400 text-xs mt-6">
        — This is a system-generated document —
      </p>
    </div>
  );
};

export default PayslipPreview3;
