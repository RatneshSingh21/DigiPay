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
import SalaryCalculateGenerateAllDefaultForm from "./DefaultSalary/SalaryCalculateGenerateAllDefaultForm";
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

  const fetchSalaries = async () => {
    try {
      if (!selectedMonth) return;
      setLoading(true);
      const res = await axiosInstance.get(`/CalculatedSalary/monthly-summary`, {
        params: { month: selectedMonth, year: selectedYear },
      });
      setSalaries(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payroll summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [selectedMonth, selectedYear]);

  // Helper to format date
  const formatDate = (month, year) => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
                valueContainer: (base) => ({ ...base, padding: "0 8px" }),
                indicatorsContainer: (base) => ({ ...base, height: "30px" }),
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

      {/* Payslip Style Table */}
      <div className="border mx-2 overflow-auto border-gray-200 max-h-[75vh]">
        <table className="w-full border-collapse text-xs">
          {/* Table Header */}
          <thead className="sticky top-0 bg-gray-100 ">
            <tr className="border-b border-gray-200">
              <th className="border border-gray-200 p-2 text-center w-24">
                Paycode
                <br />
                <span className="font-normal text-gray-600">DOJ</span>
                <br />
                <span className="font-normal text-gray-600">Sno.</span>
              </th>
              <th className="border border-gray-200 p-2 text-left w-48">
                Employee Name
                <br />
                <span className="font-normal text-gray-600">
                  Employee F/H Name
                </span>
                <br />
                <span className="font-normal text-gray-600">Designation</span>
                <br />
                <span className="font-normal text-gray-600">Department</span>
              </th>
              <th className="border border-gray-200 p-2 text-center w-36">
                Attendance
                <br />
                Detail
              </th>
              <th className="border border-gray-200 p-2 text-center w-36">
                Salary/Wage
                <br />
                Rate(Actual)
              </th>
              <th className="border border-gray-200 p-2 text-center w-36">
                Earnings
                <br/>
                (Calculated)
              </th>
              <th className="border border-gray-200 p-2 text-center w-24">
                Arrears
              </th>
              <th className="border border-gray-200 p-2 text-center w-24">
                O.T.
                <br />
                Details
              </th>
              <th className="border border-gray-200 p-2 text-center w-24">
                Total
                <br />
                Earnings
              </th>
              <th className="border border-gray-200 p-2 text-center w-32">
                Deductions
              </th>
              <th className="border border-gray-200 p-2 text-center w-24">
                Net
                <br />
                Payable
              </th>
              
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : filteredSalaries.length > 0 ? (
              filteredSalaries.map((s, i) => (
                <tr
                  key={`${s.employeeId}-${s.month}-${s.year}`}
                  className="border-b border-gray-200 hover:bg-yellow-50"
                  onClick={() =>
                    setSelectedRowId(`${s.employeeId}-${s.month}-${s.year}`)
                  }
                >
                  {/* Paycode Column */}
                  <td className="border border-gray-200 p-2 text-center align-top">
                    <div className="font-semibold">{s.employeeCode}</div>
                    <div className="mt-4 text-gray-600">
                      {formatDate(s.month, s.year)}
                    </div>
                    <div className="mt-4">{i + 1}</div>
                  </td>

                  {/* Employee Info Column */}
                  <td className="border border-gray-200 p-2 align-top">
                    <div className="font-semibold">{s.employeeName}</div>
                    <div className="text-gray-600">{s.fatherName || "-"}</div>
                    <div className="text-gray-600">
                      {s.designationName || "-"}
                    </div>
                    <div className="text-gray-600">{s.departmentName}</div>
                    <div className="text-gray-500 text-[10px] mt-1">
                      PF No. {s.pfNumber || "-"}
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      ESIC No. {s.esicNumber || "-"}
                    </div>
                  </td>

                  {/* Attendance Column */}
                  <td className="border border-gray-200 p-1 align-top">
                    <div className="grid grid-cols-3 gap-x-1 text-[10px]">
                      <span>EL</span>
                      <span>WD</span>
                      <span className="text-right">
                        {s.totalWorkingDays || 0}
                      </span>

                      <span>CL</span>
                      <span>WO</span>
                      <span className="text-right">{s.weekends || 0}</span>

                      <span>SL</span>
                      <span>HD</span>
                      <span className="text-right">{s.halfDays || 0}</span>

                      <span>CO</span>
                      <span>LO</span>
                      <span className="text-right">{s.lopDays || 0}</span>

                      <span>OL</span>
                      <span>AB</span>
                      <span className="text-right">{s.absentDays || 0}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-2 pt-1 flex justify-between text-[10px]">
                      <span>P.days</span>
                      <span className="font-semibold">
                        {s.payableDays || 0}
                      </span>
                    </div>
                  </td>

                  {/* Salary/Wage Rate Column */}
                  <td className="border border-gray-200 p-2 align-top">
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span>BASIC</span>
                        <span>{round(s.actualBasicSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HRA</span>
                        <span>{round(s.actualHRA)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CONV.</span>
                        <span>{round(s.actualConveyanceAllowance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Special Allowance</span>
                        <span>
                          {round(s.actualSpecialAllowance)}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-2 pt-1 flex justify-between font-semibold text-[10px]">
                      <span>Total</span>
                      <span>{"\u20B9"}{round(s.actualCTC)}</span>
                    </div>
                  </td>

                  {/* Earnings Column */}
                  <td className="border border-gray-200 p-2 align-top">
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span>BASIC</span>
                        <span>{round(s.calculatedBasicSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HRA</span>
                        <span>{round(s.calculatedHRA)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CONV.</span>
                        <span>{round(s.calculatedConveyanceAllowance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Special Allowance</span>
                        <span>
                          {round(s.calculatedSpecialAllowance)}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-2 pt-1 flex justify-between font-semibold text-[10px]">
                      <span>Total</span>
                      <span>{"\u20B9"}{round(s.grossEarnings)}</span>
                    </div>
                   
                  </td>

                  {/* Arrears Column */}
                  <td className="border border-gray-200 p-1 text-center align-top">
                    <div>{round(s.calculatedArrears)}</div>
                  </td>

                  {/* O.T. Details Column */}
                  <td className="border border-gray-200 p-1 align-top text-[10px]">
                    <div className="flex justify-between">
                      <span>O.T. Hrs</span>
                      <span>{s.overtimeHours || 0}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>O.T. Amt.</span>
                      <span>{round(s.overtimeAmount)}</span>
                    </div>
                  </td>

                  {/* Total Earnings Column */}
                  <td className="border border-gray-200 p-2 text-center align-top">
                    <div className="font-semibold">
                     {"\u20B9"} {round(s.grossEarnings)}
                    </div>
                  </td>

                  {/* Deductions Column */}
                  <td className="border border-gray-200 p-1 align-top">
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span>PF</span>
                        <span>{round(s.pfEmployee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ESI</span>
                        <span>{round(s.esicEmployee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LOAN</span>
                        <span>{round(s.loanRepayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TDS</span>
                        <span>{round(s.tds)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OTHERS</span>
                        <span>{round(s.otherDeductions)}</span>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-1 pt-1 flex justify-between font-semibold text-[10px]">
                      <span>Total</span>
                      <span>{round(s.totalDeductions)}</span>
                    </div>
                  </td>

                  {/* Net Payable Column */}
                  <td className="border border-gray-200 p-2 text-center align-top">
                    <div className="font-bold text-green-700">
                     {"\u20B9"} {round(s.netSalary)}
                    </div>
                  </td>

                  {/* Signature Column */}
                  {/* <td className="border border-gray-200 p-2 align-top"> */}
                    {/* Empty for signature */}
                  {/* </td>
                   */}
                </tr>
              ))
            ) : !selectedMonth ? (
              <tr>
                <td colSpan={11}>
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
                <td colSpan={11}>
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
                <td colSpan={11}>
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
        </table>
      </div>

      {/* Modals */}
      {showManualForm && (
        <ManualSalaryCalculateForm
          onClose={() => setShowManualForm(false)}
          onSuccess={fetchSalaries}
        />
      )}

      {showExportForm && (
        <SalaryExportForm onClose={() => setShowExportForm(false)} />
      )}

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
