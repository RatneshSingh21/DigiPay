import React, { forwardRef } from "react";
import assets from "../../../assets/assets";


const SalarySlipContent = forwardRef(({ month, year }, ref) => (
  <div ref={ref} className="bg-white border p-6 rounded-md max-w-3xl mx-auto text-sm text-gray-800 print:p-0 print:border-0">
    {/* Header */}
    <div className="text-center mb-6">
      <img src={assets.Digicode} alt="Company Logo" className="h-12 mx-auto mb-2" />
      <h1 className="text-xl font-bold">ABC Technologies Pvt. Ltd.</h1>
      <p className="text-sm">123 Business Park, Bangalore, India</p>
    </div>

    {/* Title */}
    <h2 className="text-lg font-semibold text-center underline mb-4">
      Salary Slip for {month} {year}
    </h2>

    {/* Employee Details */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <p><strong>Employee Name:</strong> John Doe</p>
      <p><strong>Employee Code:</strong> EMP123</p>
      <p><strong>Designation:</strong> Software Engineer</p>
      <p><strong>Department:</strong> Development</p>
    </div>

    {/* Salary Table */}
    <table className="w-full text-left border border-collapse mb-4">
      <thead>
        <tr>
          <th className="border px-3 py-2 bg-gray-100">Earnings</th>
          <th className="border px-3 py-2 bg-gray-100">Amount (₹)</th>
          <th className="border px-3 py-2 bg-gray-100">Deductions</th>
          <th className="border px-3 py-2 bg-gray-100">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-3 py-2">Basic Salary</td>
          <td className="border px-3 py-2">30,000</td>
          <td className="border px-3 py-2">Provident Fund</td>
          <td className="border px-3 py-2">1,800</td>
        </tr>
        <tr>
          <td className="border px-3 py-2">HRA</td>
          <td className="border px-3 py-2">10,000</td>
          <td className="border px-3 py-2">Professional Tax</td>
          <td className="border px-3 py-2">200</td>
        </tr>
        <tr>
          <td className="border px-3 py-2">Conveyance</td>
          <td className="border px-3 py-2">2,000</td>
          <td className="border px-3 py-2">TDS</td>
          <td className="border px-3 py-2">2,000</td>
        </tr>
        <tr className="font-semibold">
          <td className="border px-3 py-2">Total Earnings</td>
          <td className="border px-3 py-2">42,000</td>
          <td className="border px-3 py-2">Total Deductions</td>
          <td className="border px-3 py-2">4,000</td>
        </tr>
      </tbody>
    </table>

    {/* Net Pay */}
    <p className="text-right font-semibold text-lg">
      Net Pay: ₹38,000
    </p>

    {/* Footer */}
    <div className="mt-8 flex justify-between">
      <p>Authorized Signature</p>
      <p>Employee Signature</p>
    </div>
  </div>
));

export default SalarySlipContent;
