import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";
import { toast } from "react-toastify";
import { X, AlertCircle } from "lucide-react";

const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

// ─── OPTIONS ─────────────────────────────

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

// ─── MAIN ─────────────────────────────

const AttendanceManipulationForm = ({ data = {}, onClose, onSuccess }) => {
    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
        employeeId: data.employeeId || "",
        month: data.month || "",
        year: data.year || "",
        salaryRunId: 0,
        daysToDeduct: data.daysDeducted || 0,
        complianceOTHours: data.otHours || 0,
        otCapHours: data.excessOTHours || 0,
    });

    // 🔹 Fetch Employees
    useEffect(() => {
        const fetchEmployees = async () => {
            const res = await axiosInstance.get("/Employee");
            setEmployees(res.data || []);
        };
        fetchEmployees();
    }, []);

    const employeeOptions =
        employees?.map((emp) => ({
            value: emp.id,
            label: `${emp.fullName} (${emp.employeeCode})`,
        })) || [];

    const set = (key, val) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    // 🔹 Submit
    const handleSubmit = async () => {
        try {
            await axiosInstance.post("/PayrollAttendance/process", form);
            toast.success("Attendance processed successfully");
            onSuccess();
            onClose();
        } catch {
            toast.error("Failed to process attendance");
        }
    };

    const isDisabled =
        !form.employeeId || !form.month || !form.year;

    useEffect(() => {
        if (form.month && form.year) {
            const runId = `${form.year}${String(form.month).padStart(2, "0")}`;

            setForm((prev) => ({
                ...prev,
                salaryRunId: Number(runId),
            }));
        }
    }, [form.month, form.year]);

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white w-[750px] rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Attendance Adjustment
                        </h2>
                        <p className="text-xs text-gray-500">
                            Modify payroll-impacting values before processing
                        </p>
                    </div>
                    <X onClick={onClose} className="cursor-pointer" />
                </div>

                {/* BODY */}
                <div className="p-6 space-y-5 overflow-y-auto">

                    {/* EMPLOYEE + PERIOD */}
                    <Section title="👤 Employee & Period">
                        <div className="grid grid-cols-3 gap-4">

                            <DropField
                                label="Employee"
                                required
                                options={employeeOptions}
                                value={employeeOptions.find(
                                    (e) => e.value === form.employeeId
                                ) || null}
                                onChange={(opt) => set("employeeId", opt?.value || "")}
                            />

                            <DropField
                                label="Month"
                                required
                                options={MONTH_OPTIONS}
                                value={MONTH_OPTIONS.find(
                                    (m) => m.value === form.month
                                ) || null}
                                onChange={(opt) => set("month", opt?.value || "")}
                            />

                            <DropField
                                label="Year"
                                required
                                options={YEAR_OPTIONS}
                                value={YEAR_OPTIONS.find(
                                    (y) => y.value === form.year
                                ) || null}
                                onChange={(opt) => set("year", opt?.value || "")}
                            />

                        </div>
                    </Section>

                    {/* PAYROLL CONTROL */}
                    <Section title="⚙️ Payroll Control">
                        <Field
                            label="Salary Run ID"
                            value={form.salaryRunId}
                            onChange={(v) => set("salaryRunId", v)}
                            hint="Enter a common salary run ID for this payroll cycle. Typically in YYYYMM format (e.g., 202603 for March 2026)"
                        />
                    </Section>

                    {/* ADJUSTMENTS */}
                    <Section title="✂️ Adjustments">
                        <div className="grid grid-cols-3 gap-4">

                            <Field
                                label="Days to Deduct"
                                value={form.daysToDeduct}
                                onChange={(v) => set("daysToDeduct", v)}
                                hint="Deduct from payable days"
                            />

                            <Field
                                label="Compliance OT Hours"
                                value={form.complianceOTHours}
                                onChange={(v) => set("complianceOTHours", v)}
                                hint="Approved overtime"
                            />

                            <Field
                                label="OT Cap Hours"
                                value={form.otCapHours}
                                onChange={(v) => set("otCapHours", v)}
                                hint="Max allowed OT after cap"
                            />

                        </div>

                        {/* INFO BOX */}
                        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-3">
                            <AlertCircle size={14} />
                            These values override system-generated payroll calculations.
                        </div>
                    </Section>

                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-400">
                        Required fields must be filled
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 cursor-pointer rounded-md text-sm hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={isDisabled}
                            onClick={handleSubmit}
                            className={`px-5 py-2 rounded-md text-white text-sm ${isDisabled
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-primary hover:bg-secondary cursor-pointer"
                                }`}
                        >
                            Process Payroll
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AttendanceManipulationForm;

// ─── SUB COMPONENTS ─────────────────────────────

const Section = ({ title, children }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        {children}
    </div>
);

const Field = ({ label, value, onChange, hint }) => (
    <div>
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
        />
        {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
);

const DropField = ({ label, options, value, onChange, hint, required }) => (
    <div>
        <label className="text-xs font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>

        <Select
            options={options}
            value={value}
            onChange={onChange}
            className="mt-1 text-sm"
            menuPlacement="auto"
            styles={{
                control: (base) => ({
                    ...base,
                    minHeight: "36px",
                    fontSize: "13px",
                }),
                menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                }),
            }}
        />

        {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
);