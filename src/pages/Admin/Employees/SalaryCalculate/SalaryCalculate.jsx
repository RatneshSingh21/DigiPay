import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import SalaryExportForm from "./SalaryExportForm";

// Manual
import ManualSalaryCalculateForm from "./ManualSalary/ManualSalaryCalculateForm";

// Dynamic
import SalaryCalculateDynamicForm from "./DynamicSalary/SalaryCalculateDynamicForm";
import SalaryCalculationResultModalDynamic from "./DynamicSalary/SalaryCalculationResultModalDynamic";
import SalaryCalculateGenerateAllDynamicForm from "./DynamicSalary/SalaryCalculateGenerateAllDynamicForm";

// Default
import SalaryCalculateGenerateAllDefaultForm from "./DefaultSalary/SalaryCalculateGenerateAllDefaultForm"
import SalaryGenerateDefaultForm from "./DefaultSalary/SalaryGenerateDefaultForm";
import SalaryCalculationResultModalDefault from "./DefaultSalary/SalaryCalculationResultModalDefault";

const inputClass =
  "mt-1 w-64 rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const months = [
  { label: "All Months", value: "" },
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const round = (value) => Math.round(Number(value || 0));

const SalaryCalculate = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showGenerateAllForm, setShowGenerateAllForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showExportForm, setShowExportForm] = useState(false);
  const [salaryResult, setSalaryResult] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  /* ================= FILTERED DATA ================= */
  const filteredSalaries = [...salaries]
    .filter((s) => {
      const term = search.toLowerCase();

      const matchesSearch =
        s.employeeName?.toLowerCase().includes(term) ||
        s.employeeCode?.toLowerCase().includes(term);

      const matchesMonth =
        selectedMonth === "" || Number(s.month) === Number(selectedMonth);

      return matchesSearch && matchesMonth;
    })
    .sort((a, b) =>
      (a.employeeCode || "").localeCompare(b.employeeCode || "", undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    return filteredSalaries.reduce(
      (acc, s) => {
        /* ACTUAL SALARY */
        acc.actualBasic += s.actualBasicSalary || 0;
        acc.actualHRA += s.actualHRA || 0;
        acc.actualSpecial += s.actualSpecialAllowance || 0;
        acc.actualConv += s.actualConveyanceAllowance || 0;
        acc.actualFixed += s.actualFixedAllowance || 0;
        acc.actualCTC += s.actualCTC || 0;

        /* CALCULATED SALARY */
        acc.basic += s.calculatedBasicSalary || 0;
        acc.hra += s.calculatedHRA || 0;
        acc.special += s.calculatedSpecialAllowance || 0;
        acc.conveyance += s.calculatedConveyanceAllowance || 0;
        acc.fixed += s.calculatedFixedAllowance || 0;

        acc.bonus += s.bonus || 0;
        acc.arrears += s.arrears || 0;
        acc.leaveEncash += s.leaveEncashment || 0;

        acc.otAmount += s.overtimeAmount || 0;

        acc.gross += s.grossEarnings || 0;

        /* DEDUCTIONS */
        acc.pf += s.pfEmployee || 0;
        acc.esic += s.esicEmployee || 0;
        acc.pt += s.professionalTax || 0;
        acc.tds += s.tds || 0;
        acc.loan += s.loanRepayment || 0;
        acc.other += s.otherDeductions || 0;
        acc.lopDed += s.lopDeduction || 0;
        acc.lateDed += s.lateDeduction || 0;

        acc.deductions += s.totalDeductions || 0;
        acc.net += s.netSalary || 0;

        return acc;
      },
      {
        actualBasic: 0,
        actualHRA: 0,
        actualSpecial: 0,
        actualConv: 0,
        actualFixed: 0,
        actualCTC: 0,

        basic: 0,
        hra: 0,
        special: 0,
        conveyance: 0,
        fixed: 0,

        bonus: 0,
        arrears: 0,
        leaveEncash: 0,
        otAmount: 0,

        gross: 0,

        pf: 0,
        esic: 0,
        pt: 0,
        tds: 0,
        loan: 0,
        other: 0,
        lopDed: 0,
        lateDed: 0,

        deductions: 0,
        net: 0,
      },
    );
  }, [filteredSalaries]);

  /* ================= API ================= */

  const fetchSalaries = async () => {
    try {
      if (!selectedMonth) return;

      setLoading(true);

      const res = await axiosInstance.get(`/CalculatedSalary/monthly-summary`, {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      });

      setSalaries(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payroll summary");
    } finally {
      setLoading(false);
    }
  };
  // const fetchSalaries = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axiosInstance.get("/CalculatedSalary");
  //     setSalaries(res.data.data || []);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to fetch salaries");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchSalaries();
  }, [selectedMonth, selectedYear]);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-2 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Calculated Salaries</h2>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name or Code..."
            className={inputClass}
          />
          <div className="w-40 text-sm">
            <Select
              options={months}
              value={months.find(
                (m) => String(m.value) === String(selectedMonth),
              )}
              onChange={(opt) => setSelectedMonth(opt?.value ?? "")}
              isClearable={false}
              menuPortalTarget={document.body}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "30px",
                  height: "30px",
                  borderColor: "#93c5fd",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 8px",
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: "30px",
                }),
              }}
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md text-sm"
          >
            Calculate Salary
          </button>

          <button
            onClick={() => setShowManualForm(true)}
            className="flex items-center cursor-pointer gap-2 bg-secondary hover:bg-primary text-white px-3 py-1.5 rounded-md text-sm"
          >
            Calculate Manual
          </button>

          <button
            onClick={() => setShowGenerateAllForm(true)}
            className="flex items-center cursor-pointer gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm"
          >
            Generate All Salary
          </button>
        </div>
      </div>
      <div className="flex justify-end mb-2 mr-2">
        <button
          onClick={() => setShowExportForm(true)}
          className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md text-sm"
        >
          Export Excel
        </button>
      </div>

      <div className="border mx-auto max-w-xl md:min-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto border-gray-200 rounded-lg max-h-[75vh]">
        <table className="table-fixed divide-y divide-gray-200 text-xs text-center">
          <thead className="text-gray-700 sticky top-0">
            {/* GROUP HEADER */}
            <tr className="text-gray-700 text-xs font-semibold">
              <th
                colSpan={5}
                className="p-2 bg-blue-100 border-r border-gray-300"
              >
                Employee Details
              </th>

              <th
                colSpan={12}
                className="p-2 bg-indigo-100 border-r border-gray-300"
              >
                Attendance And Leaves
              </th>

              <th
                colSpan={6}
                className="p-2 bg-blue-100 border-r border-gray-300"
              >
                Actual Earnings
              </th>

              <th
                colSpan={12}
                className="p-2 bg-green-100 border-r border-gray-300"
              >
                Calculated Earnings
              </th>

              <th
                colSpan={9}
                className="p-2 bg-red-100 border-r border-gray-300"
              >
                Calculated Deductions
              </th>

              <th colSpan={1} className="p-2 bg-purple-100">
                Final
              </th>
            </tr>
            <tr className="bg-gray-100">
              {/* Employee Details */}
              <th className="p-2 border-r border-gray-200">S.No</th>
              <th className="p-2 border-r border-gray-200">EmpName</th>
              <th className="p-2 border-r border-gray-200">Dept.</th>
              <th className="p-2 border-r border-gray-200">Month</th>
              <th className="p-2 border-r border-gray-200">Year</th>

              {/* Attendance */}
              <th className="p-2 border-r border-gray-200">MonthDays</th>
              <th className="p-2 border-r border-gray-200">Work.Days</th>
              <th className="p-2 border-r border-gray-200">Weekend</th>
              <th className="p-2 border-r border-gray-200">Holiday</th>
              <th className="p-2 border-r border-gray-200">Present</th>
              <th className="p-2 border-r border-gray-200">Absent</th>
              <th className="p-2 border-r border-gray-200">LeaveDays</th>
              <th className="p-2 border-r border-gray-200">Paid LeaveDays</th>
              <th className="p-2 border-r border-gray-200">UnPaid LeaveDays</th>
              <th className="p-2 border-r border-gray-200">Half Days</th>
              <th className="p-2 border-r border-gray-200">Payable Days</th>
              <th className="p-2 border-r border-gray-200">LOP Days</th>

              {/* Actual Salary */}
              <th className="p-2 border-r border-gray-200">Basic</th>
              <th className="p-2 border-r border-gray-200">HRA</th>
              <th className="p-2 border-r border-gray-200">Special</th>
              <th className="p-2 border-r border-gray-200">Conveyance</th>
              <th className="p-2 border-r border-gray-200">Fixed</th>
              <th className="p-2 border-r border-gray-200">Gross Earning</th>

              {/* Calculated Salary */}
              <th className="p-2 border-r border-gray-200">Basic</th>
              <th className="p-2 border-r border-gray-200">HRA</th>
              <th className="p-2 border-r border-gray-200">Special</th>
              <th className="p-2 border-r border-gray-200">Conveyance</th>
              <th className="p-2 border-r border-gray-200">Fixed</th>
              <th className="p-2 border-r border-gray-200">Bonus</th>
              <th className="p-2 border-r border-gray-200">Arrears</th>
              <th className="p-2 border-r border-gray-200">LeaveEncash</th>
              <th className="p-2 border-r border-gray-200">OTHrs</th>
              <th className="p-2 border-r border-gray-200">OTRate</th>
              <th className="p-2 border-r border-gray-200">OTAmount</th>
              <th className="p-2 border-r border-gray-200">Gross Earning</th>

              {/* Deductions */}
              <th className="p-2 border-r border-gray-200">PF</th>
              <th className="p-2 border-r border-gray-200">ESIC</th>
              <th className="p-2 border-r border-gray-200">PT</th>
              <th className="p-2 border-r border-gray-200">TDS</th>
              <th className="p-2 border-r border-gray-200">Loan</th>
              <th className="p-2 border-r border-gray-200">OtherDed.</th>
              <th className="p-2 border-r border-gray-200">LOPDed.</th>
              <th className="p-2 border-r border-gray-200">LATEDed.</th>
              <th className="p-2 border-r border-gray-200">TotalDed.</th>
              <th className="p-2 border-r border-gray-200">Net Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-center">
            {loading ? (
              <tr>
                <td colSpan={26} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredSalaries.length > 0 ? (
              filteredSalaries.map((s, i) => (
                <tr
                  key={`${s.employeeId}-${s.month}-${s.year}`}
                  onClick={() =>
                    setSelectedRowId(`${s.employeeId}-${s.month}-${s.year}`)
                  }
                  className={`cursor-pointer transition-all
                    ${selectedRowId === `${s.employeeId}-${s.month}-${s.year}`
                      ? "bg-yellow-200"
                      : i % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }
                    hover:bg-yellow-100
                  `}
                >
                  {/* Employee Details */}
                  <td className="px-2 py-2 border-r border-gray-200">
                    {i + 1}.
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.employeeName}({s.employeeCode})
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.departmentName}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.month}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.year}
                  </td>

                  {/* Attendance */}
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.daysInMonth ? s.daysInMonth : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.totalWorkingDays ? s.totalWorkingDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.weekends ? s.weekends : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.holidays ? s.holidays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.presentDays ? s.presentDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.absentDays ? s.absentDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.leaveDays ? s.leaveDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.paidLeaveDays ? s.paidLeaveDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.unpaidLeaveDays ? s.unpaidLeaveDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.halfDays ? s.halfDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.payableDays ? s.payableDays : 0}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.lopDays ? s.lopDays : 0}
                  </td>

                  {/* Actual Salary */}
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.actualBasicSalary)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.actualHRA)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.actualSpecialAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.actualConveyanceAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.actualFixedAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.actualCTC)}
                  </td>

                  {/* Calculated Salary */}

                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.calculatedBasicSalary)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.calculatedHRA)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.calculatedSpecialAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.calculatedConveyanceAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.calculatedFixedAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.calculatedBonus)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.calculatedArrears)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.calculatedLeaveEncashment
                      ? round(s.calculatedLeaveEncashment)
                      : 0}
                  </td>

                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.overtimeHours}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.overtimeRate}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.overtimeAmount)}
                  </td>

                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.grossEarnings)}
                  </td>

                  {/* Deductions */}
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.pfEmployee)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.esicEmployee)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.professionalTax)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.tds)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.loanRepayment)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.otherDeductions)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.lopDeduction)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.lateDeduction)}
                  </td>

                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.totalDeductions)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.netSalary)}
                  </td>
                </tr>
              ))
            ) : !selectedMonth ? (
              <tr>
                <td colSpan={45}>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FaCalendarAlt className="text-4xl mb-3 text-blue-400" />

                    <p className="text-lg font-medium">
                      Select a month to view salary data
                    </p>

                    <p className="text-sm text-gray-400">
                      Please choose a month from the dropdown above.
                    </p>
                  </div>
                </td>
              </tr>
            ) : search !== "" ? (
              <tr>
                <td colSpan={45}>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FaSearch className="text-4xl mb-3 text-gray-400" />

                    <p className="text-lg font-medium">
                      No matching employees found
                    </p>

                    <p className="text-sm text-gray-400">
                      Try searching with a different employee name or code.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={45}>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FaCalendarAlt className="text-4xl mb-3 text-gray-400" />

                    <p className="text-lg font-medium">
                      No salary records found
                    </p>

                    <p className="text-sm text-gray-400">
                      Salary may not be generated for this month yet.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          <tfoot className="sticky bottom-0 bg-gray-200 font-semibold text-xs">
            <tr>
              {/* Employee Details (5 columns) */}
              <td
                colSpan={5}
                className="p-2 border-r border-gray-200 text-right"
              >
                TOTAL
              </td>

              {/* Attendance (12 columns) */}
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>

              {/* ACTUAL EARNINGS (6 columns) */}
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.actualBasic)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.actualHRA)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.actualSpecial)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.actualConv)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.actualFixed)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.actualCTC)}
              </td>

              {/* CALCULATED EARNINGS (12 columns) */}
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.basic)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.hra)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.special)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.conveyance)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.fixed)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.bonus)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.arrears)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.leaveEncash)}
              </td>

              <td className="p-2 border-r border-gray-200">-</td>
              <td className="p-2 border-r border-gray-200">-</td>

              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.otAmount)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.gross)}
              </td>

              {/* DEDUCTIONS (9 columns) */}
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.pf)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.esic)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.pt)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.tds)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.loan)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.other)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.lopDed)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.lateDed)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.deductions)}
              </td>

              {/* FINAL */}
              <td className="p-2 border-r border-gray-200 text-green-700 font-bold">
                ₹{round(totals.net)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showManualForm && (
        <ManualSalaryCalculateForm
          onClose={() => setShowManualForm(false)}
          onSuccess={fetchSalaries}
        />
      )}


      {showExportForm && (
        <SalaryExportForm onClose={() => setShowExportForm(false)} />
      )}


      {/* Form Dynamic Popup */}
      {showForm && (
        <SalaryCalculateDynamicForm
          onClose={() => setShowForm(false)}
          onSuccess={(data) => {
            setSalaryResult(data);
            fetchSalaries();
          }}
        />
      )}

      {salaryResult && (
        <SalaryCalculationResultModalDynamic
          data={salaryResult}
          onClose={() => setSalaryResult(null)}
        />
      )}

      {showGenerateAllForm && (
        <SalaryCalculateGenerateAllDynamicForm
          onClose={() => setShowGenerateAllForm(false)}
          onSuccess={fetchSalaries}
        />
      )}

      {/* Form Default Popup */}
      {/* {showForm && (
        <SalaryGenerateDefaultForm
          onClose={() => setShowForm(false)}
          onSuccess={(data) => {
            setSalaryResult(data);
            fetchSalaries();
          }}
        />
      )} */}

      {/* {salaryResult && (
        <SalaryCalculationResultModalDefault
          data={salaryResult}
          onClose={() => setSalaryResult(null)}
        />
      )} */}

      {showGenerateAllForm && (
        <SalaryCalculateGenerateAllDefaultForm
          onClose={() => setShowGenerateAllForm(false)}
          onSuccess={fetchSalaries}
        />
      )}

    </div>
  );
};

export default SalaryCalculate;
