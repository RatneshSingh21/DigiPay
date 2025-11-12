import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";

const EmpBasicSalary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/EmployeeSalary/all");
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

  return (
    <div className="bg-white shadow rounded-xl">
       {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-wrap justify-between items-center gap-4">
        <h2 className="font-semibold text-xl">Employee Salary Details</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : salaries.length > 0 ? (
        <div className="mt-4 mx-4 p-4 border max-w-xl md:max-w-5xl 2xl:max-w-full overflow-x-scroll border-gray-200 rounded-lg max-h-[70vh]">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-100 text-gray-600 text-center">
              <tr>
                <th className="px-2 py-2">S.No</th>
                <th className="px-2 py-2">Emp Code</th>
                <th className="px-2 py-2 text-left">Employee Name</th>
                <th className="px-2 py-2">Basic Salary</th>
                <th className="px-2 py-2">HRA</th>
                <th className="px-2 py-2">Conveyance</th>
                <th className="px-2 py-2">Fixed Allow.</th>
                <th className="px-2 py-2">Bonus</th>
                <th className="px-2 py-2">Special Allow.</th>
                <th className="px-2 py-2">PF</th>
                <th className="px-2 py-2">Prof. Tax</th>
                <th className="px-2 py-2">TDS</th>
                <th className="px-2 py-2 text-green-700">Gross</th>
                <th className="px-2 py-2 text-red-700">Deductions</th>
                <th className="px-2 py-2 text-blue-700">Net Salary</th>
                <th className="px-2 py-2">CTC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-center">
              {salaries.map((emp, index) => (
                <tr
                  key={emp.employeeSalaryEntityID}
                  className={`hover:bg-gray-50 transition-all ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{emp.employeeCode}</td>
                  <td className="px-2 py-2 text-left">{emp.employeeName}</td>
                  <td className="px-2 py-2">
                    ₹{emp.basicSalary.toLocaleString()}
                  </td>
                  <td className="px-2 py-2">₹{emp.hra.toLocaleString()}</td>
                  <td className="px-2 py-2">
                    ₹{emp.conveyanceAllowance.toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    ₹{emp.fixedAllowance.toLocaleString()}
                  </td>
                  <td className="px-2 py-2">₹{emp.bonus.toLocaleString()}</td>
                  <td className="px-2 py-2">
                    ₹{emp.specialAllowance.toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    ₹{emp.pfEmployee.toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    ₹{emp.professionalTax.toLocaleString()}
                  </td>
                  <td className="px-2 py-2">₹{emp.tds.toLocaleString()}</td>
                  <td className="px-2 py-2 font-medium text-green-600">
                    ₹{emp.grossEarnings.toLocaleString()}
                  </td>
                  <td className="px-2 py-2 font-medium text-red-600">
                    ₹{emp.totalDeductions.toLocaleString()}
                  </td>
                  <td className="px-2 py-2 font-semibold text-blue-600">
                    ₹{emp.netSalary.toLocaleString()}
                  </td>
                  <td className="px-2 py-2">₹{emp.ctc.toLocaleString()}</td>
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
