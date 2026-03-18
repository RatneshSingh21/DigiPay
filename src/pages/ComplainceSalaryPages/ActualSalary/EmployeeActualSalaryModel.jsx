import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { X, Save } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";

const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


const labelClass = "text-sm font-medium text-gray-700 mb-1";
const hintClass = "text-xs text-gray-400 mt-1";

const Section = ({ title, children }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="text-md font-semibold text-gray-700 mb-4">{title}</h3>
        {children}
    </div>
);

const Field = ({ label, name, value, onChange, type = "text", hint, readOnly = false }) => (
    <div>
        <label className={labelClass}>{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`${inputClass} ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
        {hint && <p className={hintClass}>{hint}</p>}
    </div>
);

const Toggle = ({ label, name, checked, onChange }) => (
    <label className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 cursor-pointer">
        <span className="text-sm text-gray-700">{label}</span>
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="accent-primary w-4 h-4"
        />
    </label>
);

const EmployeeActualSalaryModal = ({ onClose, onSuccess, editData }) => {
    const [employees, setEmployees] = useState([]);


    const isEdit = !!editData;

    const [form, setForm] = useState({
        employeeId: "",
        employeeCode: "",
        employeeName: "",
        basicSalary: 0,
        dearnessAllowance: 0,
        hra: 0,
        conveyanceAllowance: 0,
        medicalAllowance: 0,
        specialAllowance: 0,
        fixedAllowance: 0,
        otherAllowance: 0,
        bonus: 0,
        pfBaseSalary: 0,
        isPFApplicable: true,
        pfNumber: "",
        isESIApplicable: true,
        esiNumber: "",
        workingDaysPerMonth: 26,
        workingHoursPerDay: 8,
        otMultiplier: 1,
        ctc: 0,
        effectiveFrom: "",
    });

    useEffect(() => {
        if (editData) {
            setForm({
                ...editData,
                effectiveFrom: editData.effectiveFrom?.split("T")[0],
            });
        }
    }, [editData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let updatedForm = {
            ...form,
            [name]: type === "checkbox" ? checked : value,
        };

        // Clear PF fields when disabled
        if (name === "isPFApplicable" && !checked) {
            updatedForm.pfNumber = "";
            updatedForm.pfBaseSalary = 0;
        }

        // Clear ESI fields when disabled
        if (name === "isESIApplicable" && !checked) {
            updatedForm.esiNumber = "";
        }

        setForm(updatedForm);
    };

    const handleSubmit = async () => {
        try {
            if (isEdit) {
                await axiosInstance.put(
                    `/EmployeeActualSalary/${editData.id}`,
                    form
                );
                toast.success("Salary updated successfully");
            } else {
                await axiosInstance.post("/EmployeeActualSalary", form);
                toast.success("Salary created successfully");
            }

            onSuccess();
            onClose();
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axiosInstance.get("/Employee");
            setEmployees(res.data);
        } catch (err) {
            toast.error("Failed to load employees");
        }
    };

    const employeeOptions = employees.map(emp => ({
        value: emp.id,
        label: `${emp.fullName}(${emp.employeeCode})`,
        data: emp
    }));


    const handleEmployeeSelect = (selectedOption) => {
        if (!selectedOption) return;

        const emp = selectedOption.data;

        setForm(prev => ({
            ...prev,
            employeeId: emp.id,
            employeeCode: emp.employeeCode,
            employeeName: emp.fullName
        }));
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">

            <div className="bg-white max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-xl">
                {/* 🔷 HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Edit Employee Salary" : "Add Employee Salary"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Fill all salary details carefully for payroll processing
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg cursor-pointer hover:text-red-500 hover:bg-red-100"
                    >
                        <X />
                    </button>
                </div>

                {/* 🔷 BODY */}
                <div className="p-6 overflow-y-auto space-y-2">

                    {/* EMPLOYEE */}
                    <Section title="Employee Information">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Select Employee</label>
                                <Select
                                    options={employeeOptions}
                                    onChange={handleEmployeeSelect}
                                    value={employeeOptions.find(opt => opt.value === form.employeeId) || null}
                                    placeholder="Select employee..."
                                    isDisabled={isEdit}
                                />
                            </div>

                            {/* 🔒 Auto-filled fields */}
                            <Field
                                label="Employee Code"
                                name="employeeCode"
                                value={form.employeeCode}
                                readOnly
                            />

                            <Field
                                label="Employee Name"
                                name="employeeName"
                                value={form.employeeName}
                                readOnly
                            />

                        </div>
                    </Section>

                    {/* SALARY */}
                    <Section title="Salary Structure">
                        <div className="grid grid-cols-3 gap-4">
                            <Field label="Basic Salary" name="basicSalary" value={form.basicSalary} onChange={handleChange} hint="Core salary component" />
                            <Field label="HRA" name="hra" value={form.hra} onChange={handleChange} />
                            <Field label="Dearness Allowance (DA)" name="dearnessAllowance" value={form.dearnessAllowance} onChange={handleChange} />
                            <Field label="Conveyance Allowance" name="conveyanceAllowance" value={form.conveyanceAllowance} onChange={handleChange} />
                            <Field label="Medical Allowance" name="medicalAllowance" value={form.medicalAllowance} onChange={handleChange} />
                            <Field label="Special Allowance" name="specialAllowance" value={form.specialAllowance} onChange={handleChange} />
                            <Field label="Fixed Allowance" name="fixedAllowance" value={form.fixedAllowance} onChange={handleChange} />
                            <Field label="Other Allowance" name="otherAllowance" value={form.otherAllowance} onChange={handleChange} />
                            <Field label="Bonus" name="bonus" value={form.bonus} onChange={handleChange} />
                        </div>
                    </Section>

                    {/* PF & ESI */}
                    <Section title="Compliance (PF & ESI)">
                        <div className="grid grid-cols-3 gap-4">

                            {/* PF Toggle */}
                            <Toggle
                                label="PF Applicable"
                                name="isPFApplicable"
                                checked={form.isPFApplicable}
                                onChange={handleChange}
                            />

                            {/* Show ONLY if PF enabled */}
                            {form.isPFApplicable && (
                                <>
                                    <Field
                                        label="PF Number"
                                        name="pfNumber"
                                        value={form.pfNumber}
                                        onChange={handleChange}
                                        hint="Enter UAN / PF account number"
                                    />
                                    <Field
                                        label="PF Base Salary"
                                        name="pfBaseSalary"
                                        value={form.pfBaseSalary}
                                        onChange={handleChange}
                                        hint="Salary considered for PF deduction"
                                    />
                                </>
                            )}

                            {/* ESI Toggle */}
                            <Toggle
                                label="ESI Applicable"
                                name="isESIApplicable"
                                checked={form.isESIApplicable}
                                onChange={handleChange}
                            />

                            {/* Show ONLY if ESI enabled */}
                            {form.isESIApplicable && (
                                <Field
                                    label="ESI Number"
                                    name="esiNumber"
                                    value={form.esiNumber}
                                    onChange={handleChange}
                                    hint="Enter ESI registration number"
                                />
                            )}

                        </div>
                    </Section>

                    {/* WORK */}
                    <Section title="Work Configuration">
                        <div className="grid grid-cols-3 gap-4">
                            <Field label="Working Days / Month" name="workingDaysPerMonth" value={form.workingDaysPerMonth} onChange={handleChange} />
                            <Field label="Working Hours / Day" name="workingHoursPerDay" value={form.workingHoursPerDay} onChange={handleChange} />
                            <Field label="OT Multiplier" name="otMultiplier" value={form.otMultiplier} onChange={handleChange} hint="e.g. 1.5 for overtime" />
                        </div>
                    </Section>

                    {/* FINAL */}
                    <Section title="Final Details">
                        <div className="grid grid-cols-3 gap-4">
                            <Field label="CTC" name="ctc" value={form.ctc} onChange={handleChange} hint="Total cost to company" />
                            <Field type="date" label="Effective From" name="effectiveFrom" value={form.effectiveFrom} onChange={handleChange} />
                        </div>
                    </Section>
                </div>

                {/* 🔷 FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 bg-primary cursor-pointer text-white px-5 py-2 rounded-lg shadow hover:opacity-90"
                    >
                        <Save size={16} />
                        {isEdit ? "Update Salary" : "Save Salary"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EmployeeActualSalaryModal;