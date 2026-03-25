import React, { useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { Plus, FileMinus, Info, Upload } from "lucide-react";
import SalaryAmountInputForm from "./SalaryAmountInputForm";
import SalaryAmountBulkForm from "./SalaryAmountBulkForm";
import SalaryImportExportModal from "./SalaryImportExportModal";

const inputClass =
    "mt-1 w-full md:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const buttonClass =
    "flex items-center gap-1 px-4 py-2 rounded text-white font-semibold hover:opacity-90 transition cursor-pointer";

const SalaryAmountInput = () => {
    const [salaryRunId, setSalaryRunId] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [showImportExport, setShowImportExport] = useState(false);

    const fetchData = async () => {
        if (!salaryRunId) {
            toast.error("Enter Salary Run ID");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `/salary-amount-input/by-run/${salaryRunId}`
            );
            setData(res.data || []);
            toast.success("Data fetched successfully!");
        } catch {
            toast.error("Failed to fetch data");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const getTotal = (key) => {
        return data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
    };

    const totals = {
        totalCalendarDays: getTotal("totalCalendarDays"),
        weekOffDays: getTotal("weekOffDays"),
        holidays: getTotal("holidays"),
        leaveDays: getTotal("leaveDays"),

        actualAmountPaid: getTotal("actualAmountPaid"),
        actualPayableDays: getTotal("actualPayableDays"),
        actualWD: getTotal("actualWD"),
        actualAB: getTotal("actualAB"),
        actualTotalEarnings: getTotal("actualTotalEarnings"),
        actualNetSalary: getTotal("actualNetSalary"),

        complianceAmountPaid: getTotal("complianceAmountPaid"),
        compliancePayableDays: getTotal("compliancePayableDays"),
        complianceWD: getTotal("complianceWD"),
        complianceAB: getTotal("complianceAB"),
        complianceDaysDeducted: getTotal("complianceDaysDeducted"),
        complianceNetSalary: getTotal("complianceNetSalary"),

        netSalaryDifference: getTotal("netSalaryDifference"),
        otHours: getTotal("otHours"),
        machineDays: getTotal("machineDays"),
    };

    return (
        <div className="space-y-4">

            {/* HEADER */}
            <div className="sticky top-14 bg-white border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-10 gap-3">

                <div>
                    <h1 className="text-xl font-semibold">Salary Amount Input</h1>
                    <p className="text-gray-500 text-sm">
                        Enter Salary Run ID to fetch salary amount records
                    </p>
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

                    {/* BUTTONS */}
                    <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                        <button onClick={fetchData} className={`bg-primary ${buttonClass}`}>
                            {loading ? "Loading..." : "Fetch Data"}
                        </button>

                        <button
                            onClick={() => setShowForm(true)}
                            className={`bg-secondary ${buttonClass}`}
                        >
                            <Plus size={16} /> Process
                        </button>

                        <button
                            onClick={() => setShowBulkForm(true)}
                            className={`bg-purple-600 ${buttonClass}`}
                        >
                            <Upload size={16} /> Bulk Process
                        </button>
                        <button
                            onClick={() => setShowImportExport(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 cursor-pointer transition"
                        >
                            <Upload size={16} />
                            Import / Export
                        </button>
                    </div>
                </div>
            </div>

            {/* EMPTY STATE */}
            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
                    <FileMinus size={48} className="text-gray-300" />
                    <h3 className="text-lg font-semibold">
                        {salaryRunId ? "No records found" : "No data to display"}
                    </h3>
                    <p className="text-sm text-gray-400 text-center max-w-xs">
                        Enter Salary Run ID and fetch records
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                        <Info size={16} /> Tip: Salary Run ID comes from payroll run
                    </div>
                </div>
            )}

            {/* TABLE */}
            {data.length > 0 && (
                <div className="border mt-5 mx-auto max-w-xl md:max-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto border-gray-200 rounded-lg max-h-[80vh]">

                    <table className="min-w-full text-xs">

                        {/* HEADER */}
                        <thead className="sticky top-0 z-10">

                            {/* GROUP HEADER */}
                            <tr className="text-center text-xs font-semibold text-gray-700">
                                <th colSpan="8" className="bg-gray-200 p-2 border border-gray-200">Basic</th>
                                <th colSpan="8" className="bg-blue-100 p-2 border border-gray-200">Actual</th>
                                <th colSpan="8" className="bg-green-100 p-2 border border-gray-200">Compliance</th>
                                <th colSpan="4" className="bg-purple-100 p-2 border border-gray-200">Comparison</th>
                            </tr>

                            {/* COLUMN HEADER */}
                            <tr className="bg-gray-100 text-gray-600 uppercase text-xs">

                                {/* BASIC */}
                                <th className="p-3">S.No</th>
                                <th className="p-3">Employee</th>
                                <th className="p-3">Month</th>
                                <th className="p-3">Year</th>
                                <th className="p-3 text-center">Cal Days</th>
                                <th className="p-3 text-center">WeekOff</th>
                                <th className="p-3 text-center">Holidays</th>
                                <th className="p-3 text-center">Leaves</th>

                                {/* ACTUAL */}
                                <th className="p-3 text-center">Actual Paid</th>
                                <th className="p-3 text-center">Per Day</th>
                                <th className="p-3 text-center">Payable</th>
                                <th className="p-3 text-center">WD</th>
                                <th className="p-3 text-center">AB</th>
                                <th className="p-3 text-center">Prorata</th>
                                <th className="p-3 text-center">Total Earn</th>
                                <th className="p-3 text-center">Net</th>

                                {/* COMPLIANCE */}
                                <th className="p-3 text-center">Comp Paid</th>
                                <th className="p-3 text-center">Per Day</th>
                                <th className="p-3 text-center">Payable</th>
                                <th className="p-3 text-center">WD</th>
                                <th className="p-3 text-center">AB</th>
                                <th className="p-3 text-center">Deduct</th>
                                <th className="p-3 text-center">Prorata</th>
                                <th className="p-3 text-center">Net</th>

                                {/* COMPARISON */}
                                <th className="p-3 text-center">Diff</th>
                                <th className="p-3 text-center">Match</th>
                                <th className="p-3 text-center">OT</th>
                                <th className="p-3 text-center">Machine</th>

                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody>
                            {data.map((item, i) => (
                                <tr key={item.id} className="hover:bg-gray-50 text-center">

                                    {/* BASIC */}
                                    <td className="p-3">{i + 1}.</td>
                                    <td className="p-3">
                                        {item.employeeName}({item.employeeCode})
                                    </td>
                                    <td className="p-3">{item.month}</td>
                                    <td className="p-3">{item.year}</td>
                                    <td className="p-3 text-center">{item.totalCalendarDays}</td>
                                    <td className="p-3 text-center">{item.weekOffDays}</td>
                                    <td className="p-3 text-center">{item.holidays}</td>
                                    <td className="p-3 text-center">{item.leaveDays}</td>

                                    {/* ACTUAL */}
                                    <td className="p-3 text-center">{item.actualAmountPaid}</td>
                                    <td className="p-3 text-center">{item.actualPerDayRate}</td>
                                    <td className="p-3 text-center">{item.actualPayableDays}</td>
                                    <td className="p-3 text-center">{item.actualWD}</td>
                                    <td className="p-3 text-center">{item.actualAB}</td>
                                    <td className="p-3 text-center">{item.actualProrataFactor}</td>
                                    <td className="p-3 text-center">{item.actualTotalEarnings}</td>
                                    <td className="p-3 text-center">{item.actualNetSalary}</td>

                                    {/* COMPLIANCE */}
                                    <td className="p-3 text-center">{item.complianceAmountPaid}</td>
                                    <td className="p-3 text-center">{item.compliancePerDayRate}</td>
                                    <td className="p-3 text-center">{item.compliancePayableDays}</td>
                                    <td className="p-3 text-center">{item.complianceWD}</td>
                                    <td className="p-3 text-center">{item.complianceAB}</td>
                                    <td className="p-3 text-center">{item.complianceDaysDeducted}</td>
                                    <td className="p-3 text-center">{item.complianceProrataFactor}</td>
                                    <td className="p-3 text-center">{item.complianceNetSalary}</td>

                                    {/* COMPARISON */}
                                    <td className="p-3 text-center">{item.netSalaryDifference}</td>

                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.netSalaryMatchesHRInput
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-600"
                                            }`}>
                                            {item.netSalaryMatchesHRInput ? "Yes" : "No"}
                                        </span>
                                    </td>

                                    <td className="p-3 text-center">{item.otHours}</td>
                                    <td className="p-3 text-center">{item.machineDays}</td>

                                </tr>
                            ))}
                        </tbody>

                        {/* FOOTER TOTAL */}
                        <tfoot className="bg-gray-100 sticky bottom-0 font-semibold text-xs">
                            <tr className="text-center">

                                {/* BASIC (8 columns) */}
                                <td colSpan={4} className="p-3">TOTAL</td>

                                <td className="text-center">{totals.totalCalendarDays}</td>
                                <td className="text-center">{totals.weekOffDays}</td>
                                <td className="text-center">{totals.holidays}</td>
                                <td className="text-center">{totals.leaveDays}</td>

                                {/* ACTUAL (8 columns) */}
                                <td className="text-center">{totals.actualAmountPaid}</td>
                                <td></td> {/* Per Day */}
                                <td className="text-center">{totals.actualPayableDays}</td>
                                <td className="text-center">{totals.actualWD}</td>
                                <td className="text-center">{totals.actualAB}</td>
                                <td></td> {/* Prorata */}
                                <td className="text-center">{totals.actualTotalEarnings}</td>
                                <td className="text-center">{totals.actualNetSalary}</td>

                                {/* COMPLIANCE (8 columns) */}
                                <td className="text-center">{totals.complianceAmountPaid}</td>
                                <td></td> {/* Per Day */}
                                <td className="text-center">{totals.compliancePayableDays}</td>
                                <td className="text-center">{totals.complianceWD}</td>
                                <td className="text-center">{totals.complianceAB}</td>
                                <td className="text-center">{totals.complianceDaysDeducted}</td>
                                <td></td> {/* Prorata */}
                                <td className="text-center">{totals.complianceNetSalary}</td>

                                {/* COMPARISON (4 columns) */}
                                <td className="text-center">{totals.netSalaryDifference}</td>
                                <td></td> {/* Match */}
                                <td className="text-center">{totals.otHours}</td>
                                <td className="text-center">{totals.machineDays}</td>

                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}


            {/* MODALS */}
            {showForm && <SalaryAmountInputForm onClose={() => setShowForm(false)} />}
            {showBulkForm && <SalaryAmountBulkForm onClose={() => setShowBulkForm(false)} />}
            {showImportExport && (
                <SalaryImportExportModal onClose={() => setShowImportExport(false)} />
            )}
        </div>
    );
};

export default SalaryAmountInput;