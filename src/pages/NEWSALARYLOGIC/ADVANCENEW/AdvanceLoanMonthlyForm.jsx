import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaPlus, FaTrash } from "react-icons/fa";
import { X } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const AdvanceLoanMonthlyForm = ({ employees, onClose, onSuccess }) => {
    const [employeeId, setEmployeeId] = useState(null);
    const [installments, setInstallments] = useState([
        { dueDate: "", installmentAmount: "" },
    ]);

    /* ================= EMPLOYEE OPTIONS ================= */
    const employeeOptions = employees.map((emp) => ({
        value: emp.id,
        label: `${emp.fullName}(${emp.employeeCode})`,
    }));

    /* ================= INSTALLMENT CHANGE ================= */
    const handleChange = (index, field, value) => {
        const updated = [...installments];
        updated[index][field] = value;
        setInstallments(updated);
    };

    /* ================= ADD INSTALLMENT ================= */
    const addInstallment = () => {
        setInstallments([
            ...installments,
            { dueDate: "", installmentAmount: "" },
        ]);
    };

    /* ================= REMOVE INSTALLMENT ================= */
    const removeInstallment = (index) => {
        const updated = installments.filter((_, i) => i !== index);
        setInstallments(updated);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!employeeId) {
            toast.error("Please select employee");
            return;
        }

        try {
            await axiosInstance.post(
                "/AdvancePayment/create-loan-repayment",
                {
                    employeeId: employeeId.value,
                    installments,
                }
            );

            toast.success("Loan repayment created successfully");
            onSuccess?.();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create repayment");
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-[750px] rounded-lg shadow-xl flex flex-col">

                {/* ================= HEADER ================= */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

                    <h2 className="text-lg font-semibold text-gray-800">
                        Create Loan Repayment
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ================= BODY ================= */}
                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-6 max-h-[500px] overflow-y-auto"
                >
                    {/* Employee */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Employee
                        </label>

                        <Select
                            options={employeeOptions}
                            value={employeeId}
                            onChange={setEmployeeId}
                            placeholder="Search employee name or code..."
                            className="text-sm"
                            isSearchable
                        />
                    </div>

                    {/* Installments */}
                    <div>

                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-gray-700">
                                Installments
                            </h3>

                            <button
                                type="button"
                                onClick={addInstallment}
                                className="flex items-center gap-2 text-sm bg-primary cursor-pointer text-white px-3 py-1.5 rounded"
                            >
                                <FaPlus size={12} />
                                Add Row
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">

                            <table className="w-full text-sm">

                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="text-left p-2">Due Date</th>
                                        <th className="text-left p-2">Installment Amount</th>
                                        <th className="text-center p-2 w-[60px]">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {installments.map((item, index) => (
                                        <tr key={index} className="border-t border-gray-200">

                                            <td className="p-2">
                                                <input
                                                    type="date"
                                                    value={item.dueDate}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            index,
                                                            "dueDate",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={inputClass}
                                                    required
                                                />
                                            </td>

                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={item.installmentAmount}
                                                    placeholder="Enter amount"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            index,
                                                            "installmentAmount",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className={inputClass}
                                                    required
                                                />
                                            </td>

                                            <td className="p-2 text-center">
                                                {installments.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeInstallment(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>

                    </div>

                </form>

                {/* ================= FOOTER ================= */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm cursor-pointer border border-gray-200 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm cursor-pointer bg-primary text-white rounded hover:bg-secondary"
                    >
                        Save Repayment
                    </button>

                </div>

            </div>

        </div>
    );
};

export default AdvanceLoanMonthlyForm;