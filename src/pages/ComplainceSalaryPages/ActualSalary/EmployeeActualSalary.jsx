import React, { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    ChevronDown,
    ChevronUp,
    IndianRupee,
    ShieldCheck,
    ShieldOff,
    Calendar,
    Upload,
    Users,
} from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import EmployeeActualSalaryModal from "./EmployeeActualSalaryModel";
import ActualSalaryImportExport from "./ActualSalaryImportExport";

const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

/* REUSABLE PILL */
const Pill = ({ children, variant = "default" }) => {
    const styles = {
        success: "bg-green-100 text-green-700",
        danger: "bg-red-100 text-red-700",
        warning: "bg-yellow-100 text-yellow-700",
        default: "bg-gray-100 text-gray-600",
        primary: "bg-blue-100 text-blue-700",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}
        >
            {children}
        </span>
    );
};

const EmployeeActualSalary = () => {
    const [data, setData] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [showImportExport, setShowImportExport] = useState(false);
    const [search, setSearch] = useState("");


    const fetchSalary = async () => {
        try {
            const res = await axiosInstance.get("/EmployeeActualSalary");
            setData(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSalary();
    }, []);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const filteredData = data.filter((item) => {
        const name = item.employeeName?.toLowerCase() || "";
        const code = item.employeeCode?.toLowerCase() || "";

        return (
            name.includes(search.toLowerCase()) ||
            code.includes(search.toLowerCase())
        );
    });

    return (
        <div className="space-y-4">
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="px-8 py-2.5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Employee Actual Salary
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage salary structure, compliance, and working rules
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3 mt-2 md:mt-0">

                        {/* 🔍 SEARCH INPUT */}
                        <div className="w-64">
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* BUTTONS */}
                        <button
                            onClick={() => {
                                setEditData(null);
                                setOpenModal(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-sm text-white rounded-lg shadow-sm transition cursor-pointer"
                        >
                            <Plus size={18} />
                            Add Salary
                        </button>

                        <button
                            onClick={() => setShowImportExport(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-white font-semibold cursor-pointer transition"
                        >
                            <Upload size={16} />
                            Import / Export
                        </button>
                    </div>

                </div>
            </div>



            {/* TABLE */}
            <div className="bg-white m-4 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">

                    {/* HEADER */}
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                        <tr>
                            <th className="p-4"></th>
                            <th className="p-4">S.No.</th>
                            <th className="p-4 text-left">Employee</th>
                            <th className="p-4">Salary</th>
                            <th className="p-4">Compliance</th>
                            <th className="p-4">Effective</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    {/* 🔹 MAIN ROW */}
                                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition">
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleRow(item.id)}
                                                className="p-2 rounded-lg cursor-pointer hover:bg-gray-200"
                                            >
                                                {expandedRow === item.id ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                            </button>
                                        </td>

                                        <td className="p-4 text-center">{index + 1}.</td>

                                        <td className="p-4">
                                            <div className="font-semibold text-gray-800">
                                                {item.employeeName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.employeeCode}
                                            </div>
                                        </td>

                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1 font-semibold text-gray-800">
                                                    <IndianRupee size={14} />
                                                    {item.grossSalary}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Basic: ₹ {item.basicSalary}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                {item.isPFApplicable ? (
                                                    <Pill variant="success">
                                                        <ShieldCheck size={12} className="inline mr-1" />
                                                        PF
                                                    </Pill>
                                                ) : (
                                                    <Pill variant="default">
                                                        <ShieldOff size={12} className="inline mr-1" />
                                                        PF
                                                    </Pill>
                                                )}

                                                {item.isESIApplicable ? (
                                                    <Pill variant="primary">ESI</Pill>
                                                ) : (
                                                    <Pill variant="default">ESI</Pill>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                                <Calendar size={14} />
                                                {new Date(item.effectiveFrom).toLocaleDateString("en-Gb")}
                                            </div>
                                        </td>

                                        <td className="p-4 flex justify-center">
                                            <button
                                                onClick={() => {
                                                    setEditData(item);
                                                    setOpenModal(true);
                                                }}
                                                className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>

                                    {/* 🔥 EXPANDED SECTION */}
                                    {expandedRow === item.id && (
                                        <tr className="bg-gray-50 border-t border-gray-200">
                                            <td colSpan="7" className="p-5">
                                                <div className="grid grid-cols-4 gap-6 text-sm">

                                                    {/* SALARY */}
                                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                        <h3 className="font-semibold mb-2 text-gray-700">
                                                            Salary
                                                        </h3>
                                                        <p>HRA: ₹ {item.hra}</p>
                                                        <p>DA: ₹ {item.dearnessAllowance}</p>
                                                        <p>Special: ₹ {item.specialAllowance}</p>
                                                        <p>Bonus: ₹ {item.bonus}</p>
                                                    </div>

                                                    {/* PF */}
                                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                        <h3 className="font-semibold mb-2 text-gray-700">
                                                            PF / ESI
                                                        </h3>
                                                        <p>PF No: {item.pfNumber || "-"}</p>
                                                        <p>PF Base: ₹ {item.pfBaseSalary}</p>
                                                        <p>ESI No: {item.esiNumber || "-"}</p>
                                                    </div>

                                                    {/* WORK */}
                                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                        <h3 className="font-semibold mb-2 text-gray-700">
                                                            Work
                                                        </h3>
                                                        <p>Days: {item.workingDaysPerMonth}</p>
                                                        <p>Hours: {item.workingHoursPerDay}</p>
                                                        <p>OT: {item.otMultiplier}x</p>
                                                        <p>Rate: ₹ {item.overtimeRate}</p>
                                                    </div>

                                                    {/* META */}
                                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                        <h3 className="font-semibold mb-2 text-gray-700">
                                                            System
                                                        </h3>
                                                        <p>
                                                            Created:{" "}
                                                            {new Date(item.createdAt).toLocaleDateString("en-Gb")}
                                                        </p>
                                                        <p>
                                                            Updated:{" "}
                                                            {item.updatedAt
                                                                ? new Date(item.updatedAt).toLocaleDateString("en-Gb")
                                                                : "-"}
                                                        </p>
                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-16">
                                    <div className="flex flex-col items-center justify-center text-gray-500">

                                        {/* ICON */}
                                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                                            <Users size={28} />
                                        </div>

                                        {/* TEXT */}
                                        <p className="text-sm font-medium">
                                            {search
                                                ? "No matching employees found"
                                                : "No salary records available"}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {search
                                                ? "Try a different name or employee code"
                                                : "Start by adding employee salary data"}
                                        </p>

                                        {/* ACTION */}
                                        {search ? (
                                            <button
                                                onClick={() => setSearch("")}
                                                className="mt-3 px-4 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-secondary cursor-pointer"
                                            >
                                                Clear Search
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditData(null);
                                                    setOpenModal(true);
                                                }}
                                                className="mt-3 px-4 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-secondary"
                                            >
                                                Add First Salary
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {openModal && (
                <EmployeeActualSalaryModal
                    onClose={() => setOpenModal(false)}
                    onSuccess={fetchSalary}
                    editData={editData}
                />
            )}

            {showImportExport && (
                <ActualSalaryImportExport onClose={() => setShowImportExport(false)} />
            )}
        </div>
    );
};

export default EmployeeActualSalary;