import React from "react";
import AmountInWords from "../../../components/AmountInWords";

const EmpPayslipPreview3 = ({ config = {}, data, month, year }) => {
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

  /* ================= API DATA (SAME AS OTHER PREVIEWS) ================= */

  const employee = data?.employees?.[0] || {};
  const department = data?.department?.[0]?.name || "-";
  const location = data?.workLocations?.[0]?.name || "-";
  const bank = data?.bankDetail?.[0] || {};
  const salary = data?.salaryDetail?.[0] || {};

  const payMonthYear = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  /* ================= EARNINGS (SHOW ALL, ZERO DEFAULT) ================= */

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

  const deductions =
    salary.deductions > 0
      ? [{ label: "Total Deductions", amount: salary.deductions }]
      : [{ label: "Total Deductions", amount: 0 }];

  const totalEarnings = salary.earnings ?? 0;
  const totalDeductions = salary.deductions ?? 0;
  const netPay = salary.netPay ?? 0;

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className="bg-white p-8 shadow-md max-w-4xl mx-auto text-sm text-gray-800 border rounded-md">

      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-6">
        <div>
          {logo && (
            <img
              src={logo}
              alt="Company Logo"
              style={{ width: logoSize || 120 }}
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
          <p className="text-base font-semibold">{payMonthYear}</p>
        </div>
      </div>

      {/* ================= EMPLOYEE SUMMARY ================= */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p>
            <strong>Employee Name</strong> : {employee.fullName || "-"}
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
              <strong>Work Location</strong> : {location}
            </p>
          )}
          <p>
            <strong>Employee ID</strong> : {employee.employeeCode || "-"}
          </p>
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
        </div>

        <div className="bg-green-50 border rounded p-4">
          <p className="text-sm text-gray-500">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{netPay.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 text-sm">
            <p>
              <strong>Paid Days</strong> : {salary.totalWorkingDays || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* ================= BANK & IDS ================= */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p>
            <strong>PF A/C Number</strong> : {employee.pfNumber || "-"}
          </p>
          {showBank && (
            <p>
              <strong>Bank Account No</strong> : {bank.accountNumber || "-"}
            </p>
          )}
        </div>
        <div>
          {showPAN && (
            <p>
              <strong>PAN</strong> : {employee.panNumber || "-"}
            </p>
          )}
          <p>
            <strong>ESI Number</strong> : {employee.esiNumber || "-"}
          </p>
        </div>
      </div>

      {/* ================= EARNINGS & DEDUCTIONS TABLE ================= */}
      <div className="mb-6 border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-left">EARNINGS</th>
              <th className="p-2 text-right">AMOUNT</th>
              {showYTD && <th className="p-2 text-right">YTD</th>}
              <th className="p-2 text-left">DEDUCTIONS</th>
              <th className="p-2 text-right">AMOUNT</th>
              {showYTD && <th className="p-2 text-right">YTD</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({
              length: Math.max(earnings.length, deductions.length),
            }).map((_, i) => {
              const e = earnings[i] || { label: "", amount: 0 };
              const d = deductions[i] || { label: "", amount: 0 };
              return (
                <tr key={i} className="border-t">
                  <td className="p-2">{e.label}</td>
                  <td className="p-2 text-right">
                    ₹{e.amount.toLocaleString("en-IN")}
                  </td>
                  {showYTD && <td className="p-2 text-right">-</td>}
                  <td className="p-2">{d.label}</td>
                  <td className="p-2 text-right">
                    ₹{d.amount.toLocaleString("en-IN")}
                  </td>
                  {showYTD && <td className="p-2 text-right">-</td>}
                </tr>
              );
            })}

            <tr className="bg-gray-50 border-t font-semibold">
              <td className="p-2">Gross Earnings</td>
              <td className="p-2 text-right">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </td>
              {showYTD && <td />}
              <td className="p-2">Total Deductions</td>
              <td className="p-2 text-right">
                ₹{totalDeductions.toLocaleString("en-IN")}
              </td>
              {showYTD && <td />}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= NET PAY ================= */}
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

      <p className="text-center text-xs text-gray-400 mt-1">
        Amount In Words :{" "}
        <AmountInWords amount={netPay} currency="Indian Rupee" />
      </p>

      {/* ================= SIGNATURE ================= */}
      {signature && (
        <div
          className={`mt-6 ${
            signatureAlign === "right" ? "text-right" : "text-left"
          }`}
        >
          <img src={signature} alt="Signature" style={{ width: 90 }} />
          <p className="text-xs mt-1 text-gray-500">Authorized Signatory</p>
        </div>
      )}

      <p className="text-center text-gray-400 text-xs mt-6">
        — This is a system-generated document —
      </p>
    </div>
  );
};

export default EmpPayslipPreview3;
