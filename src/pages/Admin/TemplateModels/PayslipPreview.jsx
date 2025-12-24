import React from "react";
import AmountInWords from "../../../components/AmountInWords";

const PayslipPreview = ({ config }) => {
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
  } = config;

  // Move these definitions here BEFORE using them
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

  // Now it's safe to calculate totals
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
    <div className="bg-white shadow-lg p-8 border rounded-md text-sm text-gray-800 max-w-4xl mx-auto">
      {/* Header with Logo + Org Info */}
      <div className="flex justify-between items-start mb-4">
        {logo && (
          <img
            src={logo}
            alt="Logo"
            style={{ width: `${logoSize}px` }}
            className="mb-2"
          />
        )}
        <div className="text-right">
          {showOrgName && <p className="font-semibold text-lg">{orgName}</p>}
          {showOrgAddress && (
            <p className="text-xs text-gray-600 whitespace-pre-line">
              {orgAddress}
            </p>
          )}
        </div>
      </div>

      {/* Pay Summary */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-2">
          Payslip for the month of June 2025
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>
            <strong>Employee Name:</strong> Atul Shivaan, EMP012
          </p>
          {showDesignation && (
            <p>
              <strong>Designation:</strong> Software Engineer
            </p>
          )}
          {showDepartment && (
            <p>
              <strong>Department:</strong> Software Development
            </p>
          )}
          {showWorkLocation && (
            <p>
              <strong>Work Location:</strong> Gurgaon Office
            </p>
          )}
          <p>
            <strong>Date of Joining:</strong> 21-09-2014
          </p>
          <p>
            <strong>Pay Period:</strong> June 2025
          </p>
          <p>
            <strong>Pay Date:</strong> 30/06/2025
          </p>
          <p>
            <strong>PF A/C Number:</strong> AAAA/000000/000/0000000
          </p>
          {showPAN && (
            <p>
              <strong>UAN:</strong> 100100100100
            </p>
          )}
          <p>
            <strong>ESI Number:</strong> 1234567890
          </p>
          {showBank && (
            <p>
              <strong>Bank Account No:</strong> 101010101010101
            </p>
          )}
        </div>
      </div>

      {/* Net Pay Summary */}
      <div className="flex justify-end my-4">
        <div className="border p-4 text-right rounded">
          <p className="text-gray-600">Total Net Pay</p>
          <p className="text-green-600 text-2xl font-bold">₹97,870.00</p>
          <p className="text-sm">Paid Days: 28 | Leave Days: 3</p>
        </div>
      </div>

      {/* Salary Table */}
      <div className="mt-4 border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Earnings Table */}
          <div>
            <h3 className="font-semibold mb-2">Earnings</h3>
            <table className="w-full text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1">Component</th>
                  <th className="p-1">Amount</th>
                  {showYTD && <th className="p-1">YTD</th>}
                </tr>
              </thead>
              <tbody>
                {earnings.map((item) => (
                  <tr key={item.label} className="border-t">
                    <td className="p-1">{item.label}</td>
                    <td className="p-1">{item.amount}</td>
                    {showYTD && <td className="p-1">{item.ytd}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deductions Table */}
          <div>
            <h3 className="font-semibold mb-2">Deductions</h3>
            <table className="w-full text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1">Component</th>
                  <th className="p-1">Amount</th>
                  {showYTD && <th className="p-1">YTD</th>}
                </tr>
              </thead>
              <tbody>
                {deductions.map((item) => (
                  <tr key={item.label} className="border-t">
                    <td className="p-1">{item.label}</td>
                    <td className="p-1">{item.amount}</td>
                    {showYTD && <td className="p-1">{item.ytd}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Gross & Deduction Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm font-medium mt-6">
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
      <div className="mt-6 bg-green-100 text-green-800 p-3 border rounded text-sm font-semibold">
        Total Net Payable: ₹{netPay.toLocaleString("en-IN")} (
        <AmountInWords amount={netPay} currency="Indian Rupee" />)
      </div>

      {/* Signature */}
      {signature && (
        <div className={`mt-6 text-${signatureAlign}`}>
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

export default PayslipPreview;
