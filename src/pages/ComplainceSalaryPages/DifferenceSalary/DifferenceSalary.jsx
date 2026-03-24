import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import DifferenceSalaryForm from "./DifferenceSalaryForm";
import { Plus, FileMinus, Info } from "lucide-react";

const inputClass =
  "w-full md:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const buttonClass =
  "flex items-center gap-1 px-4 py-2 rounded text-white font-semibold hover:opacity-90 transition cursor-pointer";

const DifferenceSalary = () => {
  const [salaryRunId, setSalaryRunId] = useState("");
  const [salaryData, setSalaryData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({}); // id -> name map

  // Fetch employee list once
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/Employee");
        setEmployees(res.data || []);
        // create lookup map
        const map = {};
        res.data.forEach(emp => {
          map[emp.id] = emp.fullName;
        });
        setEmployeeMap(map);
      } catch (error) {
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, []);

  const fetchSalaryData = async () => {
    if (!salaryRunId) {
      toast.error("Enter Salary Run ID to fetch data");
      return;
    }
    setLoadingData(true);
    try {
      const res = await axiosInstance.get(`/cps/payment-diff/run/${salaryRunId}`);
      setSalaryData(res.data.data || []);
      toast.success("Difference salary data fetched successfully!");
    } catch (error) {
      toast.error("Failed to fetch difference salary data");
      setSalaryData([]);
    } finally {
      setLoadingData(false);
    }
  };

  const format = (num) => (num ? Number(num).toFixed(2) : "0.00");

  const totals = salaryData.reduce(
    (acc, item) => {
      acc.salaryRate += item.p_SalRate || 0;
      acc.payableDays += item.p_PD || 0;
      acc.grossSalary += item.p_GrossSal || 0;
      acc.otHours += item.p_OTHours || 0;
      acc.otAmount += item.p_OTAmount || 0;
      acc.totalAmount += item.p_TotalAmount || 0;

      acc.advance += item.p_Advance || 0;
      acc.loan += item.p_Loan || 0;
      acc.epf += item.p_EPF || 0;
      acc.esi += item.p_ESI || 0;
      acc.tds += item.p_TDS || 0;
      acc.totalDeduction += item.p_TotalDed || 0;

      acc.netPayable += item.p_NetPayable || 0;
      acc.transferSalary += item.p_TrfSalary || 0;
      acc.balanceSalary += item.p_BalSalary || 0;
      acc.contractRate += item.p_ContractRate || 0;

      return acc;
    },
    {
      salaryRate: 0,
      payableDays: 0,
      grossSalary: 0,
      otHours: 0,
      otAmount: 0,
      totalAmount: 0,
      advance: 0,
      loan: 0,
      epf: 0,
      esi: 0,
      tds: 0,
      totalDeduction: 0,
      netPayable: 0,
      transferSalary: 0,
      balanceSalary: 0,
      contractRate: 0,
    }
  );

  return (
    <div className="space-y-4">

      {/* HEADER + INPUT + BUTTONS */}
      <div className="sticky top-14 bg-white border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-10 gap-3">
        <div>
          <h1 className="text-xl font-semibold">Difference Salary</h1>
          <p className="text-gray-500 text-sm">Enter Salary Run ID to fetch difference salary records</p>
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

            <button onClick={() => setShowForm(true)} className={`bg-secondary ${buttonClass}`}>
              <Plus size={16} /> Process Salary
            </button>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {salaryData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
          <FileMinus size={48} className="text-gray-300" />
          <h3 className="text-lg font-semibold">
            {salaryRunId ? "No difference salary records found" : "No data to display"}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs text-center">
            {salaryRunId
              ? "The entered Salary Run ID does not have any difference salary records yet."
              : "Please enter a Salary Run ID above and click on 'Fetch Data' to see difference salary records."}
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
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className="text-gray-600 uppercase text-xs">
                <th className="p-3">S.No</th>
                <th className="p-3">Employee</th> {/* Show name */}
                <th className="p-3">Month</th>
                <th className="p-3">Year</th>
                <th className="p-3 text-right">Salary Rate</th>
                <th className="p-3 text-right">Payable Days</th>
                <th className="p-3 text-right">Gross Salary</th>
                <th className="p-3 text-right">OT Hours</th>
                <th className="p-3 text-right">OT Amount</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Advance</th>
                <th className="p-3 text-right">Loan</th>
                <th className="p-3 text-right">EPF</th>
                <th className="p-3 text-right">ESI</th>
                <th className="p-3 text-right">TDS</th>
                <th className="p-3 text-right">Total Deduction</th>
                <th className="p-3 text-right">Net Payable</th>
                <th className="p-3 text-right">Transfer Salary</th>
                <th className="p-3 text-right">Balance Salary</th>
                <th className="p-3 text-right">Contract Rate</th>
                <th className="p-3 text-center">Advance Deducted</th>
                <th className="p-3 text-center">Negative Balance</th>
                <th className="p-3 text-center">Advance Exceeds Total</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 text-center">
                  <td className="p-3">{index + 1}.</td>
                  <td className="p-3">{employeeMap[item.employeeId] || item.employeeId}</td> {/* mapped name */}
                  <td className="p-3">{item.month}</td>
                  <td className="p-3">{item.year}</td>
                  <td className="p-3 text-right">{item.p_SalRate}</td>
                  <td className="p-3 text-right">{item.p_PD}</td>
                  <td className="p-3 text-right">{item.p_GrossSal}</td>
                  <td className="p-3 text-right">{item.p_OTHours}</td>
                  <td className="p-3 text-right">{item.p_OTAmount}</td>
                  <td className="p-3 text-right">{item.p_TotalAmount}</td>
                  <td className="p-3 text-right">{item.p_Advance}</td>
                  <td className="p-3 text-right">{item.p_Loan}</td>
                  <td className="p-3 text-right">{item.p_EPF}</td>
                  <td className="p-3 text-right">{item.p_ESI}</td>
                  <td className="p-3 text-right">{item.p_TDS}</td>
                  <td className="p-3 text-right">{item.p_TotalDed}</td>
                  <td className="p-3 text-right">{item.p_NetPayable}</td>
                  <td className="p-3 text-right">{item.p_TrfSalary}</td>
                  <td className="p-3 text-right">{item.p_BalSalary}</td>
                  <td className="p-3 text-right">{item.p_ContractRate}</td>
                  <td className="p-3 text-center">{item.advanceDeducted ? "Yes" : "No"}</td>
                  <td className="p-3 text-center">{item.negativeBalSal ? "Yes" : "No"}</td>
                  <td className="p-3 text-center">{item.advanceExceedsTotal ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 sticky bottom-0 font-semibold text-xs">
              <tr className="text-center">
                <td className="p-3"></td>
                <td className="p-3 text-left">TOTAL</td>
                <td className="p-3"></td>
                <td className="p-3"></td>

                <td className="p-3 text-right">{format(totals.salaryRate)}</td>
                <td className="p-3 text-right">{format(totals.payableDays)}</td>
                <td className="p-3 text-right">{format(totals.grossSalary)}</td>
                <td className="p-3 text-right">{format(totals.otHours)}</td>
                <td className="p-3 text-right">{format(totals.otAmount)}</td>
                <td className="p-3 text-right">{format(totals.totalAmount)}</td>

                <td className="p-3 text-right">{format(totals.advance)}</td>
                <td className="p-3 text-right">{format(totals.loan)}</td>
                <td className="p-3 text-right">{format(totals.epf)}</td>
                <td className="p-3 text-right">{format(totals.esi)}</td>
                <td className="p-3 text-right">{format(totals.tds)}</td>
                <td className="p-3 text-right">{format(totals.totalDeduction)}</td>

                <td className="p-3 text-right">{format(totals.netPayable)}</td>
                <td className="p-3 text-right">{format(totals.transferSalary)}</td>
                <td className="p-3 text-right">{format(totals.balanceSalary)}</td>
                <td className="p-3 text-right">{format(totals.contractRate)}</td>

                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && <DifferenceSalaryForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default DifferenceSalary;