import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";
import {
    Download,
    Upload,
    Users,
    Clock,
    CalendarDays,
    Plus,
    Search,
} from "lucide-react";
import { toast } from "react-toastify";
import AttendanceTestManualForm from "./AttendanceTestManualForm";

const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const monthOptions = [
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

const AttendanceTestManual = () => {
    const [data, setData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    // Fetch Data
    const fetchData = async () => {
        const res = await axiosInstance.get("/PayrollAttendance/preview/manual");
        setData(res.data.data || []);
        setFilteredData(res.data.data || []);
    };

    // Fetch Employees
    const fetchEmployees = async () => {
        const res = await axiosInstance.get("/Employee");
        setEmployees(res.data.data || []);
    };
    // Search
    useEffect(() => {
        const filtered = data.filter((e) => {
            const name = e.employeeName?.toLowerCase() || "";
            const code = e.employeeCode?.toLowerCase() || "";

            const matchesSearch =
                name.includes(search.toLowerCase()) ||
                code.includes(search.toLowerCase());

            const matchesMonth = selectedMonth
                ? e.month === selectedMonth.value
                : true;

            return matchesSearch && matchesMonth;
        });

        setFilteredData(filtered);
    }, [search, selectedMonth, data]);

    // Summary
    const totalEmployees = employees.length;
    const totalOT = data.reduce((sum, e) => sum + (e.rawOTHours || 0), 0);
    const avgWD =
        data.length > 0
            ? (data.reduce((sum, e) => sum + (e.rawWD || 0), 0) / data.length).toFixed(1)
            : 0;



    // Download
    const handleDownload = async () => {
        const res = await axiosInstance.get(
            "/PayrollAttendance/download-attendance-preview-excel",
            { responseType: "blob" }
        );
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Attendance.xlsx");
        link.click();
    };

    // Upload + Preview (table style)
    const handleUpload = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await axiosInstance.post(
                "/PayrollAttendance/upload-attendance-preview-excel",
                formData
            );

            toast.success("File uploaded successfully");
            fetchData();
        } catch (err) {
            toast.error("Upload failed");
        }
    };

    useEffect(() => {
        fetchData();
        fetchEmployees();
    }, []);

    return (
        <div className="space-y-2">

            {/* 🔥 PROFESSIONAL HEADER */}
            <div className="sticky top-14 z-50 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">                <div>
                <h1 className="text-xl font-semibold">Attendance Management</h1>
                <p className="text-gray-500 text-sm">
                    Manage manual attendance, upload Excel & review payroll data
                </p>
            </div>

                <div className="flex gap-3">

                    {/* Upload */}
                    <label className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow cursor-pointer transition">
                        <Upload size={16} />
                        <span className="text-sm font-medium">Import</span>
                        <input
                            type="file"
                            hidden
                            onChange={(e) => handleUpload(e.target.files[0])}
                        />
                    </label>

                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow transition"
                    >
                        <Download size={16} />
                        <span className="text-sm font-medium">Export</span>
                    </button>

                    {/* Add Entry */}
                    <button
                        onClick={() => {
                            setSelectedEmployee(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow transition"
                    >
                        <Plus size={16} /> <span className="text-sm font-medium">Add Entry</span>
                    </button>

                </div>
            </div>

            {/* 📊 SUMMARY CARDS */}
            <div className="grid grid-cols-3 gap-4 p-4">
                <Card icon={<Users />} title="Total Employees" value={totalEmployees} />
                <Card icon={<CalendarDays />} title="Avg Working Days" value={avgWD} />
                <Card icon={<Clock />} title="Total OT Hours" value={totalOT} />
            </div>

            {/* 🔍 SEARCH */}
            <div className="flex items-center gap-4 ml-4 mt-2">
                {/* Search */}
                <div className="w-72">
                    <input
                        placeholder="Search by name or code..."
                        className={inputClass}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Month Filter */}
                <div className="w-60">
                    <Select
                        options={monthOptions}
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        isClearable
                        placeholder="Filter by Month"
                    />
                </div>
            </div>

            {/* 📊 TABLE */}
            <div className="border mt-5 mx-auto max-w-xl md:max-w-5xl xl:min-w-5xl 2xl:min-w-full overflow-auto border-gray-200 rounded-lg max-h-[58vh]">
                <table className="w-full text-xs border-collapse">

                    {/* HEADER */}
                    <thead className="bg-gray-100 sticky top-0">
                        <tr className="text-center text-gray-600 text-xs uppercase tracking-wide">
                            <th className="p-3 border-x border-gray-200">S.No</th>
                            <th className="p-3 border-x border-gray-200">Employee</th>
                            <th className="p-3 border-x border-gray-200">Month</th>
                            <th className="p-3 border-x border-gray-200">Year</th>
                            <th className="p-3 border-x border-gray-200">Total Days</th>
                            <th className="p-3 border-x border-gray-200">WD</th>
                            <th className="p-3 border-x border-gray-200">WeekOff</th>
                            <th className="p-3 border-x border-gray-200">EL</th>
                            <th className="p-3 border-x border-gray-200">CL</th>
                            <th className="p-3 border-x border-gray-200">SL</th>
                            <th className="p-3 border-x border-gray-200">HD</th>
                            <th className="p-3 border-x border-gray-200">Machine</th>
                            <th className="p-3 border-x border-gray-200">Absent</th>
                            <th className="p-3 border-x border-gray-200">OT</th>
                            <th className="p-3 border-x border-gray-200">Payable</th>
                            <th className="p-3 border-x border-gray-200">Deduct</th>
                            <th className="p-3 border-x border-gray-200">Min</th>
                            <th className="p-3 border-x border-gray-200">Max</th>                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((emp, index) => (
                                <tr
                                    key={`${emp.employeeId}-${emp.month}-${emp.year}`}
                                    className={`text-center ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-blue-50 transition`}
                                >
                                    <td className="p-3 border-x border-gray-200">{index + 1}.</td>

                                    <td className="p-3 border-x border-gray-200 font-medium whitespace-nowrap">
                                        {emp.employeeName}
                                        <div className="text-xs text-gray-400">
                                            {emp.employeeCode}
                                        </div>
                                    </td>

                                    <td className="p-3 border-x border-gray-200">{emp.month}</td>
                                    <td className="p-3 border-x border-gray-200">{emp.year}</td>
                                    <td className="p-3 border-x border-gray-200">{emp.totalCalendarDays}</td>

                                    <td className="p-3 border-x border-gray-200">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                                            {emp.rawWD}
                                        </span>
                                    </td>

                                    <td className="p-3 border-x border-gray-200">{emp.weekOffDays}</td>
                                    <td className="p-3 border-x border-gray-200">{emp.el}</td>
                                    <td className="p-3 border-x border-gray-200">{emp.cl}</td>
                                    <td className="p-3 border-x border-gray-200">{emp.sl}</td>
                                    <td className="p-3 border-x border-gray-200">{emp.hd}</td>

                                    <td className="p-3 border-x border-gray-200">{emp.machineDays}</td>

                                    <td className="p-3 border-x border-gray-200 text-red-500 font-medium">
                                        {emp.rawAbsentDays}
                                    </td>

                                    <td className="p-3 border-x border-gray-200 text-purple-600 font-medium">
                                        {emp.rawOTHours}
                                    </td>

                                    <td className="p-3 border-x border-gray-200">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
                                            {emp.rawPayableDays}
                                        </span>
                                    </td>

                                    <td className="p-3 border-x border-gray-200 text-yellow-600 font-medium">
                                        {emp.suggestedDaysToDeduct}
                                    </td>

                                    <td className="p-3 border-x border-gray-200">{emp.minDaysToDeduct}</td>
                                    <td className="p-3 border-x border-gray-200">{emp.maxDaysToDeduct}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="18" className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">

                                        {/* Icon */}
                                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                                            <Search size={24} />
                                        </div>

                                        {/* Text */}
                                        <p className="text-sm font-medium">
                                            No attendance data found
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            Try adjusting search or filters
                                        </p>

                                        {/* Reset Button */}
                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setSelectedMonth(null);
                                            }}
                                            className="mt-3 px-4 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>



            {/* 🧾 MODAL */}
            {showModal && (
                <AttendanceTestManualForm
                    data={selectedEmployee}
                    onClose={() => setShowModal(false)}
                    onRefresh={fetchData}
                />
            )}
        </div>
    );
};

export default AttendanceTestManual;

// 🔹 Card Component
const Card = ({ icon, title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
        <div className="bg-gray-100 p-2 rounded">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-lg font-bold">{value}</h3>
        </div>
    </div>
);