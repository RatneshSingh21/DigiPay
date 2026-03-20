import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Select from "react-select";
import Pagination from "../../../../components/Pagination";

const compactSelectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "30px",
        height: "30px",
        fontSize: "12px",
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0 6px",
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: "30px",
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: "4px",
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: "4px",
    }),
};

const MonthlyAttendanceReport = () => {
    const [data, setData] = useState([]);

    const [companyName, setCompanyName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPageData, setPerPageData] = useState(10);

    const today = new Date();
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [month, setMonth] = useState(prevMonthDate.getMonth() + 1);
    const [year, setYear] = useState(prevMonthDate.getFullYear());

    useEffect(() => {
        fetchAttendance();
    }, [month, year]);

    const inputClass =
        "w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(0, i).toLocaleString("default", { month: "long" }),
    }));

    const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map((y) => ({
        value: y,
        label: y.toString(),
    }));

    const fetchAttendance = async () => {
        try {
            const res = await axiosInstance.get(
                "/AttendanceRecord/monthly-attendance-report",
                {
                    params: { month, year },
                }
            );

            setData(res.data.data);
            setCompanyName(res.data.companyName);

        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    const formatLeaves = (leaveBreakdown) => {
        if (!leaveBreakdown || Object.keys(leaveBreakdown).length === 0)
            return "-";

        return Object.entries(leaveBreakdown)
            .map(([key, val]) => `${key}:${val}`)
            .join(", ");
    };

    const filteredData = data.filter((item) => {
        const term = searchTerm.toLowerCase();

        return (
            item.employeeName?.toLowerCase().includes(term) ||
            item.employeeCode?.toLowerCase().includes(term)
        );
    });
    const totalDataLength = filteredData.length;
    const totalPages = Math.ceil(totalDataLength / perPageData);

    const indexOfLast = currentPage * perPageData;
    const indexOfFirst = indexOfLast - perPageData;

    const currentTableData = filteredData.slice(indexOfFirst, indexOfLast);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, month, year]);

    return (
        <div className="p-6">
            <h2 className="text-center text-xl font-semibold mb-4">
                {companyName || "Company"} • Monthly Attendance Report
                <span className="block text-sm text-gray-500 mt-1">
                    {monthOptions.find(m => m.value === month)?.label} {year}
                </span>
            </h2>

            <div className="flex justify-end items-center gap-2 mb-3 flex-wrap">

                {/* 🔍 Search */}
                <div className="w-[200px]">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Month */}
                <div className="w-[140px]">
                    <Select
                        options={monthOptions}
                        value={monthOptions.find((m) => m.value === month)}
                        onChange={(selected) => setMonth(selected.value)}
                        placeholder="Month"
                        styles={compactSelectStyles}
                    />
                </div>

                {/* Year */}
                <div className="w-[100px]">
                    <Select
                        options={yearOptions}
                        value={yearOptions.find((y) => y.value === year)}
                        onChange={(selected) => setYear(selected.value)}
                        placeholder="Year"
                        styles={compactSelectStyles}
                    />
                </div>

            </div>

            <div className="overflow-x-auto border border-gray-400 rounded-lg">
                <table className="min-w-full text-[11px] border-collapse">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th className="p-1.5 border border-gray-200">S.No</th>
                            <th className="p-1.5 border border-gray-200">Emp Code</th>
                            <th className="p-1.5 border border-gray-200">Employee Name</th>
                            <th className="p-1.5 border border-gray-200">Department</th>
                            <th className="p-1.5 border border-gray-200">Total Days</th>
                            <th className="p-1.5 border border-gray-200">Present</th>
                            <th className="p-1.5 border border-gray-200">Absent</th>
                            <th className="p-1.5 border border-gray-200">Weekend</th>
                            <th className="p-1.5 border border-gray-200">Holiday</th>
                            <th className="p-1.5 border border-gray-200">Leaves</th>
                            <th className="p-1.5 border border-gray-200">SandwichLeave</th>
                            <th className="p-1.5 border border-gray-200">Half Day</th>
                            <th className="p-1.5 border border-gray-200">Extra Day</th>
                            <th className="p-1.5 border border-gray-200">OT Hours</th>
                            <th className="p-1.5 border border-gray-200">Payable Days</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentTableData.map((item, index) => (
                            <tr key={index} className="even:bg-gray-100 hover:bg-gray-200 ">
                                <td className="p-1.5 border border-gray-400 text-center">{indexOfFirst + index + 1}.</td>
                                <td className="p-1.5 border-gray-400 border">{item.employeeCode}</td>
                                <td className="p-1.5 border-gray-400 border">{item.employeeName}</td>
                                <td className="p-1.5 border-gray-400 border">{item.departmentName}</td>
                                <td className="p-1.5 border-gray-400 border text-center">
                                    {item.monthTotalDays}
                                </td>
                                <td className="p-1.5 border border-gray-400 text-center">{item.present}</td>
                                <td className="p-1.5 border border-gray-400 text-center">{item.absent}</td>
                                <td className="p-1.5 border border-gray-400 text-center">{item.weekends}</td>
                                <td className="p-1.5 border border-gray-400 text-center">{item.holidays}</td>
                                <td className="p-1.5 border border-gray-400 text-center">
                                    {formatLeaves(item.leaveBreakdown)}
                                </td>
                                <td className="p-1.5 border border-gray-400 text-center">
                                    {item.sandwichLeave}
                                </td>
                                <td className="p-1.5 border border-gray-400 text-center">
                                    {item.halfDays}
                                </td>
                                <td className="p-1.5 border border-gray-400 text-center">
                                    {item.extraDayPresent}
                                </td>
                                <td className="p-1.5 border border-gray-400 text-center">
                                    {item.otHours?.toFixed(1.5)}
                                </td>
                                <td className="p-1.5 border border-gray-400 text-center">
                                    {item.payableDays}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
                perPageData={perPageData}
                setPerPageData={setPerPageData}
                filteredData={filteredData}
                totalDataLength={totalDataLength}
            />
        </div>
    );
};

export default MonthlyAttendanceReport;