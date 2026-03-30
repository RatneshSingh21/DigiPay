import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";
import {
    Users,
    Clock,
    CalendarDays,
    Plus,
    X,
} from "lucide-react";
import AttendanceManipulationForm from "./AttendanceManipulationForm";


const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "38px",
        fontSize: "14px",
        borderColor: "#d1d5db",
        boxShadow: "none",
        "&:hover": { borderColor: "#3b82f6" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
};

const MONTH_OPTIONS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - 2 + i;
    return { value: y, label: String(y) };
});

const AttendanceManipulation = () => {
    const [data, setData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [finalData, setFinalData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [month, setMonth] = useState(MONTH_OPTIONS[new Date().getMonth()]);
    const [year, setYear] = useState(YEAR_OPTIONS[2]);

    const [search, setSearch] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [viewType, setViewType] = useState("final"); // values: "actual" | "compliance" | "manipulated" or "final"
    const [salaryRunId, setSalaryRunId] = useState(null);
    const [showSalaryModal, setShowSalaryModal] = useState(false);

    // 🔹 Fetch Attendance
    const fetchData = async () => {
        let url = "";

        if (viewType === "actual" && salaryRunId) {
            url = `/PayrollAttendance/actual/salary-run/${salaryRunId}`;
        } else if (viewType === "compliance" && salaryRunId) {
            url = `/PayrollAttendance/compliance/salary-run/${salaryRunId}`;
        } else if (viewType === "final") {
            url = `/PayrollAttendance/month?month=${month.value}&year=${year.value}`;
        } else {
            setData([]);
            return;
        }

        const res = await axiosInstance.get(url);
        setData(res.data.data || []);
    };

    // 🔹 Fetch Employees
    const fetchEmployees = async () => {
        const res = await axiosInstance.get(`/Employee`);
        setEmployees(res.data || []);
    };

    useEffect(() => {
        fetchData();
        fetchEmployees();
    }, [month, year]);

    // 🔥 Merge Employee + Attendance (optimized)
    useEffect(() => {
        if (!data.length || !employees.length) return;

        const mapped = data.map((row) => {
            const emp = employees.find((e) => e.id === row.employeeId);

            return {
                ...row,
                fullName: emp?.fullName || "N/A",
                employeeCode: emp?.employeeCode || "N/A",
            };
        });

        setFinalData(mapped);
        setFilteredData(mapped);
    }, [data, employees]);

    // 🔍 Search
    useEffect(() => {
        const s = search.toLowerCase();

        const filtered = finalData.filter((row) =>
            row.fullName.toLowerCase().includes(s) ||
            row.employeeCode.toLowerCase().includes(s) ||
            String(row.employeeId).includes(s)
        );

        setFilteredData(filtered);
    }, [search, finalData]);

    // 🔹 Clear data on tab switch
    useEffect(() => {
        setData([]);
        setFinalData([]);
        setFilteredData([]);
    }, [viewType]);

    // 🔹 Fetch attendance whenever month/year (for manipulated) or salaryRunId (for actual/compliance) changes
    useEffect(() => {
        if (viewType === "final") {
            fetchData();
        } else if ((viewType === "actual" || viewType === "compliance") && salaryRunId) {
            fetchData();
        }
    }, [month, year, salaryRunId, viewType]);

    // 📊 Summary
    const totalEmployees = finalData.length;
    const totalOT = finalData.reduce((s, e) => s + (e.otHours || 0), 0);
    const avgWD =
        finalData.length > 0
            ? (
                finalData.reduce((s, e) => s + (e.wd || 0), 0) /
                finalData.length
            ).toFixed(1)
            : 0;

    return (
        <div className="space-y-4">

            {/* 🔥 HEADER */}
            <div className="sticky top-14 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex gap-2 items-center">
                    <div>
                        <h1 className="text-xl font-semibold">Compliance Processed Attendance</h1>
                        <p className="text-gray-500 text-sm">
                            Adjust payroll attendance before processing
                        </p>

                    </div>
                    {/* 🔥 MODE INDICATOR */}
                    <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full ${viewType === "actual"
                            ? "bg-blue-100 text-blue-600"
                            : viewType === "compliance"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-green-100 text-green-600"
                            }`}
                    >
                        {viewType.toUpperCase()}
                    </span>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">

                    <button
                        onClick={() => {
                            setViewType("actual");
                            setShowSalaryModal(true); // always open modal when switching to actual
                        }}
                        className={`px-4 py-1.5 text-sm rounded-md cursor-pointer font-semibold transition ${viewType === "actual"
                            ? "bg-white shadow text-blue-600"
                            : "text-gray-500"
                            }`}
                    >
                        Actual
                    </button>

                    <button
                        onClick={() => {
                            setViewType("compliance");
                            setShowSalaryModal(true); // always open modal when switching to compliance
                        }}
                        className={`px-4 py-1.5 text-sm rounded-md cursor-pointer font-semibold transition ${viewType === "compliance"
                            ? "bg-white shadow text-blue-600"
                            : "text-gray-500"
                            }`}
                    >
                        Compliance
                    </button>

                    <button
                        onClick={() => setViewType("final")}
                        className={`px-4 py-1.5 text-sm rounded-md cursor-pointer font-semibold transition ${viewType === "final"
                            ? "bg-white shadow text-blue-600"
                            : "text-gray-500"
                            }`}
                    >
                        Final Attendance
                    </button>

                </div>

                <div className="flex gap-3 items-center">
                    <div className="w-44">
                        <Select
                            options={MONTH_OPTIONS}
                            value={month}
                            onChange={setMonth}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>

                    <div className="w-32">
                        <Select
                            options={YEAR_OPTIONS}
                            value={year}
                            onChange={setYear}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>

                    {/* ➕ ADD BUTTON */}
                    <button
                        onClick={() => setSelectedRow({})}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-secondary cursor-pointer"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>
            </div>

            {/* 📊 SUMMARY */}
            <div className="grid grid-cols-3 gap-4 px-4">
                <Card icon={<Users />} title="Employees" value={totalEmployees} />
                <Card icon={<CalendarDays />} title="Avg WD" value={avgWD} />
                <Card icon={<Clock />} title="Total OT" value={totalOT} />
            </div>

            {/* 🔍 SEARCH */}
            <div className="px-4">
                <input
                    placeholder="Search by Name / Code / ID..."
                    className={inputClass + " w-80"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* 📊 TABLE */}
            <div className="border border-gray-200 mx-4 overflow-auto rounded-xl max-h-[60vh] shadow-sm">
                <table className="w-full text-sm">

                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr className="text-gray-600 uppercase text-xs">
                            <th className="p-3">S.No</th>
                            <th className="p-3 text-left">Employee</th>

                            <th className="p-3">Days</th>
                            <th className="p-3">WD</th>
                            <th className="p-3">WO</th>

                            <th className="p-3">EL</th>
                            <th className="p-3">CL</th>
                            <th className="p-3">SL</th>
                            <th className="p-3">HD</th>
                            <th className="p-3">MT</th>

                            <th className="p-3">Absent</th>
                            <th className="p-3">Paid Leave</th>

                            <th className="p-3">Raw Days</th>
                            <th className="p-3">Payable</th>
                            <th className="p-3">Prorata</th>

                            <th className="p-3">OT</th>
                            <th className="p-3">Excess OT</th>
                            <th className="p-3">Deduct_Days</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="18">
                                    <div className="flex flex-col items-center justify-center py-16 text-center">

                                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                                            <Users className="text-gray-400" size={28} />
                                        </div>

                                        <h3 className="text-sm font-semibold text-gray-700">
                                            No attendance records found
                                        </h3>

                                        <p className="text-xs text-gray-400 mt-1">
                                            Try changing month/year or search criteria
                                        </p>

                                        <button
                                            onClick={() => setSelectedRow({})}
                                            className="mt-4 px-4 py-2 bg-primary cursor-pointer text-white text-sm rounded-md hover:bg-secondary"
                                        >
                                            + Add Attendance
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, i) => (
                                <tr
                                    key={i}
                                    className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                                >
                                    <td className="p-3">{i + 1}.</td>

                                    <td className="p-3 text-left">
                                        <div className="font-medium">{row.fullName}</div>
                                        <div className="text-gray-400 text-xs">
                                            {row.employeeCode}
                                        </div>
                                    </td>

                                    <td className="p-3">{row.totalCalendarDays}</td>
                                    <td className="p-3">{row.wd}</td>
                                    <td className="p-3">{row.wo}</td>

                                    <td className="p-3">{row.el}</td>
                                    <td className="p-3">{row.cl}</td>
                                    <td className="p-3">{row.sl}</td>
                                    <td className="p-3">{row.hd}</td>
                                    <td className="p-3">{row.mt || 0}</td>

                                    <td className="p-3 text-red-500 font-medium">{row.ab}</td>
                                    <td className="p-3">{row.paidLeaveDays}</td>

                                    <td className="p-3">{row.rawMachineDays || 0}</td>
                                    <td className="p-3 text-green-600 font-semibold">
                                        {row.payableDays}
                                    </td>

                                    <td className="p-3">{row.prorataFactor}</td>

                                    <td className="p-3 text-purple-600">{row.otHours}</td>
                                    <td className="p-3 text-indigo-600">{row.excessOTHours || 0}</td>

                                    <td className="p-3 text-yellow-600">{row.daysDeducted || 0}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL ONLY ON ADD */}
            {selectedRow !== null && (
                <AttendanceManipulationForm
                    data={selectedRow}
                    onClose={() => setSelectedRow(null)}
                    onSuccess={fetchData}
                />
            )}

            {showSalaryModal && (
                <SalaryRunModal
                    onClose={() => setShowSalaryModal(false)}
                    onSubmit={(id) => {
                        setSalaryRunId(id); // update state
                        setShowSalaryModal(false); // close modal
                    }}
                />
            )}
        </div>
    );
};

export default AttendanceManipulation;

// 🔹 Card
const Card = ({ icon, title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
        <div className="bg-gray-100 p-2 rounded">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-lg font-semibold">{value}</h3>
        </div>
    </div>
);

const SalaryRunModal = ({ onClose, onSubmit }) => {
    const [id, setId] = useState("");
    const inputClass =
        "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-full p-6 relative animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Enter Salary Run ID</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-600 cursor-pointer transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Salary Run ID
                    </label>
                    <input
                        type="number"
                        placeholder="Enter Salary Run ID"
                        className={inputClass}
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 cursor-pointer text-gray-700 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSubmit(id);
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-primary cursor-pointer text-white hover:bg-secondary transition"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};