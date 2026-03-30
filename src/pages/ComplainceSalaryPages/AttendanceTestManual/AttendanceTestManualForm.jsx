import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";
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
        "&:hover": {
            borderColor: "#3b82f6",
        },
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: "180px",
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

const AttendanceTestManualForm = ({ data, onClose, onRefresh }) => {
    const [form, setForm] = useState(data || {});
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            const res = await axiosInstance.get("/Employee");
            setEmployees(res.data || []);
        };
        fetchEmployees();
    }, []);

    // 🔥 Employee dropdown (name + code)
    const employeeOptions = employees.map((emp) => ({
        value: emp.id,
        label: `${emp.fullName} (${emp.employeeCode})`,
        name: emp.fullName,
        code: emp.employeeCode,
    }));

    useEffect(() => {
        if (form.month && form.year) {
            const days = new Date(form.year, form.month, 0).getDate();
            setForm((prev) => ({
                ...prev,
                totalCalendarDays: days,
            }));
        }
    }, [form.month, form.year]);

    const handleSubmit = async () => {
        try {
            await axiosInstance.post("/PayrollAttendance/preview/manual", form);
            onRefresh();
            onClose();
        } catch {
            alert("Failed to save");
        }
    };

    const isDisabled = !form.employeeId || !form.month || !form.year;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">

            <div className="bg-white w-[850px] rounded-2xl shadow-2xl overflow-hidden">

                {/* 🔥 HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-blue-50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Manual Attendance Entry
                        </h2>
                        <p className="text-xs text-gray-500">
                            Fill employee monthly attendance details
                        </p>
                    </div>
                    <X onClick={onClose} className="cursor-pointer text-gray-500 hover:text-black" />
                </div>

                {/* 📦 BODY */}
                <div className="p-6 space-y-2 max-h-[70vh] overflow-y-auto">

                    {/* 👤 Employee */}
                    <Section title="Employee Info">
                        <label className="label">Employee</label>
                        <Select
                            options={employeeOptions}
                            value={employeeOptions.find(e => e.value === form.employeeId) || null}
                            onChange={(opt) =>
                                setForm({
                                    ...form,
                                    employeeId: opt.value,
                                    employeeName: opt.name,
                                    employeeCode: opt.code,
                                })
                            }
                            placeholder="Search employee by name or code..."
                            className="mt-1 text-sm"
                            styles={selectStyles}
                        />
                        <Hint text="Select the employee for this attendance record" />
                    </Section>

                    {/* 📅 Month Year */}
                    <Section title="Period">
                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    Month <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={MONTH_OPTIONS}
                                    value={MONTH_OPTIONS.find(m => m.value === form.month) || null}
                                    onChange={(opt) =>
                                        setForm({ ...form, month: opt?.value })
                                    }
                                    placeholder="Select month..."
                                    className="mt-1 text-sm"
                                    styles={selectStyles}
                                />
                                <Hint text="Select the attendance month" />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={YEAR_OPTIONS}
                                    value={YEAR_OPTIONS.find(y => y.value === form.year) || null}
                                    onChange={(opt) =>
                                        setForm({ ...form, year: opt?.value })
                                    }
                                    placeholder="Select year..."
                                    className="mt-1 text-sm"
                                    styles={selectStyles}
                                />
                                <Hint text="Select the payroll year" />
                            </div>

                        </div>
                    </Section>

                    {/* 📊 Attendance */}
                    <Section title="Attendance Details">
                        <div className="grid grid-cols-4 gap-4">
                            <Input label="Total Days" value={form.totalCalendarDays} onChange={(v) => setForm({ ...form, totalCalendarDays: v })} />
                            <Input label="Working Days" value={form.rawWD} onChange={(v) => setForm({ ...form, rawWD: v })} />
                            <Input label="Week Off" value={form.weekOffDays} onChange={(v) => setForm({ ...form, weekOffDays: v })} />
                            <Input label="Machine Days" value={form.machineDays} onChange={(v) => setForm({ ...form, machineDays: v })} />
                        </div>
                    </Section>

                    {/* 📊 Leaves */}
                    <Section title="Leaves">
                        <div className="grid grid-cols-4 gap-4">
                            <Input label="EL" hint="Earned Leave" value={form.el} onChange={(v) => setForm({ ...form, el: v })} />
                            <Input label="CL" hint="Casual Leave" value={form.cl} onChange={(v) => setForm({ ...form, cl: v })} />
                            <Input label="SL" hint="Sick Leave" value={form.sl} onChange={(v) => setForm({ ...form, sl: v })} />
                            <Input label="HD" hint="Half Days" value={form.hd} onChange={(v) => setForm({ ...form, hd: v })} />
                        </div>
                    </Section>

                    {/* 📊 Payroll */}
                    <Section title="Payroll Calculation">
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Absent Days" hint="Auto/manual absent" value={form.rawAbsentDays} onChange={(v) => setForm({ ...form, rawAbsentDays: v })} />
                            <Input label="OT Hours" hint="Overtime hours" value={form.rawOTHours} onChange={(v) => setForm({ ...form, rawOTHours: v })} />
                            <Input label="Payable Days" hint="Final payable days" value={form.rawPayableDays} onChange={(v) => setForm({ ...form, rawPayableDays: v })} />
                        </div>
                    </Section>

                    {/* 📊 Deduction */}
                    <Section title="Deduction Rules">
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Deduct Days" hint="Suggested deduction" value={form.suggestedDaysToDeduct} onChange={(v) => setForm({ ...form, suggestedDaysToDeduct: v })} />
                            <Input label="Min Deduct" hint="Minimum allowed" value={form.minDaysToDeduct} onChange={(v) => setForm({ ...form, minDaysToDeduct: v })} />
                            <Input label="Max Deduct" hint="Maximum allowed" value={form.maxDaysToDeduct} onChange={(v) => setForm({ ...form, maxDaysToDeduct: v })} />
                        </div>
                    </Section>

                </div>

                {/* ⚡ FOOTER */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-400">
                        Fields marked are required for payroll processing
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 cursor-pointer rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={isDisabled}
                            onClick={handleSubmit}
                            className={`px-5 py-2 rounded-md text-white shadow ${isDisabled
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-primary hover:bg-secondary cursor-pointer"
                                }`}
                        >
                            Save Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTestManualForm;





// 🔹 Section Wrapper
const Section = ({ title, children }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        {children}
    </div>
);

// 🔹 Input
const Input = ({ label, value, onChange, hint }) => (
    <div>
        <label className="text-xs font-medium text-gray-600">
            {label}
        </label>

        <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} text-sm`}
        />

        {hint && (
            <p className="text-[11px] text-gray-400 mt-1 leading-tight">
                {hint}
            </p>
        )}
    </div>
);

// 🔹 Hint
const Hint = ({ text }) => (
    <p className="text-[10px] text-gray-400 mt-1">{text}</p>
);