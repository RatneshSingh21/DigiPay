import React, { useState, useEffect } from "react";
import AmountInWords from "../../../components/AmountInWords";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { LEAVE_CATALOG } from "../../Admin/Leave/LeaveType/leaveCatalog";

const EmpPayslipPreview2 = ({ config = {}, data, month, year }) => {
  const [remainingLeaves, setRemainingLeaves] = useState([]);
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

  /* ================= SAME API LOGIC AS PREVIEW-1 ================= */

  const employee = data?.employees?.[0] || {};
  const department = data?.department?.[0]?.name || "-";
  const location = data?.workLocations?.[0]?.name || "-";
  const bank = data?.bankDetail?.[0] || {};
  const salary = data?.salaryDetail?.[0] || {};

  const payMonthYear = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  /* ================= EARNINGS ================= */
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

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className="bg-white shadow-lg p-8 border rounded-md text-sm text-gray-800 max-w-4xl mx-auto">
      {/* ================= HEADER ================= */}
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
        {logo && (
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: logoSize || 120 }}
            className="object-contain"
          />
        )}
      </div>

      {/* ================= TITLE ================= */}
      <h2 className="text-base font-bold border-b pb-1 mb-4">
        Payslip for the month of {payMonthYear}
      </h2>

      {/* ================= EMPLOYEE INFO ================= */}
      <table className="w-full border mb-6 text-sm">
        <tbody>
          <Row label="Employee Name" value={employee.fullName} />
          <Row label="Employee Code" value={employee.employeeCode} />
          {/* {showDesignation && (
            <Row label="Designation" value={employee.designation} />
          )} */}
          {showDepartment && <Row label="Department" value={department} />}
          {showWorkLocation && <Row label="Work Location" value={location} />}
          <Row
            label="Date of Joining"
            value={
              employee.dateOfJoining
                ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB")
                : "-"
            }
          />
          <Row label="Pay Period" value={payMonthYear} />
          {/* <Row
            label="Pay Date"
            value={
              salary.paymentDate
                ? new Date(salary.paymentDate).toLocaleDateString("en-GB")
                : "-"
            }
          /> */}
          {showPAN && <Row label="PAN" value={employee.panNumber} />}
          {showBank && (
            <Row
              label="Bank Details"
              value={
                <>
                  <strong>Bank Name</strong> : {bank.bankName || "-"}
                  <br />
                  <strong>Bank Account No</strong> : {bank.accountNumber || "-"}
                </>
              }
            />
          )}
        </tbody>
      </table>

      {/* ================= NET PAY ================= */}
      <div className="flex justify-end mb-6">
        <div className="border p-4 bg-gray-50 rounded w-64 text-right">
          <p className="text-gray-600">Total Net Pay</p>
          <p className="text-green-600 text-2xl font-bold">
            ₹{netPay.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500">
            Paid Days: {salary.totalWorkingDays || "-"}
          </p>

          {/* Remaining Leaves (right-aligned, column-wise) */}
          {remainingLeaves.length > 0 && (
            <div className="mt-2 text-xs text-gray-700">
              <strong>Balance Leaves:</strong>
              <div className="mt-1 flex flex-wrap justify-end gap-x-2 gap-y-1">
                {remainingLeaves.map((leave) => {
                  const leaveCatalogItem = LEAVE_CATALOG.find(
                    (lc) => lc.label === leave.leaveName
                  );
                  if (!leaveCatalogItem) return null;

                  return (
                    <span key={leave.leaveTypeId} className="whitespace-nowrap">
                      {leaveCatalogItem.value}: {leave.remaining}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= EARNINGS & DEDUCTIONS ================= */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <SalaryTable title="Earnings" rows={earnings} showYTD={showYTD} />
        <SalaryTable title="Deductions" rows={deductions} showYTD={showYTD} />
      </div>

      {/* ================= TOTAL SUMMARY ================= */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <SummaryBox title="Gross Earnings" value={totalEarnings} color="blue" />
        <SummaryBox
          title="Total Deductions"
          value={totalDeductions}
          color="red"
          align="right"
        />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="bg-green-100 p-4 rounded font-semibold">
        Total Net Payable: ₹{netPay.toLocaleString("en-IN")} (
        <AmountInWords amount={netPay} currency="Indian Rupee" />)
      </div>

      {/* ================= SIGNATURE ================= */}
      {/* {signature && (
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
            <p className="text-xs mt-1">Authorized Signatory</p>
          </div>
        </div>
      )} */}

      <p className="text-center text-xs text-gray-400 mt-6">
        — This is a system-generated document —
      </p>
    </div>
  );
};

/* ================= HELPERS ================= */

const Row = ({ label, value }) => (
  <tr>
    <td className="border p-2 font-medium">{label}</td>
    <td className="border p-2">{value || "-"}</td>
  </tr>
);

const SalaryTable = ({ title, rows, showYTD }) => (
  <div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Component</th>
          <th className="p-2 text-right">Amount</th>
          {showYTD && <th className="p-2 text-right">YTD</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-t">
            <td className="p-2">{r.label}</td>
            <td className="p-2 text-right">
              ₹{Number(r.amount).toLocaleString("en-IN")}
            </td>
            {showYTD && <td className="p-2 text-right">-</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SummaryBox = ({ title, value, color, align }) => (
  <div
    className={`bg-${color}-50 text-${color}-800 border rounded p-3 text-${align}`}
  >
    <p>{title}</p>
    <p className="text-lg font-bold">₹{value.toLocaleString("en-IN")}</p>
  </div>
);

export default EmpPayslipPreview2;
