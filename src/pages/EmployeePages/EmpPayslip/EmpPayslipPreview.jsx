import React, { useState, useEffect } from "react";
import AmountInWords from "../../../components/AmountInWords";
import { payslipTranslations } from "./payslipTranslations";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { LEAVE_CATALOG } from "../../Admin/Leave/LeaveType/leaveCatalog";

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
    { label: t.totalDeductions, amount: salary.deductions ?? 0 },
  ];

  useEffect(() => {
    if (!employee?.id) return;

    const fetchLeaveAllocation = async () => {
      try {
        const allocationRes = await axiosInstance.get(
          `/EmployeeLeaveAllocation/${employee.id}`
        );

        const allocations = allocationRes.data?.data || [];

        if (!allocations.length) {
          setRemainingLeaves([]);
          return;
        }

        const leaveTypeRes = await axiosInstance.get("/LeaveType/active");
        const leaveTypes = leaveTypeRes.data || [];

        const options = allocations
          .filter((a) => a.isActive)
          .map((a) => {
            const lt = leaveTypes.find((l) => l.leaveTypeId === a.leaveTypeId);

            if (!lt) return null;

            return {
              leaveTypeId: lt.leaveTypeId,
              leaveName: lt.leaveName,
              remaining: a.leavesRemaining,
            };
          })
          .filter(Boolean);

        setRemainingLeaves(options);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLeaveAllocation();
  }, [employee?.id]);

  return (
    <>
      {/* 🌐 Language Selector */}
      <div className="max-w-4xl mx-auto mb-3 text-right">
        <select
          className="border px-2 py-1 rounded text-sm"
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

      <div className="bg-white shadow-lg p-8 border rounded-md text-sm text-gray-800 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          {logo && (
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
          {showDesignation && (
            <p>
              <strong>{t.designation}:</strong> {employee.designation || "-"}
            </p>
          )}
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
          <p>
            <strong>{t.payDate}:</strong>{" "}
            {salary.paymentDate
              ? new Date(salary.paymentDate).toLocaleDateString("en-GB")
              : "-"}
          </p>
          {showPAN && (
            <p>
              <strong>{t.pan}:</strong> {employee.panNumber || "-"}
            </p>
          )}
          {showBank && (
            <p>
              <strong>{t.bankAccount}:</strong> {bank.accountNumber || "-"}
            </p>
          )}
        </div>

        {/* Net Pay */}
        <div className="flex justify-end my-4">
          <div className="border p-4 rounded bg-green-50 min-w-[220px] text-right">
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
                <strong>{t.remainingLeaves}:</strong>
                <div className="mt-1 flex flex-wrap justify-end gap-x-4 gap-y-1">
                  {remainingLeaves.map((leave) => {
                    const leaveCatalogItem = LEAVE_CATALOG.find(
                      (lc) => lc.label === leave.leaveName
                    );
                    if (!leaveCatalogItem) return null;

                    return (
                      <span
                        key={leave.leaveTypeId}
                        className="whitespace-nowrap"
                      >
                        {leaveCatalogItem.value}: {leave.remaining}
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
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1 text-left">{t.component}</th>
                  <th className="p-1 text-right">{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e.label} className="border-t">
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
            <table className="w-full border">
              <tbody>
                {deductions.map((d) => (
                  <tr key={d.label} className="border-t">
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
        <div className="mt-6 bg-green-100 p-3 border rounded font-semibold">
          {t.totalNetPayable}: ₹{salary.netPay?.toLocaleString("en-IN")} (
          <AmountInWords amount={salary.netPay || 0} currency="Indian Rupee" />)
        </div>

        {signature && (
          <div
            className={`mt-6 flex ${
              signatureAlign === "right" ? "justify-end" : "justify-start"
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
