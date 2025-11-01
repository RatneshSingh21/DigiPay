import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import SalaryCalculateForm from "./SalaryCalculateForm";

const SalaryCalculate = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md text-sm"
          >
            Calculate Salary
          </button>
        </div>
      </div>

      <div className="border mx-auto max-w-xl md:max-w-5xl 2xl:max-w-full overflow-auto border-gray-200 rounded-lg max-h-[60vh]">
        <table className="divide-y divide-gray-200 text-xs text-center">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-2 py-2">S.No</th>
              <th className="px-2 py-2">EmpCode</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Month</th>
              <th className="px-2 py-2">Year</th>
              <th className="px-2 py-2">Basic</th>
              <th className="px-2 py-2">HRA</th>
              <th className="px-2 py-2">Conveyance</th>
              <th className="px-2 py-2">Fixed Allowance</th>
              <th className="px-2 py-2">Bonus</th>
              <th className="px-2 py-2">Arrears</th>
              <th className="px-2 py-2">OT Hrs</th>
              <th className="px-2 py-2">OT Rate</th>
              <th className="px-2 py-2">OT Amount</th>
              <th className="px-2 py-2">Leave Encash</th>
              <th className="px-2 py-2">Special Allow</th>
              <th className="px-2 py-2">PF</th>
              <th className="px-2 py-2">ESIC</th>
              <th className="px-2 py-2">PT</th>
              <th className="px-2 py-2">TDS</th>
              <th className="px-2 py-2">Loan</th>
              <th className="px-2 py-2">Other Ded.</th>
              <th className="px-2 py-2">Gross</th>
              <th className="px-2 py-2">Deductions</th>
              <th className="px-2 py-2">Net Salary</th>
              <th className="px-2 py-2">CTC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={26} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : salaries.length > 0 ? (
              salaries.map((s, i) => (
                <tr key={s.calculatedSalaryId}>
                  <td className="px-2 py-2">{i + 1}</td>
                  <td className="px-2 py-2">{s.employeeCode}</td>
                  <td className="px-2 py-2">{s.employeeName}</td>
                  <td className="px-2 py-2">{s.month}</td>
                  <td className="px-2 py-2">{s.year}</td>
                  <td className="px-2 py-2">{s.basicSalary.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.hra.toFixed(2)}</td>
                  <td className="px-2 py-2">
                    {s.conveyanceAllowance.toFixed(2)}
                  </td>
                  <td className="px-2 py-2">{s.fixedAllowance.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.bonus.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.arrears.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.overtimeHours}</td>
                  <td className="px-2 py-2">{s.overtimeRate.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.overtimeAmount.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.leaveEncashment.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.specialAllowance.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.pfEmployee.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.esicEmployee.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.professionalTax.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.tds.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.loanRepayment.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.otherDeductions.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.grossEarnings.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.totalDeductions.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.netSalary.toFixed(2)}</td>
                  <td className="px-2 py-2">{s.ctc.toFixed(2)}</td>
                </tr>
              ))
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
    </div>
  );
};

export default SalaryCalculate;
