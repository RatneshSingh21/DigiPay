

import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";


// Manual
import ManualSalaryCalculateForm from "../ManualSalary/ManualSalaryCalculateForm";


// Default
import SalaryCalculateGenerateAllDefaultForm from "./SalaryCalculateGenerateAllDefaultForm"
import SalaryGenerateDefaultForm from "./SalaryGenerateDefaultForm";
import SalaryCalculationResultModalDefault from "./SalaryCalculationResultModalDefault";
import SalaryExportDefault from "./SalaryExportDefault";

const inputClass =
    "mt-1 w-64 rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const months = [
    { label: "All Months", value: "" },
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
];

const round = (value) => Math.round(Number(value || 0));

const SalaryDefaultPage = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [showGenerateAllForm, setShowGenerateAllForm] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showExportForm, setShowExportForm] = useState(false);
    const [salaryResult, setSalaryResult] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    /* ================= FILTERED DATA ================= */
    const filteredSalaries = [...salaries]
        .filter((s) => {
            const term = search.toLowerCase();

            const matchesSearch =
                s.employeeName?.toLowerCase().includes(term) ||
                s.employeeCode?.toLowerCase().includes(term);

            const matchesMonth =
                selectedMonth === "" || Number(s.month) === Number(selectedMonth);

            return matchesSearch && matchesMonth;
        })
        .sort((a, b) =>
            (a.employeeCode || "").localeCompare(b.employeeCode || "", undefined, {
                numeric: true,
                sensitivity: "base",
            }),
        );

    /* ================= TOTALS ================= */
    const totals = useMemo(() => {
        return filteredSalaries.reduce(
            (acc, s) => {
                acc.masterBasic += s.masterBasic || 0;
                acc.masterHRA += s.masterHRA || 0;
                acc.masterConv += s.masterConveyance || 0;
                acc.masterSpecial += s.masterSpecialAllowance || 0;

                acc.calcBasic += s.calculatedBasic || 0;
                acc.calcHRA += s.calculatedHRA || 0;
                acc.calcConv += s.calculatedConveyance || 0;
                acc.calcSpecial += s.calculatedSpecialAllowance || 0;

                acc.otAmount += s.otAmount || 0;

                acc.gross += s.grossEarnings || 0;
                acc.deductions += s.totalDeductions || 0;
                acc.net += s.netSalary || 0;

                return acc;
            },
            {
                masterBasic: 0,
                masterHRA: 0,
                masterConv: 0,
                masterSpecial: 0,

                calcBasic: 0,
                calcHRA: 0,
                calcConv: 0,
                calcSpecial: 0,

                otAmount: 0,

                gross: 0,
                deductions: 0,
                net: 0,
            }
        );
    }, [filteredSalaries]);

    /* ================= API ================= */

    const fetchSalaries = async () => {
        try {
            if (!selectedMonth) return;

            setLoading(true);

            const res = await axiosInstance.get(
                "/CalculatedSalary/rich-data/monthly",
                {
                    params: {
                        month: selectedMonth,
                        year: selectedYear,
                    },
                }
            );

            if (res.data.success) {
                setSalaries(res.data.data || []);
            } else {
                toast.error(res.data.message || "Failed to fetch salary data");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch payroll summary");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
    }, [selectedMonth, selectedYear]);

    return (
        <div>
            {/* Header */}
            <div className="px-4 py-2 shadow mb-2 sticky top-14 bg-white z-10 flex justify-between items-center">
                <h2 className="font-semibold text-xl">Calculated Salaries</h2>

                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by Name or Code..."
                        className={inputClass}
                    />
                    <div className="w-40 text-sm">
                        <Select
                            options={months}
                            value={months.find(
                                (m) => String(m.value) === String(selectedMonth),
                            )}
                            onChange={(opt) => setSelectedMonth(opt?.value ?? "")}
                            isClearable={false}
                            menuPortalTarget={document.body}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: "30px",
                                    height: "30px",
                                    borderColor: "#93c5fd",
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: "0 8px",
                                }),
                                indicatorsContainer: (base) => ({
                                    ...base,
                                    height: "30px",
                                }),
                            }}
                        />
                    </div>

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
            <div className="flex justify-end mb-2 mr-2">
                <button
                    onClick={() => setShowExportForm(true)}
                    className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md text-sm"
                >
                    Export Excel
                </button>
            </div>

            <div className="border mx-auto max-w-xl md:min-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto border-gray-200 rounded-lg max-h-[75vh]">
                <table className="table-fixed divide-y divide-gray-200 text-xs text-center">
                    <thead className="text-gray-700 sticky top-0">
                        {/* GROUP HEADER */}
                        <tr className="text-gray-700 text-xs font-semibold">
                            <th
                                colSpan={4}
                                className="p-2 bg-blue-100 border-r border-gray-300"
                            >
                                Employee Details
                            </th>

                            <th
                                colSpan={6}
                                className="p-2 bg-indigo-100 border-r border-gray-300"
                            >
                                Attendance And Leaves
                            </th>

                            <th
                                colSpan={4}
                                className="p-2 bg-blue-100 border-r border-gray-300"
                            >
                                Actual Earnings
                            </th>

                            <th
                                colSpan={8}
                                className="p-2 bg-green-100 border-r border-gray-300"
                            >
                                Calculated Earnings
                            </th>

                            <th
                                colSpan={1}
                                className="p-2 bg-red-100 border-r border-gray-300"
                            >
                                Calculated Deductions
                            </th>

                            <th colSpan={1} className="p-2 bg-purple-100">
                                Final
                            </th>
                        </tr>
                        <tr className="bg-gray-100">
                            {/* Employee Details */}
                            <th className="p-2 border-r border-gray-200">S.No</th>
                            <th className="p-2 border-r border-gray-200">EmpName</th>
                            <th className="p-2 border-r border-gray-200">Month</th>
                            <th className="p-2 border-r border-gray-200">Year</th>

                            {/* Attendance */}

                            <th className="p-2 border-r border-gray-200">Total Working</th>
                            <th className="p-2 border-r border-gray-200">Present</th>
                            <th className="p-2 border-r border-gray-200">Absent</th>
                            <th className="p-2 border-r border-gray-200">Leaves</th>
                            <th className="p-2 border-r border-gray-200">Extra Days</th>
                            <th className="p-2 border-r border-gray-200">Payable Days</th>


                            {/* Actual Salary */}
                            <th className="p-2 border-r border-gray-200">Basic</th>
                            <th className="p-2 border-r border-gray-200">HRA</th>
                            <th className="p-2 border-r border-gray-200">Special</th>
                            <th className="p-2 border-r border-gray-200">Conveyance</th>

                            {/* Calculated Salary */}
                            <th className="p-2 border-r border-gray-200">Basic</th>
                            <th className="p-2 border-r border-gray-200">HRA</th>
                            <th className="p-2 border-r border-gray-200">Special</th>
                            <th className="p-2 border-r border-gray-200">Conveyance</th>
                            <th className="p-2 border-r border-gray-200">OTHrs</th>
                            <th className="p-2 border-r border-gray-200">OTRate</th>
                            <th className="p-2 border-r border-gray-200">OTAmount</th>
                            <th className="p-2 border-r border-gray-200">Gross Earning</th>

                            {/* Deductions */}
                            <th className="p-2 border-r border-gray-200">TotalDed.</th>
                            <th className="p-2 border-r border-gray-200">Net Salary</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-center">
                        {loading ? (
                            <tr>
                                <td colSpan={24} className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredSalaries.length > 0 ? (
                            filteredSalaries.map((s, i) => (
                                <tr
                                    key={`${s.employeeId}-${s.month}-${s.year}`}
                                    onClick={() =>
                                        setSelectedRowId(`${s.employeeId}-${s.month}-${s.year}`)
                                    }
                                    className={`cursor-pointer transition-all
                                            ${selectedRowId === `${s.employeeId}-${s.month}-${s.year}`
                                            ? "bg-yellow-200"
                                            : i % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                        }
                                            hover:bg-yellow-100
                                        `}
                                >
                                    {/* Employee Details */}
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {i + 1}.
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

                                    {/* Attendance */}
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.totalWorkingDays ? s.totalWorkingDays : 0}
                                    </td>

                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.presentDays ? s.presentDays : 0}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.absentDays ? s.absentDays : 0}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.leaveDays ? s.leaveDays : 0}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.extraDaysWorked ? s.extraDaysWorked : 0}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.payableDays ? s.payableDays : 0}
                                    </td>

                                    {/* Actual Salary */}
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.masterBasic)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.masterHRA)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.masterSpecialAllowance)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.masterConveyance)}
                                    </td>

                                    {/* Calculated Salary */}
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.calculatedBasic)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.calculatedHRA)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.calculatedSpecialAllowance)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.calculatedConveyance)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.otHours}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {s.otHours ? s.otRate : 0}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.otAmount)}
                                    </td>

                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.grossEarnings)}
                                    </td>

                                    {/* Deductions */}
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.totalDeductions)}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        {round(s.netSalary)}
                                    </td>
                                </tr>
                            ))
                        ) : !selectedMonth ? (
                            <tr>
                                <td colSpan={45}>
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <FaCalendarAlt className="text-4xl mb-3 text-blue-400" />

                                        <p className="text-lg font-medium">
                                            Select a month to view salary data
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Please choose a month from the dropdown above.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : search !== "" ? (
                            <tr>
                                <td colSpan={24}>
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <FaSearch className="text-4xl mb-3 text-gray-400" />

                                        <p className="text-lg font-medium">
                                            No matching employees found
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Try searching with a different employee name or code.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={24}>
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <FaCalendarAlt className="text-4xl mb-3 text-gray-400" />

                                        <p className="text-lg font-medium">
                                            No salary records found
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Salary may not be generated for this month yet.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>

                    <tfoot className="sticky bottom-0 bg-gray-200 font-semibold text-xs">
                        <tr>
                            {/* Employee Details (5 columns) */}
                            <td
                                colSpan={4}
                                className="p-2 border-r border-gray-200 text-center"
                            >
                                TOTAL
                            </td>

                            {/* Attendance (12 columns) */}
                            <td className="p-2 border-r border-gray-200">-</td>
                            <td className="p-2 border-r border-gray-200">-</td>
                            <td className="p-2 border-r border-gray-200">-</td>
                            <td className="p-2 border-r border-gray-200">-</td>
                            <td className="p-2 border-r border-gray-200">-</td>
                            <td className="p-2 border-r border-gray-200">-</td>


                            {/* ACTUAL EARNINGS (6 columns) */}
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.masterBasic)}
                            </td>
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.masterHRA)}
                            </td>
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.masterSpecial)}
                            </td>
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.masterConv)}
                            </td>

                            {/* CALCULATED EARNINGS (12 columns) */}
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.calcBasic)}
                            </td>
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.calcHRA)}
                            </td>
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.calcSpecial)}
                            </td>
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.calcConv)}
                            </td>


                            <td className="p-2 border-r border-gray-200">-</td>
                            <td className="p-2 border-r border-gray-200">-</td>

                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.otAmount)}
                            </td>
                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.gross)}
                            </td>

                            {/* DEDUCTIONS (9 columns) */}

                            <td className="p-2 border-r border-gray-200">
                                ₹{round(totals.deductions)}
                            </td>

                            {/* FINAL */}
                            <td className="p-2 border-r border-gray-200 text-green-700 font-bold">
                                ₹{round(totals.net)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {showManualForm && (
                <ManualSalaryCalculateForm
                    onClose={() => setShowManualForm(false)}
                    onSuccess={fetchSalaries}
                />
            )}


            {showExportForm && (
                <SalaryExportDefault onClose={() => setShowExportForm(false)} />
            )}



            {/* Form Default Popup */}
            {showForm && (
                <SalaryGenerateDefaultForm
                    onClose={() => setShowForm(false)}
                    onSuccess={(data) => {
                        setSalaryResult(data);
                        fetchSalaries();
                    }}
                />
            )}

            {salaryResult && (
                <SalaryCalculationResultModalDefault
                    data={salaryResult}
                    onClose={() => setSalaryResult(null)}
                />
            )}

            {showGenerateAllForm && (
                <SalaryCalculateGenerateAllDefaultForm
                    onClose={() => setShowGenerateAllForm(false)}
                    onSuccess={fetchSalaries}
                />
            )}

        </div>
    );
};

export default SalaryDefaultPage;

