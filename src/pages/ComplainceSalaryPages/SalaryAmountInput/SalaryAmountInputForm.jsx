import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "36px",
        fontSize: "13px",
        borderColor: "#d1d5db",
        boxShadow: "none",
        "&:hover": { borderColor: "#3b82f6" },
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({ ...base, maxHeight: "180px" }),
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

const SalaryAmountInputForm = ({ onClose }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [month, setMonth] = useState(
        MONTH_OPTIONS[new Date().getMonth()]
    );
    const [year, setYear] = useState(
        YEAR_OPTIONS.find((y) => y.value === currentYear)
    );

    const [salaryRunId, setSalaryRunId] = useState(0);

    const [actualAmountPaid, setActualAmountPaid] = useState("");
    const [complianceAmountPaid, setComplianceAmountPaid] = useState("");

    const [loading, setLoading] = useState(false);

    // ─── Fetch Employees ─────────────────────────
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await axiosInstance.get("/Employee");
                setEmployees(
                    res.data.map((emp) => ({
                        value: emp.id,
                        label: `${emp.fullName} (${emp.employeeCode})`,
                    }))
                );
            } catch {
                toast.error("Failed to fetch employees");
            }
        };
        fetchEmployees();
    }, []);

    // ─── Auto SalaryRunId ─────────────────────────
    useEffect(() => {
        if (month && year) {
            const runId = `${year.value}${String(month.value).padStart(2, "0")}`;
            setSalaryRunId(Number(runId));
        }
    }, [month, year]);

    // ─── Submit ─────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEmployee || !salaryRunId) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post("/salary-amount-input/process", {
                employeeId: selectedEmployee.value,
                month: month.value,
                year: year.value,
                salaryRunId,
                actualAmountPaid: Number(actualAmountPaid),
                complianceAmountPaid: Number(complianceAmountPaid),
            });

            toast.success("Salary amount processed successfully!");
            onClose?.();
        } catch (error) {
            toast.error("Failed to process salary amount");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Salary Amount Input
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <form className="px-6 py-4 space-y-2" onSubmit={handleSubmit}>

                    {/* Employee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee
                        </label>
                        <Select
                            options={employees}
                            value={selectedEmployee}
                            onChange={setSelectedEmployee}
                            placeholder="Select Employee"
                            styles={selectStyles}
                        />
                    </div>

                    {/* Month & Year */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Month
                            </label>
                            <Select
                                value={month}
                                onChange={setMonth}
                                options={MONTH_OPTIONS}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Year
                            </label>
                            <Select
                                value={year}
                                onChange={setYear}
                                options={YEAR_OPTIONS}
                                styles={selectStyles}
                            />
                        </div>
                    </div>

                    {/* Salary Run ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salary Run ID
                        </label>
                        <input
                            type="number"
                            value={salaryRunId}
                            onChange={(e) => setSalaryRunId(Number(e.target.value))}
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Format <strong>YYYYMM</strong>, auto-generated
                        </p>
                    </div>

                    {/* Actual Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Actual Amount Paid
                        </label>
                        <input
                            type="number"
                            value={actualAmountPaid}
                            onChange={(e) => setActualAmountPaid(e.target.value)}
                            className={inputClass}
                            placeholder="Enter actual amount"
                        />
                    </div>

                    {/* Compliance Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Compliance Amount Paid
                        </label>
                        <input
                            type="number"
                            value={complianceAmountPaid}
                            onChange={(e) => setComplianceAmountPaid(e.target.value)}
                            className={inputClass}
                            placeholder="Enter compliance amount"
                        />
                    </div>
                </form>

                {/* FOOTER */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-200 text-sm gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedEmployee}
                        className="px-4 py-2 rounded bg-primary text-white hover:bg-secondary disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Process"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalaryAmountInputForm;