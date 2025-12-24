import React from "react";
import AmountInWords from "../../../components/AmountInWords";

const EmpPayslipPreview4 = ({ config = {}, data, month, year }) => {
  if (!data) return null;

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

  /* ================= API DATA ================= */

  const employee = data?.employees?.[0] || {};
  const department = data?.department?.[0]?.name || "-";
  const workLocation = data?.workLocations?.[0]?.name || "-";
  const bank = data?.bankDetail?.[0] || {};
  const salary = data?.salaryDetail?.[0] || {};

  const payMonthYear = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  /* ================= EARNINGS (ALWAYS SHOWN) ================= */

  const earnings = [
    { label: "Basic Salary", amount: salary.basicSalary ?? 0 },
    { label: "House Rent Allowance", amount: salary.hra ?? 0 },
    { label: "Special Allowance", amount: salary.specialAllowance ?? 0 },
    { label: "Fixed Allowance", amount: salary.fixedAllowance ?? 0 },
    { label: "Other Allowances", amount: salary.otherAllowances ?? 0 },
    { label: "Conveyance Allowance", amount: salary.conveyanceAllowance ?? 0 },
    { label: "Bonus", amount: salary.bonus ?? 0 },
    { label: "Leave Encashment", amount: salary.leaveEncashment ?? 0 },
    { label: "Overtime", amount: salary.overtimeAmount ?? 0 },
    { label: "Arrears", amount: salary.arrears ?? 0 },
  ];

  /* ================= DEDUCTIONS ================= */

  const deductions = [
    { label: "Total Deductions", amount: salary.deductions ?? 0 },
  ];

  const totalEarnings = salary.earnings ?? 0;
  const totalDeductions = salary.deductions ?? 0;
  const netPay = salary.netPay ?? 0;

  /* ================= UI ================= */

  return (
    <div className="bg-white text-black text-sm max-w-4xl mx-auto p-6 border border-gray-300 shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">
        <div>
          {showOrgName && <h1 className="font-bold text-lg">{orgName}</h1>}
          {showOrgAddress && (
            <p className="text-xs text-gray-600 whitespace-pre-line">
              {orgAddress}
            </p>
          )}
        </div>
        {logo && (
          <img
            src={logo}
            alt="Logo"
            style={{ width: logoSize || 120 }}
            className="object-contain"
          />
        )}
      </div>

      <h2 className="text-center text-sm font-semibold border-t border-b py-2 my-2">
        Payslip for the month of {payMonthYear}
      </h2>

      {/* EMPLOYEE + NET PAY */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 space-y-1">
          <p>
            <strong>Employee Name</strong> : {employee.fullName || "-"},{" "}
            {employee.employeeCode || "-"}
          </p>
          {showDesignation && (
            <p>
              <strong>Designation</strong> : {employee.designation || "-"}
            </p>
          )}
          {showDepartment && (
            <p>
              <strong>Department</strong> : {department}
            </p>
          )}
          {showWorkLocation && (
            <p>
              <strong>Work Location</strong> : {workLocation}
            </p>
          )}
          <p>
            <strong>Date of Joining</strong> :{" "}
            {employee.dateOfJoining
              ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB")
              : "-"}
          </p>
          <p>
            <strong>Pay Period</strong> : {payMonthYear}
          </p>
          <p>
            <strong>Pay Date</strong> :{" "}
            {salary.paymentDate
              ? new Date(salary.paymentDate).toLocaleDateString("en-GB")
              : "-"}
          </p>
          {showPAN && (
            <p>
              <strong>PAN</strong> : {employee.panNumber || "-"}
            </p>
          )}
          {showBank && (
            <p>
              <strong>Bank Account No</strong> : {bank.accountNumber || "-"}
            </p>
          )}
        </div>

        <div className="border p-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-700">
            ₹{netPay.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-sm">
            Paid Days : {salary.totalWorkingDays || "-"}
          </p>
        </div>
      </div>

      {/* EARNINGS & DEDUCTIONS TABLE */}
      <div className="mb-4 border border-gray-300">
        <table className="w-full text-sm border-collapse">
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
            {Array.from({ length: Math.max(earnings.length, deductions.length) }).map(
              (_, index) => {
                const e = earnings[index] || {};
                const d = deductions[index] || {};
                return (
                  <tr key={index}>
                    <td className="border px-2 py-1">{e.label}</td>
                    <td className="border px-2 py-1 text-right">
                      ₹{Number(e.amount).toLocaleString("en-IN")}
                    </td>
                    {showYTD && <td className="border px-2 py-1 text-right">-</td>}
                    <td className="border px-2 py-1">{d.label}</td>
                    <td className="border px-2 py-1 text-right">
                      ₹{Number(d.amount).toLocaleString("en-IN")}
                    </td>
                    {showYTD && <td className="border px-2 py-1 text-right">-</td>}
                  </tr>
                );
              }
            )}

            <tr className="font-semibold bg-gray-50">
              <td className="border px-2 py-1">Gross Earnings</td>
              <td className="border px-2 py-1 text-right">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </td>
              {showYTD && <td />}
              <td className="border px-2 py-1">Total Deductions</td>
              <td className="border px-2 py-1 text-right">
                ₹{totalDeductions.toLocaleString("en-IN")}
              </td>
              {showYTD && <td />}
            </tr>
          </tbody>
        </table>
      </div>

      {/* NET PAY IN WORDS */}
      <p className="text-sm font-medium text-center mt-2">
        Total Net Payable ₹{netPay.toLocaleString("en-IN")} (
        <AmountInWords amount={netPay} currency="Indian Rupee" />)
      </p>

      {signature && (
        <div className={`mt-4 text-${signatureAlign || "left"}`}>
          <img src={signature} alt="Signature" style={{ width: 90 }} />
          <p className="text-xs text-gray-500">Authorized Signatory</p>
        </div>
      )}

      <p className="text-center text-gray-400 text-xs mt-4">
        — This is a system-generated document —
      </p>
    </div>
  );
};

export default EmpPayslipPreview4;
