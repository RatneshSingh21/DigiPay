import React, { useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X, Upload, Download, FileSpreadsheet } from "lucide-react";

const ActualSalaryImportExport = ({ onClose }) => {
    const [mode, setMode] = useState("import"); // import | export
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

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
                `/EmployeeActualSalary/import`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success("File imported successfully!");
            onClose();
        } catch (err) {
            toast.error("Import failed");
        } finally {
            setLoading(false);
        }
    };

    // 🔽 EXPORT
    const handleExport = async () => {
        try {
            const res = await axiosInstance.get(
                `/EmployeeActualSalary/export`,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute(
                "download",
                `EmployeeActualSalary.xlsx`
            );

            document.body.appendChild(link);
            link.click();

            toast.success("File downloaded!");
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
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileSpreadsheet size={18} />
                        Employee Salary Import / Export
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-md bg-gray-100 hover:bg-red-100 cursor-pointer hover:text-red-500 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* MODE SWITCH */}
                <div className="flex gap-2 px-4 pt-3">
                    <button
                        onClick={() => setMode("import")}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                            mode === "import"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        Import
                    </button>

                    <button
                        onClick={() => setMode("export")}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                            mode === "export"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        Export
                    </button>
                </div>

                {/* BODY */}
                <div className="p-4 space-y-3">

                    {/* FILE INPUT ONLY FOR IMPORT */}
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

                    {/* EXPORT INFO */}
                    {mode === "export" && (
                        <div className="text-sm text-gray-500 text-center py-4">
                            Click export to download all employee salary data.
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">

                    {mode === "export" ? (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded bg-primary text-white hover:bg-secondary"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    ) : (
                        <button
                            onClick={handleImport}
                            className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded bg-primary text-white hover:bg-secondary"
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

export default ActualSalaryImportExport;