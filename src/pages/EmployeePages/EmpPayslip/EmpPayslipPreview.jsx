import React, { useState, useEffect } from "react";
import AmountInWords from "../../../components/AmountInWords";
import { payslipTranslations } from "./payslipTranslations";

const EmpPayslipPreview = ({ config = {}, data, month, year }) => {
  const [language, setLanguage] = useState("en");
  const [remainingLeaves, setRemainingLeaves] = useState([]);
  const t = payslipTranslations[language];

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
    showLogo,
    showSignature,
    logo,
    logoSize,
    signature,
    signatureAlign,
    orgName,
    orgAddress,
  } = config;

  const employee = data?.employees?.[0] || {};
  console.log("Employee Data:", employee);
  const department = data?.department?.[0]?.name || "-";
  const location = data?.workLocations?.[0]?.name || "-";
  const bank = data?.bankDetail?.[0] || {};
  const salary = data?.salaryDetail?.[0] || {};

  const payMonthYear = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const earnings = [
    { label: t.earningLabels.basicSalary, amount: salary.basicSalary ?? 0 },
    { label: t.earningLabels.hra, amount: salary.hra ?? 0 },
    {
      label: t.earningLabels.specialAllowance,
      amount: salary.specialAllowance ?? 0,
    },
    {
      label: t.earningLabels.fixedAllowance,
      amount: salary.fixedAllowance ?? 0,
    },
    {
      label: t.earningLabels.otherAllowances,
      amount: salary.otherAllowances ?? 0,
    },
    {
      label: t.earningLabels.conveyanceAllowance,
      amount: salary.conveyanceAllowance ?? 0,
    },
    { label: t.earningLabels.bonus, amount: salary.bonus ?? 0 },
    {
      label: t.earningLabels.leaveEncashment,
      amount: salary.leaveEncashment ?? 0,
    },
    { label: t.earningLabels.overtime, amount: salary.overtimeAmount ?? 0 },
    { label: t.earningLabels.arrears, amount: salary.arrears ?? 0 },
  ];

  const deductions = [
    { label: t.deductionLabels.pf, amount: salary.pfEmployee ?? 0 },
    { label: t.deductionLabels.esic, amount: salary.esicEmployee ?? 0 },
    {
      label: t.deductionLabels.professionalTax,
      amount: salary.professionalTax ?? 0,
    },
    { label: t.deductionLabels.tds, amount: salary.tds ?? 0 },
    {
      label: t.deductionLabels.loanRepayment,
      amount: salary.loanRepayment ?? 0,
    },
    {
      label: t.deductionLabels.otherDeductions,
      amount: salary.otherDeductions ?? 0,
    },
  ].filter((d) => d.amount > 0);

  useEffect(() => {
    if (data?.leaveBalances) {
      setRemainingLeaves(data.leaveBalances);
    }
  }, [data]);

  return (
    <>
      {/* 🌐 Language Selector */}
      <div className="max-w-4xl mx-auto mb-3 text-right no-print">
        <select
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="gu">Gujarati</option>
          <option value="mr">Marathi</option>
          <option value="ml">Malayalam</option>
        </select>
      </div>

      <div className="bg-white shadow-lg p-8 border border-gray-200 rounded-md text-sm text-gray-800 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          {showLogo && logo && (
            <img src={logo} alt="Logo" style={{ width: logoSize || 140 }} />
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

        {/* Title */}
        <h2 className="text-base font-bold mb-2">
          {t.payslipFor} {payMonthYear}
        </h2>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <p>
            <strong>{t.employeeName}:</strong> {employee.fullName || "-"}
          </p>
          {/* {showDesignation && (
            <p>
              <strong>{t.designation}:</strong> {employee.designation || "-"}
            </p>
          )} */}
          {showDepartment && (
            <p>
              <strong>{t.department}:</strong> {department}
            </p>
          )}
          {showWorkLocation && (
            <p>
              <strong>{t.workLocation}:</strong> {location}
            </p>
          )}
          <p>
            <strong>{t.doj}:</strong>{" "}
            {employee.dateOfJoining
              ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB")
              : "-"}
          </p>
          {/* <p>
            <strong>{t.payDate}:</strong>{" "}
            {salary.paymentDate
              ? new Date(salary.paymentDate).toLocaleDateString("en-GB")
              : "-"}
          </p> */}
          {showPAN && (
            <p>
              <strong>{t.pan}:</strong> {employee.panNumber || "-"}
            </p>
          )}
          {showBank && (
            <>
              <p>
                <strong>{t.bankName}:</strong> {bank.bankName}
              </p>
              <p>
                <strong>{t.bankAccount}:</strong> {bank.accountNumber || "-"}
              </p>
            </>
          )}
        </div>

        {/* Net Pay */}
        <div className="flex justify-end my-4">
          <div className="border border-green-400 p-4 rounded bg-green-50 min-w-[220px] text-right">
            {/* Total Net Pay */}
            <p>{t.totalNetPay}</p>
            <p className="text-green-600 text-2xl font-bold">
              ₹{salary.netPay?.toLocaleString("en-IN")}
            </p>
            <p className="text-sm">
              {t.paidDays}: {salary.totalWorkingDays || "-"}
            </p>

            {/* Remaining Leaves (right-aligned, column-wise) */}
            {remainingLeaves.length > 0 && (
              <div className="mt-2 text-xs text-gray-700">
                <strong>{t.balanceLeaves}:</strong>
                <div className="mt-1 flex flex-wrap justify-end gap-x-2 gap-y-1">
                  {remainingLeaves.map((leave) => {
                    return (
                      <span
                        key={leave.leaveTypeId}
                        className="whitespace-nowrap"
                      >
                        {leave.leaveCode}: {leave.leavesRemaining}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold mb-2">{t.earnings}</h3>
            <table className="w-full border border-gray-400">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1 text-left">{t.component}</th>
                  <th className="p-1 text-right">{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e.label} className="border-t border-gray-400">
                    <td className="p-1">{e.label}</td>
                    <td className="p-1 text-right">
                      ₹{e.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t.deductions}</h3>
            <table className="w-full border border-gray-400">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1 text-left">{t.component}</th>
                  <th className="p-1 text-right">{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((d) => (
                  <tr key={d.label} className="border-t border-gray-400">
                    <td className="p-1">{d.label}</td>
                    <td className="p-1 text-right">
                      ₹{d.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-green-100 p-3 border border-green-400 rounded font-semibold">
          {t.totalNetPayable}: ₹{salary.netPay?.toLocaleString("en-IN")} (
          <AmountInWords amount={salary.netPay || 0} currency="Indian Rupee" />)
        </div>

        {showSignature && signature && (
          <div
            className={`mt-6 flex ${
              signatureAlign === "right"
                ? "justify-end"
                : signatureAlign === "center"
                  ? "justify-center"
                  : "justify-start"
            }`}
          >
            <div className="text-center">
              <img
                src={signature}
                alt="Signature"
                className="mx-auto"
                style={{ width: 90 }}
              />
              <p className="text-xs mt-1">{t.authorizedSignatory}</p>
            </div>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs mt-6">
          — {t.systemGenerated} —
        </p>
      </div>
    </>
  );
};

export default EmpPayslipPreview;
