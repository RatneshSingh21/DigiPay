import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";
import Pagination from "../../../components/Pagination";

const StatusPill = ({ enabled }) => (
  <span
    className={`text-xs font-semibold px-2 py-1 rounded-full ${
      enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {enabled ? "Paid" : "Pending"}
  </span>
);

const months = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

const viewOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const EmpSalaryDetails = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Filters
  const [viewType, setViewType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeMap, setEmployeeMap] = useState({});

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(10);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      let response;
      if (viewType === "monthly") {
        response = await axiosInstance.get(`/Salary/month/${selectedMonth}`);
      } else {
        response = await axiosInstance.get(`/Salary/year/${selectedYear}`);
      }
      setSalaries(response.data?.data || []);
      console.log(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching salary data:", error);
      toast.error(
        error?.response?.data?.message || "Error fetching salary data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [viewType, selectedMonth, selectedYear]);

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("/Employee");
      if (response.status === 200) {
        const map = {};
        response.data.forEach((emp) => {
          map[emp.id] = {
            name: emp.fullName,
            code: emp.employeeCode,
          };
        });
        setEmployeeMap(map);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredSalaries = useMemo(() => {
    if (!searchTerm) return salaries;

    return salaries.filter((s) => {
      const emp = employeeMap[s.employeeId];
      const empName = emp?.name?.toLowerCase() || "";
      return empName.includes(searchTerm.toLowerCase());
    });
  }, [salaries, searchTerm, employeeMap]);

  // 🔹 Pagination calc
  const totalDataLength = filteredSalaries.length;
  const totalPages = Math.ceil(totalDataLength / perPageData);
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentSalaries = filteredSalaries.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white shadow rounded-xl">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-wrap justify-between items-center gap-4">
        <h2 className="font-semibold text-xl">Employee Salary Details</h2>

        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search by Employee Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm min-w-[200px]"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-3 py-2 border cursor-pointer border-gray-300 bg-gray-50 rounded hover:bg-gray-100 text-sm"
            >
              Clear
            </button>
          )}

          {/* 🔹 ViewType Selector */}
          <div className="min-w-[100px]">
            <Select
              options={viewOptions}
              value={viewOptions.find((v) => v.value === viewType)}
              onChange={(selected) => {
                setViewType(selected.value);
                setCurrentPage(1);
              }}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          {/* 🔹 Month Selector if Monthly */}
          {viewType === "monthly" && (
            <div className="min-w-[100px]">
              <Select
                options={months}
                value={months.find((m) => m.value === selectedMonth)}
                onChange={(selected) => {
                  setSelectedMonth(selected.value);
                  setCurrentPage(1);
                }}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
          )}

          {/* 🔹 Year Input if Yearly */}
          {viewType === "yearly" && (
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm w-[100px]"
            />
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filteredSalaries.length > 0 ? (
        <>
          <div className="mt-4 mx-4 border max-w-xl md:max-w-5xl 2xl:max-w-full overflow-x-scroll border-gray-200 rounded-lg max-h-[70vh]">
            <table className="text-xs">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr className="text-center">
                  <th className="p-2 border-r border-gray-200">S.No</th>
                  <th className="p-2 border-r border-gray-200">Emp Code</th>
                  <th className="p-2 border-r border-gray-200">Emp Name</th>
                  <th className="p-2 border-r border-gray-200">Month</th>
                  <th className="p-2 border-r border-gray-200">Year</th>
                  <th className="p-2 border-r border-gray-200">Basic</th>
                  <th className="p-2 border-r border-gray-200">HRA</th>
                  <th className="p-2 border-r border-gray-200">Conveyance</th>
                  <th className="p-2 border-r border-gray-200">
                    Special Allow.
                  </th>

                  <th className="p-2 border-r border-gray-200">Fixed Allow.</th>
                  <th className="p-2 border-r border-gray-200">Bonus</th>
                  <th className="p-2 border-r border-gray-200">OT Hours</th>
                  <th className="p-2 border-r border-gray-200">OT Rate</th>
                  <th className="p-2 border-r border-gray-200">OT Amount</th>
                  <th className="p-2 border-r border-gray-200">PF</th>
                  <th className="p-2 border-r border-gray-200">ESI</th>
                  <th className="p-2 border-r border-gray-200">Prof. Tax</th>
                  <th className="p-2 border-r border-gray-200">TDS</th>
                  <th className="p-2 border-r border-gray-200">Arrears</th>
                  <th className="p-2 border-r border-gray-200">Leave Encash</th>
                  <th className="p-2 border-r border-gray-200">Loan</th>
                  <th className="p-2 border-r border-gray-200">
                    Other Deductions
                  </th>
                  <th className="p-2 border-r border-gray-200">
                    Gross Earnings
                  </th>
                  <th className="p-2 border-r border-gray-200">
                    Total Deductions
                  </th>
                  <th className="p-2 border-r border-gray-200">Net Salary</th>
                  <th className="p-2 border-r border-gray-200">CTC</th>
                  <th className="p-2 border-r border-gray-200">Working Days</th>
                  <th className="p-2 border-r border-gray-200">Absent</th>
                  <th className="p-2 border-r border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {currentSalaries.map((s, idx) => {
                  const emp = employeeMap[s.employeeId] || {};
                  return (
                    <tr
                      key={s.salaryId}
                      className={`border-b text-center ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-all`}
                    >
                      <td className="p-2 border-r border-gray-200">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {emp.code || "-"}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {emp.name || "-"}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.month}
                      </td>
                      <td className="p-2 border-r border-gray-200">{s.year}</td>
                      <td className="p-2 border-r border-gray-200">
                        {s.basicSalary}
                      </td>
                      <td className="p-2 border-r border-gray-200">{s.hra}</td>
                      <td className="p-2 border-r border-gray-200">
                        {s.conveyanceAllowance}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.specialAllowance}
                      </td>
                      
                      <td className="p-2 border-r border-gray-200">
                        {s.fixedAllowance}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.bonus}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.overtimeHours}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.overtimeRate}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {(s.overtimeHours * s.overtimeRate).toFixed(2)}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.pfEmployee}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.esicEmployee}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.professionalTax}
                      </td>
                      <td className="p-2 border-r border-gray-200">{s.tds}</td>
                      <td className="p-2 border-r border-gray-200">
                        {s.arrears}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.leaveEncashment}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.loanRepayment}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.otherDeductions}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.grossEarnings}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.totalDeductions}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.netSalary}
                      </td>
                      <td className="p-2 border-r border-gray-200">{s.ctc}</td>
                      <td className="p-2 border-r border-gray-200">
                        {s.totalWorkingDays}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        {s.absentDays}
                      </td>
                      <td className="p-2 border-r border-gray-200">
                        <StatusPill enabled={s.status === 1} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end pr-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              perPageData={perPageData}
              setPerPageData={setPerPageData}
              filteredData={filteredSalaries}
              totalDataLength={totalDataLength}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-14">
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

export default EmpSalaryDetails;
