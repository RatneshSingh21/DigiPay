import React, { useEffect, useRef, useState } from "react";
import AmountInWords from "../../../components/AmountInWords";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import { useReactToPrint } from "react-to-print";

const EmpSalarySlip = () => {
  const [config, setConfig] = useState(null);
  const { user } = useAuthStore();
  const slipRef = useRef();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  // Load config once
  useEffect(() => {
    const savedConfigs = localStorage.getItem("templateConfigs");
    if (savedConfigs) {
      const parsedConfigs = JSON.parse(savedConfigs);
      setConfig(parsedConfigs.simple || null);
    }
  }, []);

  // Fetch salary slip
  useEffect(() => {
    if (!user) return;
    const fetchSlip = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/EmployeeSalarySlip/get", {
          params: {
            employeeId: user.userId,
            year,
            month,
          },
        });
        if (res.data?.length > 0) setData(res.data[0]);
        else setData(null);
      } catch (err) {
        console.error("Error fetching payslip:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlip();
  }, [user, month, year]);

  const handlePrint = useReactToPrint({
    contentRef: slipRef,
    documentTitle: "Salary Slip",
  });

  if (!config) {
    return <p className="text-center text-gray-500">Loading salary slip...</p>;
  }

  // Extract data safely
  const employee = data?.employees?.[0] || {};
  const dept = data?.department?.[0]?.name || "-";
  const location = data?.workLocations?.[0]?.name || "-";
  const bank = data?.bankDetail?.[0] || {};
  const salary = data?.salaryDetail?.[0] || {};

  const earnings = [
    { label: "Basic", amount: salary.basicSalary || 0 },
    { label: "HRA", amount: salary.hra || 0 },
    { label: "Fixed Allowance", amount: salary.fixedAllowance || 0 },
    { label: "Bonus", amount: salary.bonus || 0 },
    { label: "Arrears", amount: salary.arrears || 0 },
    { label: "Conveyance", amount: salary.conveyanceAllowance || 0 },
    { label: "Special Allowance", amount: salary.specialAllowance || 0 },
    { label: "Other Allowances", amount: salary.otherAllowances || 0 },
    { label: "Leave Encashment", amount: salary.leaveEncashment || 0 },
  ];

  const deductions = [{ label: "Deductions", amount: salary.deductions || 0 }];

  const totalEarnings = salary.earnings || 0;
  const totalDeductions = salary.deductions || 0;
  const netPay = salary.netPay || 0;

  return (
    <div className="p-4">
      {/* Header with filter on right */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-700">Employee Salary Slip</h2>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {data && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-secondary transition cursor-pointer"
            >
              Print Slip
            </button>
          )}
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <p className="text-center text-gray-500 mt-10">Loading payslip...</p>
      )}

      {/* No Slip Available */}
      {!loading && !data && (
        <div className="bg-white p-8 my-10 shadow-md max-w-md mx-auto text-center border rounded-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-red-100 text-red-500 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              No Payslip Available
            </h2>
            <p className="text-sm text-gray-500">
              No salary slip found for the selected month/year.
            </p>
          </div>
        </div>
      )}

      {/* Slip Display */}
      {!loading && data && (
        <div
          ref={slipRef}
          className="bg-white p-6 shadow-md max-w-4xl mx-auto text-sm text-gray-800 border rounded-md cursor-grab"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              {config.logo && (
                <img
                  src={config.logo}
                  alt="Company Logo"
                  style={{ width: config.logoSize || 140 }}
                  className="mb-2"
                />
              )}
              {config.showOrgName && (
                <h1 className="text-lg font-bold text-gray-900">
                  {config.orgName}
                </h1>
              )}
              {config.showOrgAddress && (
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {config.orgAddress}
                </p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-xs font-medium text-gray-500">
                Payslip For the Month
              </h2>
              <p className="text-base font-semibold">
                {new Date(salary.paymentDate).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div>
              <p>
                <span className="font-semibold">Employee Name</span> :{" "}
                {employee.fullName}
              </p>
              {config.showDepartment && (
                <p>
                  <strong>Department</strong> : {dept}
                </p>
              )}
              {config.showWorkLocation && (
                <p>
                  <strong>Work Location</strong> : {location}
                </p>
              )}
              <p>
                <span className="font-semibold">Employee ID</span> :{" "}
                {employee.employeeCode}
              </p>
              <p>
                <span className="font-semibold">Date of Joining</span> :{" "}
                {employee.dateOfJoining
                  ? new Date(employee.dateOfJoining)
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")
                  : ""}
              </p>
              <p>
                <span className="font-semibold">Pay Period</span> :{" "}
                {new Date(salary.paymentDate).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>
                <span className="font-semibold">Pay Date</span> :{" "}
                {salary.paymentDate
                  ? new Date(salary.paymentDate)
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")
                  : ""}
              </p>
            </div>
            <div className="bg-green-50 border rounded p-4">
              <p className="text-sm text-gray-500">Total Net Pay</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{netPay.toLocaleString("en-IN")}
              </p>
              <div className="mt-2 text-sm">
                <p>
                  <span className="font-semibold">Paid Days</span> :{" "}
                  {salary.totalWorkingDays}
                </p>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="mb-6 border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-2 text-left w-1/6">EARNINGS</th>
                  <th className="p-2 text-right w-1/6">AMOUNT</th>
                  {config.showYTD && (
                    <th className="p-2 text-right w-1/6">YTD</th>
                  )}
                  <th className="p-2 text-left w-1/6">DEDUCTIONS</th>
                  <th className="p-2 text-right w-1/6">AMOUNT</th>
                  {config.showYTD && (
                    <th className="p-2 text-right w-1/6">YTD</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(earnings.length, deductions.length),
                }).map((_, index) => {
                  const earning = earnings[index] || { label: "", amount: "" };
                  const deduction = deductions[index] || {
                    label: "",
                    amount: "",
                  };
                  return (
                    <tr key={index} className="border-t">
                      <td className="p-2">{earning.label}</td>
                      <td className="p-2 text-right">{earning.amount}</td>
                      {config.showYTD && <td className="p-2 text-right">-</td>}
                      <td className="p-2">{deduction.label}</td>
                      <td className="p-2 text-right">{deduction.amount}</td>
                      {config.showYTD && <td className="p-2 text-right">-</td>}
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 border-t font-semibold">
                  <td className="p-2">Gross Earnings</td>
                  <td className="p-2 text-right">
                    ₹{totalEarnings.toLocaleString("en-IN")}
                  </td>
                  {config.showYTD && <td className="p-2 text-right">-</td>}
                  <td className="p-2">Total Deductions</td>
                  <td className="p-2 text-right">
                    ₹{totalDeductions.toLocaleString("en-IN")}
                  </td>
                  {config.showYTD && <td className="p-2 text-right">-</td>}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Pay */}
          <div className="border rounded p-4 mb-2 bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">TOTAL NET PAYABLE</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Gross Earnings - Total Deductions
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

          {config.signature && (
            <div
              className={`flex flex-col ${
                config.signatureAlign === "right"
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <img
                src={config.signature}
                alt="Signature"
                className="inline-block"
                style={{ width: "80px" }}
              />
              <p className="text-xs text-gray-500">Authorized Signatory</p>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-4">
            — This is a system-generated document —
          </p>
        </div>
      )}
    </div>
  );
};

export default EmpSalarySlip;
