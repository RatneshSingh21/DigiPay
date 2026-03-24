import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import ProcessActualSalaryForm from "./ProcessActualSalaryForm";
import ProcessActualSalaryBulkForm from "./ProcessActualSalaryBulkForm";
import { Plus, FileMinus, Info } from "lucide-react";

const inputClass =
    "w-full md:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const buttonClass =
    "flex items-center gap-1 px-4 py-2 rounded text-white font-semibold hover:opacity-90 transition cursor-pointer";

const ProcessActualSalary = () => {
    const [mode, setMode] = useState("single"); // single | bulk
    const [salaryRunId, setSalaryRunId] = useState("");
    const [salaryData, setSalaryData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Fetch employees once
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axiosInstance.get("/Employee");
            setEmployees(res.data || []);
        } catch (error) {
            toast.error("Failed to fetch employees");
        }
    };

    const fetchSalaryData = async () => {
        if (!salaryRunId) {
            toast.error("Enter Salary Run ID to fetch data");
            return;
        }
        setLoadingData(true);
        try {
            const res = await axiosInstance.get(`/ActualSalary/run/${salaryRunId}`);
            setSalaryData(res.data.data || []);
            toast.success("Salary data fetched successfully!");
        } catch (error) {
            toast.error("Failed to fetch salary data");
            setSalaryData([]);
        } finally {
            setLoadingData(false);
        }
    };

    const enrichedSalaryData = salaryData.map((item, index) => {
        const emp = employees.find((e) => e.id === item.employeeId);
        return {
            ...item,
            sNo: index + 1,
            employeeName: emp ? `${emp.fullName} (${emp.employeeCode})` : item.employeeId,
        };
    });

    const format = (num) => num?.toFixed(2);

    const totals = enrichedSalaryData.reduce(
        (acc, item) => {
            acc.payableDays += item.payableDays || 0;
            acc.otHours += item.otHours || 0;
            acc.otAmount += item.otAmount || 0;
            acc.basic += item.displayBasic || 0;
            acc.hra += item.displayHRA || 0;
            acc.conv += item.displayCONV || 0;
            acc.other += item.displayOther || 0;
            acc.special += item.displaySpecial || 0;
            acc.gross += item.earnGross || 0;
            acc.totalEarnings += item.totalEarnings || 0;
            acc.totalDeductions += item.totalDeductions || 0;
            acc.netSalary += item.netSalary || 0;

            return acc;
        },
        {
            payableDays: 0,
            otHours: 0,
            otAmount: 0,
            basic: 0,
            hra: 0,
            conv: 0,
            other: 0,
            special: 0,
            gross: 0,
            totalEarnings: 0,
            totalDeductions: 0,
            netSalary: 0,
        }
    );

    return (
        <div className="space-y-4">

            {/* HEADER + INPUT + BUTTONS */}
            <div className="sticky top-14 bg-white border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-10 gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Process Actual Salary</h1>
                    <p className="text-gray-500 text-sm">Enter Salary Run ID to fetch salary records</p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                    {/* Salary Run ID with label and hint */}
                    <div className="flex flex-col items-center w-full md:w-auto gap-1">
                        <div>
                            <label htmlFor="salaryRunId" className="text-sm font-semibold text-gray-700 mr-2">
                                SalaryRunID:
                            </label>
                            <input
                                id="salaryRunId"
                                type="number"
                                placeholder="Enter salary run ID (e.g., 1023)"
                                value={salaryRunId}
                                onChange={(e) => setSalaryRunId(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <p className="text-xs text-gray-400">Enter the SalaryRunID in Format <strong>YYYYMM</strong> Like <strong>202603</strong> form March2026</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                        <button
                            onClick={fetchSalaryData}
                            className={`bg-primary ${buttonClass}`}
                        >
                            {loadingData ? "Loading..." : "Fetch Data"}
                        </button>

                        <button
                            onClick={() => { setMode("single"); setShowForm(true); }}
                            className={`bg-secondary ${buttonClass}`}
                        >
                            <Plus size={16} /> Process Single
                        </button>

                        <button
                            onClick={() => { setMode("bulk"); setShowForm(true); }}
                            className={`bg-green-600 ${buttonClass}`}
                        >
                            <Plus size={16} /> Process Bulk
                        </button>
                    </div>
                </div>
            </div>


            {/* EMPTY STATE */}
            {salaryData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
                    <FileMinus size={48} className="text-gray-300" />
                    <h3 className="text-lg font-semibold">
                        {salaryRunId ? "No salary records found" : "No data to display"}
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xs text-center">
                        {salaryRunId
                            ? "The entered Salary Run ID does not have any processed salary records yet. Check the ID or try a different one."
                            : "Please enter a Salary Run ID above and click on 'Fetch Data' to see employee salary records."}
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
                                <th className="p-3 text-left">Employee Name</th>
                                <th className="p-3">Month</th>
                                <th className="p-3">Year</th>
                                <th className="p-3 text-right">Payable Days</th>
                                <th className="p-3 text-right">Prorata Factor</th>
                                <th className="p-3 text-right">Salary Rate</th>
                                <th className="p-3 text-right">OTHours</th>
                                <th className="p-3 text-right">OTRate</th>
                                <th className="p-3 text-right">OTAmount</th>
                                <th className="p-3 text-right">Basic</th>
                                <th className="p-3 text-right">HRA</th>
                                <th className="p-3 text-right">Conveyance</th>
                                <th className="p-3 text-right">Other</th>
                                <th className="p-3 text-right">Special</th>
                                <th className="p-3 text-right">EarnedBasic</th>
                                <th className="p-3 text-right">EarnedHRA</th>
                                <th className="p-3 text-right">EarnedConv.</th>
                                <th className="p-3 text-right">EarnedSpecial</th>
                                <th className="p-3 text-right">EarnedOther</th>
                                <th className="p-3 text-right">GrossEarnings</th>
                                <th className="p-3 text-right">TotalEarnings</th>
                                <th className="p-3 text-right">PFBase</th>
                                <th className="p-3 text-right">EmployeePF</th>
                                <th className="p-3 text-right">EmployerPF</th>
                                <th className="p-3 text-right">ESIBase</th>
                                <th className="p-3 text-right">EmployeeESI</th>
                                <th className="p-3 text-right">EmployerESI</th>
                                <th className="p-3 text-right">LoanDeduction</th>
                                <th className="p-3 text-right">TotalDeductions</th>
                                <th className="p-3 text-right">NetSalary</th>
                                <th className="p-3 text-center">MinWageCase</th>
                                <th className="p-3 text-center">ESIApplicable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrichedSalaryData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 text-center">
                                    <td className="p-3">{index + 1}.</td>
                                    <td className="p-3 text-left">{item.employeeName}</td>
                                    <td className="p-3">{item.month}</td>
                                    <td className="p-3">{item.year}</td>
                                    <td className="p-3 text-right">{item.payableDays}</td>
                                    <td className="p-3 text-right">{item.prorataFactor}</td>
                                    <td className="p-3 text-right">{item.salaryRate}</td>
                                    <td className="p-3 text-right">{item.otHours}</td>
                                    <td className="p-3 text-right">{item.otRate}</td>
                                    <td className="p-3 text-right">{item.otAmount}</td>
                                    <td className="p-3 text-right">{item.displayBasic}</td>
                                    <td className="p-3 text-right">{item.displayHRA}</td>
                                    <td className="p-3 text-right">{item.displayCONV}</td>
                                    <td className="p-3 text-right">{item.displayOther}</td>
                                    <td className="p-3 text-right">{item.displaySpecial}</td>
                                    <td className="p-3 text-right">{item.earnBasic}</td>
                                    <td className="p-3 text-right">{item.earnHRA}</td>
                                    <td className="p-3 text-right">{item.earnCONV}</td>
                                    <td className="p-3 text-right">{item.earnSpecial}</td>
                                    <td className="p-3 text-right">{item.earnOther}</td>
                                    <td className="p-3 text-right">{item.earnGross}</td>
                                    <td className="p-3 text-right">{item.totalEarnings}</td>
                                    <td className="p-3 text-right">{item.pfBase}</td>
                                    <td className="p-3 text-right">{item.employeePF}</td>
                                    <td className="p-3 text-right">{item.employerPF}</td>
                                    <td className="p-3 text-right">{item.esiBase}</td>
                                    <td className="p-3 text-right">{item.employeeESI}</td>
                                    <td className="p-3 text-right">{item.employerESI}</td>
                                    <td className="p-3 text-right">{item.loanDeduction}</td>
                                    <td className="p-3 text-right">{item.totalDeductions}</td>
                                    <td className="p-3 text-right">{item.netSalary}</td>
                                    <td className="p-3 text-center">{item.isMinWageCase ? "Yes" : "No"}</td>
                                    <td className="p-3 text-center">{item.isESIApplicable ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 sticky bottom-0 font-semibold text-xs">
                            <tr className="text-center">
                                <td className="p-3"></td>
                                <td className="p-3 text-left">TOTAL</td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>

                                <td className="p-3 text-right">{format(totals.payableDays)}</td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>

                                <td className="p-3 text-right">{format(totals.otHours)}</td>
                                <td className="p-3"></td>
                                <td className="p-3 text-right">{format(totals.otAmount)}</td>

                                <td className="p-3 text-right">{format(totals.basic)}</td>
                                <td className="p-3 text-right">{format(totals.hra)}</td>
                                <td className="p-3 text-right">{format(totals.conv)}</td>
                                <td className="p-3 text-right">{format(totals.other)}</td>
                                <td className="p-3 text-right">{format(totals.special)}</td>

                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>

                                <td className="p-3 text-right">{format(totals.gross)}</td>
                                <td className="p-3 text-right">{format(totals.totalEarnings)}</td>

                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>

                                <td className="p-3"></td>
                                <td className="p-3 text-right">{format(totals.totalDeductions)}</td>
                                <td className="p-3 text-right">{format(totals.netSalary)}</td>

                                <td className="p-3"></td>
                                <td className="p-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* MODAL FORM */}
            {showForm && (
                <div>
                    {mode === "single" ? (
                        <ProcessActualSalaryForm onClose={() => setShowForm(false)} />
                    ) : (
                        <ProcessActualSalaryBulkForm onClose={() => setShowForm(false)} />
                    )}
                </div>
            )}
        </div>
    );
};

export default ProcessActualSalary;