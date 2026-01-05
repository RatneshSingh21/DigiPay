import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";

const EmpBasicSalary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/EmployeeSalary/all");

      if (res.data.success) {
        const sortedData = [...res.data.data].sort((a, b) =>
          a.employeeCode.localeCompare(b.employeeCode, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
        setSalaries(sortedData);
      } else {
        toast.error("Failed to fetch employee salaries");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const filteredSalaries = useMemo(() => {
    if (!searchTerm) return salaries;
    const lower = searchTerm.toLowerCase();
    return salaries.filter(
      (emp) =>
        emp.employeeName?.toLowerCase().includes(lower) ||
        emp.employeeCode?.toLowerCase().includes(lower)
    );
  }, [salaries, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredSalaries.reduce(
      (acc, emp) => {
        acc.basicSalary += emp.basicSalary || 0;
        acc.hra += emp.hra || 0;
        acc.conveyanceAllowance += emp.conveyanceAllowance || 0;
        acc.fixedAllowance += emp.fixedAllowance || 0;
        acc.bonus += emp.bonus || 0;
        acc.specialAllowance += emp.specialAllowance || 0;
        acc.leaveEncashment += emp.leaveEncashment || 0;
        acc.pfEmployee += emp.pfEmployee || 0;
        acc.esicEmployee += emp.esicEmployee || 0;
        acc.loanRepayment += emp.loanRepayment || 0;
        acc.arrears += emp.arrears || 0;
        acc.professionalTax += emp.professionalTax || 0;
        acc.tds += emp.tds || 0;
        acc.otherDeductions += emp.otherDeductions || 0;
        acc.grossEarnings += emp.grossEarnings || 0;
        acc.totalDeductions += emp.totalDeductions || 0;
        acc.netSalary += emp.netSalary || 0;
        acc.ctc += emp.ctc || 0;
        return acc;
      },
      {
        basicSalary: 0,
        hra: 0,
        conveyanceAllowance: 0,
        fixedAllowance: 0,
        bonus: 0,
        specialAllowance: 0,
        leaveEncashment: 0,
        pfEmployee: 0,
        esicEmployee: 0,
        loanRepayment: 0,
        arrears: 0,
        professionalTax: 0,
        tds: 0,
        otherDeductions: 0,
        grossEarnings: 0,
        totalDeductions: 0,
        netSalary: 0,
        ctc: 0,
      }
    );
  }, [filteredSalaries]);

  return (
    <div className="bg-white shadow rounded-xl">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-wrap justify-between items-center gap-4">
        <h2 className="font-semibold text-xl">Employee Salary Details</h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Name or Code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm min-w-[220px]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-3 py-2 border cursor-pointer border-gray-300 bg-gray-50 rounded hover:bg-gray-100 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filteredSalaries.length > 0 ? (
        <div className="mt-4 mx-auto p-4 border max-w-xl md:max-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-x-scroll border-gray-200 rounded-lg max-h-[80vh]">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-100 text-gray-600 text-center">
              <tr>
                <th className="p-2 border-r border-gray-200">S.No</th>
                <th className="p-2 border-r border-gray-200">Emp Code</th>
                <th className="p-2 border-r border-gray-200 text-left">
                  Employee Name
                </th>
                <th className="p-2 border-r border-gray-200">Basic Salary</th>
                <th className="p-2 border-r border-gray-200">HRA</th>
                <th className="p-2 border-r border-gray-200">Conveyance</th>
                <th className="p-2 border-r border-gray-200">Fixed Allow.</th>
                <th className="p-2 border-r border-gray-200">Bonus</th>
                <th className="p-2 border-r border-gray-200">Special Allow.</th>
                <th className="p-2 border-r border-gray-200">Leave Encash</th>
                <th className="p-2 border-r border-gray-200">PF</th>
                <th className="p-2 border-r border-gray-200">ESI</th>
                <th className="p-2 border-r border-gray-200">Loan</th>
                <th className="p-2 border-r border-gray-200">Arrears</th>
                <th className="p-2 border-r border-gray-200">Prof. Tax</th>
                <th className="p-2 border-r border-gray-200">TDS</th>
                <th className="p-2 border-r border-gray-200">Other Deduction</th>
                <th className="p-2 border-r border-gray-200 text-green-700">Gross</th>
                <th className="p-2 border-r border-gray-200 text-red-700">Deductions</th>
                <th className="p-2 border-r border-gray-200 text-blue-700">Net Salary</th>
                <th className="p-2 border-r border-gray-200">CTC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-center relative">
              {filteredSalaries.map((emp, index) => (
                <tr
                  key={emp.employeeSalaryEntityID}
                  className={`hover:bg-gray-50 transition-all ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                >
                  <td className="p-2 border-r border-gray-200">{index + 1}</td>
                  <td className="p-2 border-r border-gray-200">{emp.employeeCode}</td>
                  <td className="p-2 border-r border-gray-200 text-left">{emp.employeeName}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.basicSalary.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.hra.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.conveyanceAllowance.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.fixedAllowance.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.bonus.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.specialAllowance.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.leaveEncashment}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.pfEmployee.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">{emp.esicEmployee}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.loanRepayment}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.arrears}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.professionalTax.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.tds.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.otherDeductions}</td>
                  <td className="p-2 border-r border-gray-200 font-medium text-green-600">₹{emp.grossEarnings.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200 font-medium text-red-600">₹{emp.totalDeductions.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200 font-semibold text-blue-600">₹{emp.netSalary.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-200">₹{emp.ctc.toLocaleString()}</td>
                </tr>
              ))}

              {/* Sticky Total Row */}
              <tr className="bg-gray-200 font-semibold text-center sticky -bottom-4 z-10">
                <td colSpan={3} className="p-2 border-r border-gray-200">Total</td>
                <td className="p-2 border-r border-gray-200">₹{totals.basicSalary.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.hra.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.conveyanceAllowance.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.fixedAllowance.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.bonus.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.specialAllowance.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.leaveEncashment}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.pfEmployee.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">{totals.esicEmployee}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.loanRepayment}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.arrears}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.professionalTax.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.tds.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.otherDeductions}</td>
                <td className="p-2 border-r border-gray-200 text-green-600">₹{totals.grossEarnings.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200 text-red-600">₹{totals.totalDeductions.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200 text-blue-600">₹{totals.netSalary.toLocaleString()}</td>
                <td className="p-2 border-r border-gray-200">₹{totals.ctc.toLocaleString()}</td>
              </tr>
            </tbody>

          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <img
            src={assets.SalaryIllustration}
            alt="No Salary Data"
            className="w-64 h-auto mb-6"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
            No Salary Data Found
          </h1>
          <p className="text-center text-gray-600 pb-6">
            Salary records for the selected period are not available.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmpBasicSalary;
