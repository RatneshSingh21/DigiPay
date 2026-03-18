import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import AdvanceLoanMonthlyForm from "./AdvanceLoanMonthlyForm";
import Select from "react-select";
import { Plus, User, Calendar, X } from "lucide-react";
import { toast } from "react-toastify";

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

const AdvanceLoanMonthly = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [repayments, setRepayments] = useState([]);
    const [showModal, setShowModal] = useState(false);

    /* ================= FETCH EMPLOYEES ================= */
    const fetchEmployees = async () => {
        try {
            const res = await axiosInstance.get("/Employee");
            setEmployees(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= FETCH ALL REPAYMENTS ================= */
    const fetchRepayments = async () => {
        try {
            const res = await axiosInstance.get("/AdvancePayment/loan-repayments");

            console.log("Loan Repayments:", res.data);

            setRepayments(res?.data?.data || []);
        } catch (err) {
            console.error(err);
            // toast.error("Failed to fetch repayments");
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchRepayments();
    }, []);

    /* ================= EMPLOYEE OPTIONS ================= */
    const employeeOptions = employees.map((emp) => ({
        value: emp.id,
        label: `${emp.fullName}(${emp.employeeCode})`,
    }));

    /* ================= FILTERED DATA ================= */
    const filteredRepayments = repayments.filter((r) => {
        const matchEmployee = selectedEmployee
            ? r.employeeId === selectedEmployee.value
            : true;

        const matchMonth = selectedMonth
            ? r.deductionMonth === selectedMonth.value
            : true;

        return matchEmployee && matchMonth;
    });

    const getMonthName = (month) =>
        new Date(0, month - 1).toLocaleString("default", { month: "long" });

    return (
        <div className="space-y-4">

            {/* ================= HEADER ================= */}
            <div className="bg-white border-b p-4 border-gray-200 flex justify-between items-center">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Advance Loan Monthly
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage employee advance loan monthly repayments
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    <div className="flex flex-wrap items-center gap-2">

                        {selectedEmployee && (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                                <User size={14} />
                                {selectedEmployee.label}

                                <button
                                    onClick={() => setSelectedEmployee(null)}
                                    className="ml-1 hover:text-blue-900 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {selectedMonth && (
                            <div className="flex items-center gap-2  bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                                <Calendar size={14} />
                                {selectedMonth.label}

                                <button
                                    onClick={() => setSelectedMonth(null)}
                                    className="ml-1 hover:text-purple-900 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {(selectedEmployee || selectedMonth) && (
                            <button
                                onClick={() => {
                                    setSelectedEmployee(null);
                                    setSelectedMonth(null);
                                }}
                                className="flex items-center gap-1.5 cursor-pointer bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:bg-red-100 transition"
                            >
                                <X size={14} />
                                Clear Filters
                            </button>
                        )}

                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary cursor-pointer text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
                    >
                        <Plus size={16} />
                        Create Loan Repayment
                    </button>

                </div>
            </div>

            {/* ================= EMPLOYEE SELECT ================= */}
            <div className="px-5 flex flex-col md:flex-row gap-4 max-w-2xl">

                {/* Employee Select */}
                <div className="flex-1">
                    <label className="flex items-center gap-1 text-sm font-medium mb-1">
                        <User size={14} /> Select Employee
                    </label>

                    <Select
                        options={employeeOptions}
                        value={selectedEmployee}
                        onChange={setSelectedEmployee}
                        placeholder="Search employee..."
                        isClearable
                    />
                </div>

                {/* Month Select */}
                <div className="flex-1">
                    <label className="flex items-center gap-1 text-sm font-medium mb-1">
                        <Calendar size={14} /> Select Month
                    </label>

                    <Select
                        options={monthOptions}
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        placeholder="Select month..."
                        isClearable
                    />
                </div>

            </div>

            {/* ================= TABLE ================= */}
            <div className="mx-5 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">

                        <thead className="bg-gray-100 text-gray-600">
                            <tr className="text-center">
                                <th className="p-3">S.No.</th>
                                <th className="p-3">Employee</th>
                                <th className="p-3">Month</th>
                                <th className="p-3">Year</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Created On</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRepayments.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">

                                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                <Calendar size={28} className="text-gray-400" />
                                            </div>

                                            <p className="text-sm font-medium text-gray-600">
                                                No repayment records found
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                Try adjusting your filters or create a new repayment
                                            </p>

                                            {(selectedEmployee || selectedMonth) && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmployee(null);
                                                        setSelectedMonth(null);
                                                    }}
                                                    className="mt-5 flex items-center gap-1.5 cursor-pointer bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:bg-red-100 transition"
                                                >
                                                    <X size={14} />
                                                    Clear Filters
                                                </button>
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRepayments.map((item, index) => {

                                    const emp = employees.find((e) => e.id === item.employeeId);

                                    return (
                                        <tr key={item.id} className="border-t text-xs border-gray-400 text-center">

                                            <td className="p-3">{index + 1}.</td>

                                            <td className="p-3">
                                                {emp ? `${emp.fullName}(${emp.employeeCode})` : "-"}
                                            </td>

                                            <td className="p-3">
                                                {getMonthName(item.deductionMonth)}
                                            </td>

                                            <td className="p-3">
                                                {item.deductionYear}
                                            </td>

                                            <td className="p-3 font-medium text-green-600">
                                                ₹ {item.amount}
                                            </td>

                                            <td className="p-3">
                                                {new Date(item.createdOn).toLocaleDateString("en-GB")}
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* ================= MODAL ================= */}
            {showModal && (
                <AdvanceLoanMonthlyForm
                    employees={employees}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchRepayments();   // refresh table
                    }}
                />
            )}

        </div>
    );
};

export default AdvanceLoanMonthly;