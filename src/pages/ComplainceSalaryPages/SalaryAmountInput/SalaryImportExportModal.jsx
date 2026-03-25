import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X, Upload, Download, FileText } from "lucide-react";


const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const primaryBtn =
    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition";

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

const SalaryImportExportModal = ({ onClose }) => {
    const [mode, setMode] = useState("import"); // 🔥 NEW

    const [month, setMonth] = useState(
        MONTH_OPTIONS[new Date().getMonth()]
    );
    const [year, setYear] = useState(
        YEAR_OPTIONS.find((y) => y.value === currentYear)
    );

    const [salaryRunId, setSalaryRunId] = useState(0);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Auto SalaryRunId
    useEffect(() => {
        if (month && year) {
            const runId = `${year.value}${String(month.value).padStart(2, "0")}`;
            setSalaryRunId(Number(runId));
        }
    }, [month, year]);

    // 🔼 IMPORT
    const handleImport = async () => {
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            await axiosInstance.post(
                `/salary-amount-input/import/${salaryRunId}?month=${month.value}&year=${year.value}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success("File imported successfully!");
            onClose();
        } catch {
            toast.error("Import failed");
        } finally {
            setLoading(false);
        }
    };

    // 🔽 EXPORT
    const handleExport = async () => {
        try {
            const res = await axiosInstance.get(
                `/salary-amount-input/export/${salaryRunId}?month=${month.value}&year=${year.value}`,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute(
                "download",
                `Salary_${salaryRunId}_${month.value}_${year.value}.xlsx`
            );

            document.body.appendChild(link);
            link.click();

            toast.success("File downloaded!");
        } catch (err) {
            // 🔥 IMPORTANT PART
            if (err.response) {
                try {
                    // Convert blob error → JSON
                    const text = await err.response.data.text();
                    const errorJson = JSON.parse(text);

                    toast.error(errorJson.message || "Export failed");
                } catch {
                    toast.error("Export failed");
                }
            } else {
                toast.error("Network error");
            }
        }


    };

    // 📄 TEMPLATE DOWNLOAD
    const handleTemplateDownload = async () => {
        try {
            const res = await axiosInstance.get(
                `/salary-amount-input/template/${salaryRunId}?month=${month.value}&year=${year.value}`,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute(
                "download",
                `Salary_Template_${salaryRunId}_${month.value}_${year.value}.xlsx`
            );

            document.body.appendChild(link);
            link.click();

            toast.success("Template downloaded!");
        } catch (err) {
            if (err.response) {
                try {
                    const text = await err.response.data.text();
                    const errorJson = JSON.parse(text);
                    toast.error(errorJson.message || "Template download failed");
                } catch {
                    toast.error("Template download failed");
                }
            } else {
                toast.error("Network error");
            }
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">
                        Import / Export Salary
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-md bg-gray-100 hover:bg-red-100 cursor-pointer hover:text-red-500 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 🔥 MODE SWITCH */}
                <div className="flex gap-2 px-4 pt-3">
                    <button
                        onClick={() => setMode("import")}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition cursor-pointer ${mode === "import"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                            }`}
                    >
                        Import
                    </button>

                    <button
                        onClick={() => setMode("export")}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition cursor-pointer ${mode === "export"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                            }`}
                    >
                        Export
                    </button>
                </div>

                {/* BODY */}
                <div className="p-4 space-y-3">

                    {/* Month & Year */}
                    <div className="grid grid-cols-2 gap-2">
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
                    </div>

                    {/* SalaryRunId */}
                    <div>
                        <label className="text-sm font-medium">Salary Run ID</label>
                        <input
                            type="number"
                            value={salaryRunId}
                            onChange={(e) => setSalaryRunId(Number(e.target.value))}
                            className={inputClass}
                        />
                    </div>

                    {/* 🔥 FILE ONLY FOR IMPORT */}
                    {mode === "import" && (
                        <div>
                            <label className="text-sm font-medium">
                                Upload Excel File
                            </label>

                            <div className="mt-1 border border-dashed border-gray-300 rounded-md p-3 text-center hover:border-blue-400 transition">
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Upload .xlsx file
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">

                    {mode === "export" ? (
                        <>
                            {/* 📄 TEMPLATE BUTTON */}
                            <button
                                onClick={handleTemplateDownload}
                                className="flex items-center gap-1 cursor-pointer px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                            >
                                <FileText size={16} />
                                Template
                            </button>

                            {/* 📥 EXPORT DATA */}
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1 cursor-pointer px-4 py-2 rounded bg-primary text-white hover:bg-secondary"
                            >
                                <Download size={16} />
                                Export Data
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleImport}
                            className="flex items-center gap-1 cursor-pointer px-4 py-2 rounded bg-primary text-white hover:bg-secondary"
                        >
                            <Upload size={16} />
                            {loading ? "Importing..." : "Import"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalaryImportExportModal;