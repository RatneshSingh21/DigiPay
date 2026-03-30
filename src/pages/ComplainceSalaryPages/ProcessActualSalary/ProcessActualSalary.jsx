import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import ProcessActualSalaryForm from "./ProcessActualSalaryForm";
import ProcessActualSalaryBulkForm from "./ProcessActualSalaryBulkForm";
import { Plus, FileMinus, Info, Upload } from "lucide-react";
import ActualSalaryImportExportModal from "./ActualSalaryImportExportModal";

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
    const [showImportExport, setShowImportExport] = useState(false);

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
    const getMonthYear = (month, year) => {
        const months = [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];

        return `${months[month - 1]}-${year}`;
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
                        <button
                            onClick={() => setShowImportExport(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-secondary cursor-pointer transition"
                        >
                            <Upload size={16} />
                            Export
                            {/* Import / Export */}
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
                <div className="border border-gray-200 mt-5 mx-auto max-w-xl md:max-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto rounded-lg max-h-[80vh]">
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-50 text-gray-700 text-xs sticky top-0 z-10 border-b-2 border-gray-200">
                            <tr className="text-center">
                                <th className="p-3 min-w-[120px] font-semibold tracking-wide border-r border-gray-200">S.No / Code</th>
                                <th className="p-3 min-w-[180px] font-semibold tracking-wide border-r border-gray-200">Employee</th>
                                <th className="p-3 min-w-[140px] font-semibold tracking-wide border-r border-gray-200">Attendance</th>
                                <th className="p-3 min-w-[150px] font-semibold tracking-wide border-r border-gray-200">Salary</th>
                                <th className="p-3 min-w-[150px] font-semibold tracking-wide border-r border-gray-200">Earnings</th>
                                <th className="p-3 min-w-[130px] font-semibold tracking-wide border-r border-gray-200">OT</th>
                                <th className="p-3 min-w-[120px] font-semibold tracking-wide border-r border-gray-200">Total Earn</th>
                                <th className="p-3 min-w-[150px] font-semibold tracking-wide border-r border-gray-200">Deductions</th>
                                <th className="p-3 min-w-[140px] font-semibold tracking-wide">Net Pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrichedSalaryData.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-gray-200 text-xs align-top hover:bg-gray-50 transition"
                                >

                                    {/* PAYCODE + DATE */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="font-bold text-gray-800 text-sm">
                                            {item.sNo}.
                                        </div>

                                        <div className="text-[11px] text-gray-500 mt-1">
                                            {item.employeeName?.split("(")[1]?.replace(")", "")}
                                        </div>

                                        <div className="text-primary text-[11px] font-semibold mt-1">
                                            {getMonthYear(item.month, item.year)}
                                        </div>

                                        <div className="text-[10px] text-gray-400 mt-1">
                                            SalaryRunID: {salaryRunId}
                                        </div>
                                    </td>

                                    {/* EMPLOYEE */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="font-semibold text-gray-800">
                                            {item.employeeName}
                                        </div>

                                        <div className="mt-2 text-gray-500 text-xs space-y-1">
                                            <div>PF No: -</div>
                                            <div>ESI No: -</div>
                                        </div>
                                    </td>

                                    {/* ATTENDANCE */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="space-y-1 text-gray-700">
                                            <div className="flex justify-between">
                                                <span>Working Days</span>
                                                <b>{item.payableDays}</b>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Prorata</span>
                                                <span>{item.prorataFactor}</span>
                                            </div>

                                            <div className="border-t border-gray-400 pt-1 mt-2 flex justify-between font-medium">
                                                <span>Payable</span>
                                                <span>{item.payableDays}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* SALARY */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="space-y-1 text-gray-700">
                                            <div className="flex justify-between"><span>Basic</span><span>₹ {format(item.displayBasic)}</span></div>
                                            <div className="flex justify-between"><span>HRA</span><span>₹ {format(item.displayHRA)}</span></div>
                                            <div className="flex justify-between"><span>Conv</span><span>₹ {format(item.displayCONV)}</span></div>
                                            <div className="flex justify-between"><span>Other</span><span>₹ {format(item.displayOther)}</span></div>
                                        </div>
                                    </td>

                                    {/* EARNINGS */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="space-y-1 text-gray-700">
                                            <div className="flex justify-between"><span>Basic</span><span>₹ {format(item.earnBasic)}</span></div>
                                            <div className="flex justify-between"><span>HRA</span><span>₹ {format(item.earnHRA)}</span></div>
                                            <div className="flex justify-between"><span>Conv</span><span>₹ {format(item.earnCONV)}</span></div>
                                            <div className="flex justify-between"><span>Other</span><span>₹ {format(item.earnOther)}</span></div>
                                        </div>
                                    </td>
                                    {/* OT */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="space-y-1 text-gray-700">
                                            <div className="flex justify-between"><span>Hours</span><span>{item.otHours}</span></div>
                                            <div className="flex justify-between"><span>Rate</span><span>₹ {format(item.otRate)}</span></div>
                                            <div className="flex justify-between font-medium"><span>Amt</span><span>₹ {format(item.otAmount)}</span></div>
                                        </div>
                                    </td>

                                    {/* TOTAL EARNINGS */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="font-semibold text-blue-600">
                                            ₹ {format(item.totalEarnings)}
                                        </div>
                                    </td>

                                    {/* DEDUCTIONS */}
                                    <td className="p-3 min-w-[120px] text-center border-r border-gray-100">
                                        <div className="space-y-1 text-gray-700">
                                            <div className="flex justify-between"><span>PF</span><span>₹ {format(item.employeePF)}</span></div>
                                            <div className="flex justify-between"><span>ESI</span><span>₹ {format(item.employeeESI)}</span></div>
                                            <div className="flex justify-between"><span>Loan</span><span>₹ {format(item.loanDeduction)}</span></div>

                                            <div className="border-t pt-1 mt-2 flex justify-between font-semibold text-red-600">
                                                <span>Total</span>
                                                <span>₹ {format(item.totalDeductions)}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* NET */}
                                    <td className="p-3 min-w-[140px] text-center">
                                        <div className="font-bold text-green-600 text-base">
                                            ₹ {format(item.netSalary)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* <tfoot className="bg-gray-100 sticky bottom-0 font-semibold text-xs">
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
                        </tfoot> */}
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
            {showImportExport && (
                <ActualSalaryImportExportModal onClose={() => setShowImportExport(false)} />
            )}
        </div>
    );
};

export default ProcessActualSalary;