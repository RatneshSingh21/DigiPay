import React, { useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";

const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
];

const SalaryCalculateGenerateAllDefaultForm = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axiosInstance.post(
                "/SalaryEngine/generate-all",
                form
            );

            toast.success(res.data?.message || "All salaries generated successfully!");

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to generate salary");
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
                >
                    <FiX size={20} />
                </button>

                <h2 className="text-lg font-semibold mb-5 text-center text-gray-800">
                    Generate All Salaries(Default)
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Month</label>

                        <Select
                            options={months}
                            value={months.find((m) => m.value === Number(form.month))}
                            onChange={(selected) =>
                                setForm((prev) => ({
                                    ...prev,
                                    month: selected?.value || "",
                                }))
                            }
                            className="text-sm"
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                            type="number"
                            name="year"
                            value={form.year}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 cursor-pointer rounded-lg text-sm hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-5 py-2 bg-primary cursor-pointer hover:bg-secondary text-white rounded-lg text-sm"
                        >
                            Generate All
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalaryCalculateGenerateAllDefaultForm;
