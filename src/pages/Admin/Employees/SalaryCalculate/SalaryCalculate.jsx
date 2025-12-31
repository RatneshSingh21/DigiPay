import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import SalaryCalculateForm from "./SalaryCalculateForm";
import ManualSalaryCalculateForm from "./ManualSalaryCalculateForm";

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
      })
    );

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    return filteredSalaries.reduce(
      (acc, s) => {
        acc.basic += s.basicSalary || 0;
        acc.hra += s.hra || 0;
        acc.conveyance += s.conveyanceAllowance || 0;
        acc.fixed += s.fixedAllowance || 0;
        acc.bonus += s.bonus || 0;
        acc.arrears += s.arrears || 0;
        acc.otAmount += s.overtimeAmount || 0;
        acc.leaveEncash += s.leaveEncashment || 0;
        acc.special += s.specialAllowance || 0;
        acc.pf += s.pfEmployee || 0;
        acc.esic += s.esicEmployee || 0;
        acc.pt += s.professionalTax || 0;
        acc.tds += s.tds || 0;
        acc.loan += s.loanRepayment || 0;
        acc.other += s.otherDeductions || 0;
        acc.gross += s.grossEarnings || 0;
        acc.deductions += s.totalDeductions || 0;
        acc.net += s.netSalary || 0;
        acc.ctc += s.ctc || 0;
        return acc;
      },
      {
        basic: 0,
        hra: 0,
        conveyance: 0,
        fixed: 0,
        bonus: 0,
        arrears: 0,
        otAmount: 0,
        leaveEncash: 0,
        special: 0,
        pf: 0,
        esic: 0,
        pt: 0,
        tds: 0,
        loan: 0,
        other: 0,
        gross: 0,
        deductions: 0,
        net: 0,
        ctc: 0,
      }
    );
  }, [filteredSalaries]);

  /* ================= API ================= */
  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/CalculatedSalary");
      setSalaries(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch salaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Calculated Salaries</h2>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name or Code..."
            className="border border-blue-300 rounded-md px-3 py-1 text-sm w-64"
          />
          <div className="w-40 text-sm">
            <Select
              options={months}
              value={months.find(
                (m) => String(m.value) === String(selectedMonth)
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

      <div className="border mx-auto max-w-xl md:max-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto border-gray-200 rounded-lg max-h-[75vh]">
        <table className="divide-y divide-gray-200 text-xs text-center">
          <thead className="bg-gray-100 text-gray-600 sticky top-0">
            <tr>
              <th className="p-2 border-r border-gray-200">S.No</th>
              <th className="p-2 border-r border-gray-200">EmpName</th>
              <th className="p-2 border-r border-gray-200">Month</th>
              <th className="p-2 border-r border-gray-200">Year</th>
              <th className="p-2 border-r border-gray-200">Basic</th>
              <th className="p-2 border-r border-gray-200">HRA</th>
              <th className="p-2 border-r border-gray-200">Conveyance</th>
              <th className="p-2 border-r border-gray-200">Fixed Allow.</th>
              <th className="p-2 border-r border-gray-200">Bonus</th>
              <th className="p-2 border-r border-gray-200">Arrears</th>
              <th className="p-2 border-r border-gray-200">OT Hrs</th>
              <th className="p-2 border-r border-gray-200">OT Rate</th>
              <th className="p-2 border-r border-gray-200">OT Amount</th>
              <th className="p-2 border-r border-gray-200">Leave Encash</th>
              <th className="p-2 border-r border-gray-200">Special Allow.</th>
              <th className="p-2 border-r border-gray-200">PF</th>
              <th className="p-2 border-r border-gray-200">ESIC</th>
              <th className="p-2 border-r border-gray-200">PT</th>
              <th className="p-2 border-r border-gray-200">TDS</th>
              <th className="p-2 border-r border-gray-200">Loan</th>
              <th className="p-2 border-r border-gray-200">Other Ded.</th>
              <th className="p-2 border-r border-gray-200">Gross</th>
              <th className="p-2 border-r border-gray-200">Deductions</th>
              <th className="p-2 border-r border-gray-200">Net Salary</th>
              <th className="p-2 border-r border-gray-200">CTC</th>
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
                  key={s.calculatedSalaryId}
                  className={`hover:bg-gray-50 transition-all ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-2 py-2 border-r border-gray-200">
                    {i + 1}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.employeeName}({s.employeeCode})
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.month}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.year}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.basicSalary)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.hra)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.conveyanceAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.fixedAllowance)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.bonus)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.arrears)}
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
                    {round(s.leaveEncashment)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.specialAllowance)}
                  </td>
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
                    {round(s.grossEarnings)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.totalDeductions)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.netSalary)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {round(s.ctc)}
                  </td>
                </tr>
              ))
            ) : search !== "" ? (
              <tr>
                <td colSpan={26} className="text-center py-4">
                  No matching employees found
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={26} className="text-center py-4">
                  No salaries found
                </td>
              </tr>
            )}
          </tbody>

          <tfoot className="sticky bottom-0 bg-gray-200 font-semibold text-xs">
            <tr>
              <td className="p-2 border-r border-gray-200"  colSpan={4}>TOTAL</td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.basic)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.hra)}
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
              <td className="p-2 border-r border-gray-200">{"-"}</td>
              <td className="p-2 border-r border-gray-200">{"-"}</td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.otAmount)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.leaveEncash)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.special)}
              </td>
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
                ₹{round(totals.gross)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.deductions)}
              </td>
              <td className="p-2 border-r border-gray-200">
                ₹{round(totals.net)}
              </td>
              <td className="p-2">₹{round(totals.ctc)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Form Popup */}
      {showForm && (
        <SalaryCalculateForm
          onClose={() => setShowForm(false)}
          onSuccess={fetchSalaries}
        />
      )}

      {showManualForm && (
        <ManualSalaryCalculateForm
          onClose={() => setShowManualForm(false)}
          onSuccess={fetchSalaries}
        />
      )}

      {showGenerateAllForm && (
        <SalaryCalculateGenerateAllForm
          onClose={() => setShowGenerateAllForm(false)}
          onSuccess={fetchSalaries}
        />
      )}
    </div>
  );
};

export default SalaryCalculate;
