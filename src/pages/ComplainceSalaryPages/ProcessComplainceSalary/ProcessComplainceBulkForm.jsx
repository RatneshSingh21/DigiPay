import React, { useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import Select from "react-select";

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
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i).map((y) => ({
    value: y,
    label: String(y),
}));

const ProcessComplainceBulkForm = ({ onClose }) => {
    const [salaryRunId, setSalaryRunId] = useState("");
    const [month, setMonth] = useState(MONTH_OPTIONS[new Date().getMonth()]);
    const [year, setYear] = useState(YEAR_OPTIONS.find((y) => y.value === new Date().getFullYear()));
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!salaryRunId) {
            toast.error("Salary Run ID is required (Format: YYYYMM)");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post(
                `/ComplianceSalary/bulk/${salaryRunId}?month=${month.value}&year=${year.value}`
            );
            toast.success("Bulk compliance salary processed successfully!");
            onClose?.();
        } catch (error) {
            toast.error("Failed to process bulk compliance salary");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Process Bulk Compliance Salaries
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form className="px-6 py-4 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salary Run ID
                        </label>
                        <input
                            type="text"
                            placeholder="Format: YYYYMM"
                            value={salaryRunId}
                            onChange={(e) => setSalaryRunId(e.target.value)}
                            className={inputClass}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use the format <strong>YYYYMM</strong>. Example: <strong>202603</strong> for March 2026
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {/* Month Selector */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <Select
                                value={month}
                                onChange={setMonth}
                                options={MONTH_OPTIONS}
                                styles={selectStyles}
                                placeholder="Select Month"
                            />
                        </div>

                        {/* Year Selector */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <Select
                                value={year}
                                onChange={setYear}
                                options={YEAR_OPTIONS}
                                styles={selectStyles}
                                placeholder="Select Year"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        <strong>Provide month and year.</strong>
                    </p>
                </form>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-200 text-sm gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded cursor-pointer bg-primary text-white hover:bg-secondary disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Process Salary"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessComplainceBulkForm;