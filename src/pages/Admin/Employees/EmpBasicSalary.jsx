import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";

const EmpBasicSalary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 new

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/EmployeeSalary/all");
      console.log(res.data);

      if (res.data.success) {
        setSalaries(res.data.data);
      } else {
        toast.error("Failed to fetch employee salaries");
      }
    } catch (err) {
      console.error(err);
      // toast.error("Error fetching salary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  // 🔍 Filter logic (by employee name or code)
  const filteredSalaries = useMemo(() => {
    if (!searchTerm) return salaries;
    const lower = searchTerm.toLowerCase();
    return salaries.filter(
      (emp) =>
        emp.employeeName?.toLowerCase().includes(lower) ||
        emp.employeeCode?.toLowerCase().includes(lower)
    );
  }, [salaries, searchTerm]);

  return (
    <div className="bg-white shadow rounded-xl">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-wrap justify-between items-center gap-4">
        <h2 className="font-semibold text-xl">Employee Salary Details</h2>

        {/* 🔍 Search Box */}
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
        <div className="mt-4 mx-4 p-4 border max-w-xl md:max-w-5xl 2xl:max-w-full overflow-x-scroll border-gray-200 rounded-lg max-h-[70vh]">
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
                <th className="p-2 border-r border-gray-200">
                  Other Deduction
                </th>
                <th className="p-2 border-r border-gray-200 text-green-700">
                  Gross
                </th>
                <th className="p-2 border-r border-gray-200 text-red-700">
                  Deductions
                </th>
                <th className="p-2 border-r border-gray-200 text-blue-700">
                  Net Salary
                </th>
                <th className="p-2 border-r border-gray-200">CTC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-center">
              {filteredSalaries.map((emp, index) => (
                <tr
                  key={emp.employeeSalaryEntityID}
                  className={`hover:bg-gray-50 transition-all ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-2 border-r border-gray-200">{index + 1}</td>
                  <td className="p-2 border-r border-gray-200">
                    {emp.employeeCode}
                  </td>
                  <td className="p-2 border-r border-gray-200 text-left">
                    {emp.employeeName}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.basicSalary.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.hra.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.conveyanceAllowance.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.fixedAllowance.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.bonus.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.specialAllowance.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.leaveEncashment}
                  </td>

                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.pfEmployee.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {emp.esicEmployee}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.loanRepayment}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.arrears}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.professionalTax.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.tds.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.otherDeductions}
                  </td>
                  <td className="p-2 border-r border-gray-200 font-medium text-green-600">
                    ₹{emp.grossEarnings.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200 font-medium text-red-600">
                    ₹{emp.totalDeductions.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200 font-semibold text-blue-600">
                    ₹{emp.netSalary.toLocaleString()}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    ₹{emp.ctc.toLocaleString()}
                  </td>
                </tr>
              ))}
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
