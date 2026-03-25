import React, { useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X, Download, FileSpreadsheet } from "lucide-react";

const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const ActualSalaryImportExportModal = ({ onClose }) => {
    const [salaryRunId, setSalaryRunId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (!salaryRunId) {
            toast.error("Please enter Salary Run ID");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `/ActualSalary/export/${salaryRunId}`,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute(
                "download",
                `ActualSalary_${salaryRunId}.xlsx`
            );

            document.body.appendChild(link);
            link.click();

            toast.success("File downloaded successfully!");
        } catch (err) {
            if (err.response) {
                try {
                    const text = await err.response.data.text();
                    const errorJson = JSON.parse(text);
                    toast.error(errorJson.message || "Export failed");
                } catch {
                    toast.error("Export failed");
                }
            } else {
                toast.error("Network error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileSpreadsheet size={18} />
                        Export Actual Salary
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-md bg-gray-100 hover:bg-red-100 cursor-pointer hover:text-red-500 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-4 space-y-3">

                    {/* SalaryRunId */}
                    <div>
                        <label className="text-sm font-medium">
                            Salary Run ID
                        </label>
                        <input
                            type="number"
                            placeholder="Enter SalaryRunID (e.g. 202603)"
                            value={salaryRunId}
                            onChange={(e) => setSalaryRunId(e.target.value)}
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Format: <strong>YYYYMM</strong> (e.g., 202603 for March 2026)
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded bg-primary text-white hover:bg-secondary disabled:opacity-50"
                    >
                        <Download size={16} />
                        {loading ? "Exporting..." : "Export"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActualSalaryImportExportModal;