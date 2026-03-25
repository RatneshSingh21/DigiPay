import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X, Plus, Trash2 } from "lucide-react";

const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const primaryBtn =
    "flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition";

const dangerBtn =
    "flex items-center justify-center cursor-pointer p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition";

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "36px",
        fontSize: "13px",
        borderColor: "#d1d5db",
        boxShadow: "none",
        "&:hover": { borderColor: "#3b82f6" },
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999, // VERY IMPORTANT
    }),
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

const SalaryAmountBulkForm = ({ onClose }) => {
    const [employees, setEmployees] = useState([]);

    const [rows, setRows] = useState([
        { employee: null, actualAmountPaid: "", complianceAmountPaid: "" },
    ]);

    const [month, setMonth] = useState(MONTH_OPTIONS[new Date().getMonth()]);
    const [year, setYear] = useState(
        YEAR_OPTIONS.find((y) => y.value === currentYear)
    );

    const [salaryRunId, setSalaryRunId] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch Employees
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

    // Auto SalaryRunId
    useEffect(() => {
        if (month && year) {
            const runId = `${year.value}${String(month.value).padStart(2, "0")}`;
            setSalaryRunId(Number(runId));
        }
    }, [month, year]);

    // ADD ROW
    const addRow = () => {
        setRows([
            ...rows,
            { employee: null, actualAmountPaid: "", complianceAmountPaid: "" },
        ]);
    };

    // REMOVE ROW
    const removeRow = (index) => {
        if (rows.length === 1) return;
        const updated = [...rows];
        updated.splice(index, 1);
        setRows(updated);
    };

    // HANDLE CHANGE
    const handleChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };

    // SUBMIT
    const handleSubmit = async () => {
        const validRows = rows.filter((r) => r.employee);

        if (!validRows.length) {
            toast.error("Add at least one employee");
            return;
        }

        const payload = {
            salaryRunId,
            month: month.value,
            year: year.value,
            employees: validRows.map((r) => ({
                employeeId: r.employee.value,
                actualAmountPaid: Number(r.actualAmountPaid || 0),
                complianceAmountPaid: Number(r.complianceAmountPaid || 0),
            })),
        };

        setLoading(true);
        try {
            await axiosInstance.post(
                "/salary-amount-input/bulk-SalaryAmount",
                payload
            );

            toast.success("Bulk salary submitted!");
            onClose();
        } catch {
            toast.error("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Bulk Salary Entry</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md bg-gray-100 hover:bg-red-100 hover:text-red-500 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">

                    {/* TOP */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium">Month</label>
                            <Select
                                value={month}
                                onChange={setMonth}
                                options={MONTH_OPTIONS}
                                styles={selectStyles}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Year</label>
                            <Select
                                value={year}
                                onChange={setYear}
                                options={YEAR_OPTIONS}
                                styles={selectStyles}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Salary Run ID</label>
                            <input
                                type="number"
                                value={salaryRunId}
                                onChange={(e) => setSalaryRunId(Number(e.target.value))}
                                className={inputClass}
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Format <strong>YYYYMM</strong> (auto-generated, editable)
                            </p>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-center">S.No</th>
                                    <th className="p-2 text-center">Employee</th>
                                    <th className="p-2">Actual Amount</th>
                                    <th className="p-2">Compliance Amount</th>
                                    <th className="p-2">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index} className="border-t border-gray-200">
                                        <td className="p-2 text-center">
                                            {index + 1}.
                                        </td>

                                        {/* EMPLOYEE SELECT */}
                                        <td className="p-2 w-1/2">
                                            <Select
                                                options={employees}
                                                value={row.employee}
                                                onChange={(val) =>
                                                    handleChange(index, "employee", val)
                                                }
                                                placeholder="Select Employee"
                                                styles={selectStyles}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </td>

                                        {/* ACTUAL */}
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={row.actualAmountPaid}
                                                onChange={(e) =>
                                                    handleChange(index, "actualAmountPaid", e.target.value)
                                                }
                                                className={inputClass}
                                            />
                                        </td>

                                        {/* COMPLIANCE */}
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={row.complianceAmountPaid}
                                                onChange={(e) =>
                                                    handleChange(index, "complianceAmountPaid", e.target.value)
                                                }
                                                className={inputClass}
                                            />
                                        </td>

                                        {/* ACTION */}
                                        <td className="p-2 text-center">
                                            <button onClick={() => removeRow(index)} className={dangerBtn}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ADD ROW */}
                        <div className="p-2 border-t border-gray-200">
                            <button onClick={addRow} className={primaryBtn}>
                                <Plus size={16} />
                                Add Employee
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                    <button onClick={onClose} className="border border-gray-200 cursor-pointer px-4 py-2 rounded">
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="bg-primary text-white px-4 py-2 cursor-pointer rounded"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalaryAmountBulkForm;