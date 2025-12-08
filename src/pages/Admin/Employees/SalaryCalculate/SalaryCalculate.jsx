import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import SalaryCalculateForm from "./SalaryCalculateForm";
import ManualSalaryCalculateForm from "./ManualSalaryCalculateForm";


const SalaryCalculate = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showGenerateAllForm, setShowGenerateAllForm] = useState(false);
  const [search, setSearch] = useState("");

  const filteredSalaries = salaries.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.employeeName?.toLowerCase().includes(term) ||
      s.employeeCode?.toLowerCase().includes(term)
    );
  });

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

      <div className="border mx-auto max-w-xl md:max-w-5xl 2xl:max-w-full overflow-auto border-gray-200 rounded-lg max-h-[75vh]">
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
                    {s.basicSalary.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.hra.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.conveyanceAllowance.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.fixedAllowance.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.bonus.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.arrears.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.overtimeHours}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.overtimeRate.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.overtimeAmount.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.leaveEncashment.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.specialAllowance.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.pfEmployee.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.esicEmployee.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.professionalTax.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.tds.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.loanRepayment.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.otherDeductions.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.grossEarnings.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.totalDeductions.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.netSalary.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    {s.ctc.toFixed(2)}
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
