import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import ProcessComplainceSalaryForm from "./ProcessComplainceSalaryForm";
import ProcessComplainceBulkForm from "./ProcessComplainceBulkForm";
import { Plus, FileMinus, Info } from "lucide-react";

const inputClass =
  "w-full md:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const buttonClass =
  "flex items-center gap-1 px-4 py-2 rounded text-white font-semibold hover:opacity-90 transition cursor-pointer";

const ProcessComplainceSalary = () => {
  const [mode, setMode] = useState("single"); // single | bulk
  const [salaryRunId, setSalaryRunId] = useState("");
  const [salaryData, setSalaryData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };

  const fetchSalaryData = async () => {
    if (!salaryRunId) {
      toast.error("Enter Salary Run ID to fetch data");
      return;
    }
    setLoadingData(true);
    try {
      const res = await axiosInstance.get(`/ComplianceSalary/run/${salaryRunId}`);
      setSalaryData(res.data.data || []);
      toast.success("Compliance salary data fetched successfully!");
    } catch (error) {
      toast.error("Failed to fetch compliance salary data");
      setSalaryData([]);
    } finally {
      setLoadingData(false);
    }
  };

  const enrichedSalaryData = salaryData.map((item, index) => {
    const emp = employees.find((e) => e.id === item.employeeId);
    return {
      ...item,
      sNo: index + 1,
      employeeName: emp ? `${emp.fullName} (${emp.employeeCode})` : item.employeeName || item.employeeId,
    };
  });

  const format = (num) => (num ? Number(num).toFixed(2) : "0.00");

  const getMonthYear = (month, year) => {
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    return `${months[month - 1]}-${year}`;
  };

  const totals = enrichedSalaryData.reduce(
    (acc, item) => {
      acc.payableDays += item.payableDays || 0;
      acc.otHours += item.otHours || 0;
      acc.excessOTHours += item.excessOTHours || 0;
      acc.otAmount += item.otAmount || 0;
      acc.excessOTAmount += item.excessOTAmount || 0;

      acc.displayBasic += item.displayBasic || 0;
      acc.displayHRA += item.displayHRA || 0;
      acc.displayTotal += item.displayTotal || 0;

      acc.earnBasic += item.earnBasic || 0;
      acc.earnHRA += item.earnHRA || 0;
      acc.earnGross += item.earnGross || 0;
      acc.totalEarnings += item.totalEarnings || 0;

      acc.pfBase += item.pfBase || 0;
      acc.employeePF += item.employeePF || 0;
      acc.employerPF += item.employerPF || 0;

      acc.esiBase += item.esiBase || 0;
      acc.employeeESI += item.employeeESI || 0;
      acc.employerESI += item.employerESI || 0;

      acc.loanDeduction += item.loanDeduction || 0;
      acc.totalDeductions += item.totalDeductions || 0;

      acc.specialAllowance += item.specialAllowance || 0;
      acc.netSalary += item.netSalary || 0;

      return acc;
    },
    {
      payableDays: 0,
      otHours: 0,
      excessOTHours: 0,
      otAmount: 0,
      excessOTAmount: 0,
      displayBasic: 0,
      displayHRA: 0,
      displayTotal: 0,
      earnBasic: 0,
      earnHRA: 0,
      earnGross: 0,
      totalEarnings: 0,
      pfBase: 0,
      employeePF: 0,
      employerPF: 0,
      esiBase: 0,
      employeeESI: 0,
      employerESI: 0,
      loanDeduction: 0,
      totalDeductions: 0,
      specialAllowance: 0,
      netSalary: 0,
    }
  );

  return (
    <div className="space-y-4">

      {/* HEADER + INPUT + BUTTONS */}
      <div className="sticky top-14 bg-white border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-10 gap-3">
        <div>
          <h1 className="text-xl font-semibold">Process Compliance Salary</h1>
          <p className="text-gray-500 text-sm">Enter Salary Run ID to fetch compliance salary records</p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          <div className="flex flex-col items-center w-full md:w-auto gap-1">
            <div>
              <label htmlFor="salaryRunId" className="text-sm font-semibold text-gray-700 mr-2">
                SalaryRunID:
              </label>
              <input
                id="salaryRunId"
                type="number"
                placeholder="Enter salary run ID (e.g., 202603)"
                value={salaryRunId}
                onChange={(e) => setSalaryRunId(e.target.value)}
                className={inputClass}
              />
            </div>
            <p className="text-xs text-gray-400">
              Enter the SalaryRunID in Format <strong>YYYYMM</strong> Like <strong>202603</strong> for March 2026
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
            <button onClick={fetchSalaryData} className={`bg-primary ${buttonClass}`}>
              {loadingData ? "Loading..." : "Fetch Data"}
            </button>

            <button onClick={() => { setMode("single"); setShowForm(true); }} className={`bg-secondary ${buttonClass}`}>
              <Plus size={16} /> Process Single
            </button>

            <button onClick={() => { setMode("bulk"); setShowForm(true); }} className={`bg-green-600 ${buttonClass}`}>
              <Plus size={16} /> Process Bulk
            </button>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {salaryData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
          <FileMinus size={48} className="text-gray-300" />
          <h3 className="text-lg font-semibold">
            {salaryRunId ? "No compliance salary records found" : "No data to display"}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs text-center">
            {salaryRunId
              ? "The entered Salary Run ID does not have any compliance salary records yet."
              : "Please enter a Salary Run ID above and click on 'Fetch Data' to see compliance salary records."}
          </p>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Info size={16} />
            <span>Tip: Salary Run ID is generated after running payroll.</span>
          </div>
        </div>
      )}

      {/* SALARY TABLE */}
      {salaryData.length > 0 && (
        <div className="border mt-5 mx-auto max-w-xl md:max-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto border-gray-200 rounded-lg max-h-[80vh]">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 text-gray-700 text-xs sticky top-0 z-10 border-b-2 border-gray-200">
              <tr className="text-center">
                <th className="p-3 min-w-[120px] border-r border-gray-200">S.No / Code</th>
                <th className="p-3 min-w-[200px] border-r border-gray-200">Employee</th>
                <th className="p-3 min-w-[140px] border-r border-gray-200">Attendance</th>
                <th className="p-3 min-w-[160px] border-r border-gray-200">Salary Structure</th>
                <th className="p-3 min-w-[160px] border-r border-gray-200">Earnings</th>
                <th className="p-3 min-w-[140px] border-r border-gray-200">OT Details</th>
                <th className="p-3 min-w-[140px] border-r border-gray-200">Total Earnings</th>
                <th className="p-3 min-w-[160px] border-r border-gray-200">Deductions</th>
                <th className="p-3 min-w-[140px]">Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {enrichedSalaryData.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 text-xs align-top hover:bg-gray-50"
                >

                  {/* S.NO + CODE */}
                  <td className="p-3 text-center border-r border-gray-200">
                    <div className="font-bold">{index + 1}</div>

                    <div className="text-[11px] text-gray-500">
                      {item.employeeName?.split("(")[1]?.replace(")", "")}
                    </div>

                    <div className="text-primary text-[11px] font-semibold mt-1">
                      {getMonthYear(item.month, item.year)}
                    </div>

                    <div className="text-[10px] text-gray-400">
                      SalaryRunID: {salaryRunId}
                    </div>
                  </td>

                  {/* EMPLOYEE */}
                  <td className="p-3 border-r border-gray-200">
                    <div className="font-semibold">{item.employeeName}</div>

                    <div className="mt-2 text-gray-500 text-xs space-y-1">
                      <div>PF No: {item.pfNumber || "-"}</div>
                      <div>ESI No: {item.esiNumber || "-"}</div>
                    </div>
                  </td>

                  {/* ATTENDANCE */}
                  <td className="p-3 border-r border-gray-200">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Payable Days</span>
                        <b>{item.payableDays}</b>
                      </div>

                      <div className="flex justify-between">
                        <span>Prorata</span>
                        <span>{item.prorataFactor}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Min Wage</span>
                        <span>{item.isMinWageCase ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </td>

                  {/* SALARY STRUCTURE */}
                  <td className="p-3 border-r border-gray-200">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Basic</span>
                        <span>₹ {format(item.displayBasic)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>HRA</span>
                        <span>₹ {format(item.displayHRA)}</span>
                      </div>

                      <div className="flex justify-between font-semibold border-t border-gray-400 pt-1">
                        <span>Total</span>
                        <span>₹ {format(item.displayTotal)}</span>
                      </div>
                    </div>
                  </td>

                  {/* EARNINGS */}
                  <td className="p-3 border-r border-gray-200">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Basic</span>
                        <span>₹ {format(item.earnBasic)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>HRA</span>
                        <span>₹ {format(item.earnHRA)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Gross</span>
                        <span>₹ {format(item.earnGross)}</span>
                      </div>
                    </div>
                  </td>

                  {/* OT DETAILS */}
                  <td className="p-3 border-r border-gray-200">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Hours</span>
                        <span>{item.otHours}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>OT Amt</span>
                        <span>₹ {format(item.otAmount)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Excess OT</span>
                        <span>₹ {format(item.excessOTAmount)}</span>
                      </div>
                    </div>
                  </td>

                  {/* TOTAL EARNINGS */}
                  <td className="p-3 border-r border-gray-200 text-center">
                    <div className="font-semibold text-blue-600">
                      ₹ {format(item.totalEarnings)}
                    </div>

                    <div className="text-[10px] text-gray-400">
                      ESI Base: ₹ {format(item.esiBase)}
                    </div>
                  </td>

                  {/* DEDUCTIONS */}
                  <td className="p-3 border-r border-gray-200">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>PF</span>
                        <span>₹ {format(item.employeePF)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>ESI</span>
                        <span>₹ {format(item.employeeESI)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Loan</span>
                        <span>₹ {format(item.loanDeduction)}</span>
                      </div>

                      <div className="flex justify-between font-semibold border-t pt-1 text-red-600">
                        <span>Total</span>
                        <span>₹ {format(item.totalDeductions)}</span>
                      </div>
                    </div>
                  </td>

                  {/* NET SALARY */}
                  <td className="p-3 text-center">
                    <div className="font-bold text-green-600 text-base">
                      ₹ {format(item.netSalary)}
                    </div>

                    <div className="text-[10px] text-gray-400">
                      {item.isESIApplicable ? "ESI Applicable" : "No ESI"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <tfoot className="bg-gray-100 sticky bottom-0 font-semibold text-xs">
              <tr className="text-center">
                <td className="p-3"></td>
                <td className="p-3 text-left">TOTAL</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>

                <td className="p-3">{format(totals.payableDays)}</td>
                <td className="p-3"></td>

                <td className="p-3">{format(totals.otHours)}</td>
                <td className="p-3">{format(totals.excessOTHours)}</td>
                <td className="p-3">{format(totals.otAmount)}</td>
                <td className="p-3">{format(totals.excessOTAmount)}</td>

                <td className="p-3">{format(totals.displayBasic)}</td>
                <td className="p-3">{format(totals.displayHRA)}</td>
                <td className="p-3">{format(totals.displayTotal)}</td>

                <td className="p-3">{format(totals.earnBasic)}</td>
                <td className="p-3">{format(totals.earnHRA)}</td>
                <td className="p-3">{format(totals.earnGross)}</td>
                <td className="p-3">{format(totals.totalEarnings)}</td>

                <td className="p-3">{format(totals.pfBase)}</td>
                <td className="p-3">{format(totals.employeePF)}</td>
                <td className="p-3">{format(totals.employerPF)}</td>

                <td className="p-3">{format(totals.esiBase)}</td>
                <td className="p-3">{format(totals.employeeESI)}</td>
                <td className="p-3">{format(totals.employerESI)}</td>

                <td className="p-3">{format(totals.loanDeduction)}</td>
                <td className="p-3">{format(totals.totalDeductions)}</td>

                <td className="p-3">{format(totals.specialAllowance)}</td>
                <td className="p-3">{format(totals.netSalary)}</td>

                <td className="p-3"></td>
                <td className="p-3"></td>
              </tr>
            </tfoot> */}
          </table>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div>
          {mode === "single" ? (
            <ProcessComplainceSalaryForm onClose={() => setShowForm(false)} />
          ) : (
            <ProcessComplainceBulkForm onClose={() => setShowForm(false)} />
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessComplainceSalary;