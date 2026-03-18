import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 ml-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const StatusPill = ({ enabled }) => (
  <span
    className={`text-xs font-semibold px-2 py-1 rounded-full ${
      enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {enabled ? "Paid" : "Pending"}
  </span>
);

const round = (value) => Math.round(Number(value || 0));

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

  const [viewType, setViewType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeMap, setEmployeeMap] = useState({});
  const [selectedRowId, setSelectedRowId] = useState(null);

  /* 🔹 Fetch Salaries */
  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const response =
        viewType === "monthly"
          ? await axiosInstance.get(`/Salary/month/${selectedMonth}`)
          : await axiosInstance.get(`/Salary/year/${selectedYear}`);

      setSalaries(response.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error fetching salary data",
      );
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 Export All Salaries */
  const handleExportSalaries = async () => {
    try {
      toast.info("Preparing export...");

      const response = await axiosInstance.get("/Salary/ExportAllSalaries", {
        responseType: "blob", // IMPORTANT for file download
      });

      // Create a downloadable link
      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Get filename from header if available
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "AllSalaries.xlsx";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?(.+)/);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Salary export downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to export salary data",
      );
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [viewType, selectedMonth, selectedYear]);

  /* 🔹 Fetch Employees */
  useEffect(() => {
    axiosInstance.get("/Employee").then((res) => {
      const map = {};
      res.data.forEach((emp) => {
        map[emp.id] = { name: emp.fullName, code: emp.employeeCode };
      });
      setEmployeeMap(map);
    });
  }, []);

  /* 🔹 Search Filter */
  const filteredSalaries = useMemo(() => {
    let result = [...salaries];

    // 🔍 Filter by employee name
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((s) =>
        employeeMap[s.employeeId]?.name?.toLowerCase().includes(lower),
      );
    }

    // 🔃 Sort by Employee Code (safe for EMP01, EMP2, 1001 etc.)
    result.sort((a, b) => {
      const codeA = employeeMap[a.employeeId]?.code || "";
      const codeB = employeeMap[b.employeeId]?.code || "";

      return codeA.localeCompare(codeB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    return result;
  }, [salaries, searchTerm, employeeMap]);

  /* 🔹 Totals */
  const totals = useMemo(() => {
    return filteredSalaries.reduce(
      (a, s) => {
        a.basic += s.basicSalary || 0;
        a.hra += s.hra || 0;
        a.conveyance += s.conveyanceAllowance || 0;
        a.special += s.specialAllowance || 0;
        a.fixed += s.fixedAllowance || 0;
        a.bonus += s.bonus || 0;
        a.otHours += s.overtimeHours || 0;
        a.otAmount += s.overtimeAmount || 0;
        a.pf += s.pfEmployee || 0;
        a.esi += s.esicEmployee || 0;
        a.tax += s.professionalTax || 0;
        a.tds += s.tds || 0;
        a.arrears += s.arrears || 0;
        a.leaveEncash += s.leaveEncashment || 0;
        a.loan += s.loanRepayment || 0;
        a.otherDed += s.otherDeductions || 0;
        a.gross += s.grossEarnings || 0;
        a.totalDed += s.totalDeductions || 0;
        a.net += s.netSalary || 0;
        a.ctc += s.ctc || 0;
        a.working += s.totalWorkingDays || 0;
        a.absent += s.absentDays || 0;
        return a;
      },
      {
        basic: 0,
        hra: 0,
        conveyance: 0,
        special: 0,
        fixed: 0,
        bonus: 0,
        otHours: 0,
        otAmount: 0,
        pf: 0,
        esi: 0,
        tax: 0,
        tds: 0,
        arrears: 0,
        leaveEncash: 0,
        loan: 0,
        otherDed: 0,
        gross: 0,
        totalDed: 0,
        net: 0,
        ctc: 0,
        working: 0,
        absent: 0,
      },
    );
  }, [filteredSalaries]);

  return (
    <div className="bg-white shadow rounded-xl">
      {/* Header */}
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex flex-wrap justify-between items-center gap-4">
        <h2 className="font-semibold text-xl">Employee Salary Details</h2>

        <div className="flex gap-2 items-center flex-nowrap overflow-x-auto">
          <input
            type="text"
            placeholder="Search by Employee Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} w-[100px] min-w-[80px]`}
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
              className={`${inputClass} w-[100px] min-w-[80px]`}
            />
          )}

          <button
            onClick={handleExportSalaries}
            className="px-4 py-2 bg-green-600 cursor-pointer text-white rounded-md text-xs font-medium hover:bg-green-700 transition"
          >
            Export_Excel
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filteredSalaries.length > 0 ? (
        <div className="border mt-5 mx-auto max-w-xl md:max-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto border-gray-200 rounded-lg max-h-[75vh]">
          <table className="divide-y divide-gray-200 text-xs text-center">
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
                <th className="p-2 border-r border-gray-200">Special Allow.</th>

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
                <th className="p-2 border-r border-gray-200">Gross Earnings</th>
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
              {filteredSalaries.map((s, idx) => {
                const emp = employeeMap[s.employeeId] || {};
                return (
                  <tr
                    key={s.salaryId}
                    onClick={() => setSelectedRowId(s.salaryId)}
                    className={`cursor-pointer transition-all
                        ${
                          selectedRowId === s.salaryId
                            ? "bg-yellow-200"
                            : idx % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                        }
                        hover:bg-yellow-100
                      `}
                  >
                    <td className="p-2 border-r border-gray-200">{idx + 1}.</td>
                    <td className="p-2 border-r border-gray-200">
                      {emp.code || "-"}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {emp.name || "-"}
                    </td>
                    <td className="p-2 border-r border-gray-200">{s.month}</td>
                    <td className="p-2 border-r border-gray-200">{s.year}</td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.basicSalary)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.hra)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.conveyanceAllowance)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.specialAllowance)}
                    </td>

                    <td className="p-2 border-r border-gray-200">
                      {round(s.fixedAllowance)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.bonus)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {s.overtimeHours}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {s.overtimeRate}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.overtimeAmount)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.pfEmployee)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.esicEmployee)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.professionalTax)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.tds)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.arrears)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.leaveEncashment)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.loanRepayment)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.otherDeductions)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.grossEarnings)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.totalDeductions)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.netSalary)}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      {round(s.ctc)}
                    </td>
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
            <tfoot className="bg-blue-50 sticky bottom-0 z-10 font-semibold">
              <tr className="text-center border-t">
                <td className="p-2 border-r border-gray-200" colSpan={5}>
                  TOTAL
                </td>

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
                  ₹{round(totals.special)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.fixed)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.bonus)}
                </td>

                <td className="p-2 border-r border-gray-200">—</td>
                <td className="p-2 border-r border-gray-200">—</td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.otAmount)}
                </td>

                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.pf)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.esi)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.tax)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.tds)}
                </td>

                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.arrears)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.leaveEncash)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.loan)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.otherDed)}
                </td>

                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.gross)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.totalDed)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.net)}
                </td>
                <td className="p-2 border-r border-gray-200">
                  ₹{round(totals.ctc)}
                </td>

                <td className="p-2 border-r border-gray-200">
                  {totals.working}
                </td>
                <td className="p-2 border-r border-gray-200">
                  {totals.absent}
                </td>
                <td className="p-2 border-r border-gray-200">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
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
