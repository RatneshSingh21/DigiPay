import React, { useEffect, useState } from "react";
import { Plus, Upload, Download, Edit, Trash2 } from "lucide-react";
import Spinner from "../../../../../../components/Spinner";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";
import EmployeeWeekendPolicyMappingForm from "./EmployeeWeekendPolicyMappingForm";
import ConfirmModal from "../../../../../../components/ConfirmModal";

const EmployeeWeekendPolicyMapping = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    /* ================= FETCH DATA ================= */
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                "/EmployeeWeekendPolicyMapping/get/all"
            );

            const mappings = res.data?.data || [];

            const formatted = mappings.map((item) => ({
                mappingId: item.mappingId,
                employeeId: item.employeeId,
                weekendPolicyId: item.weekendPolicyId,
                employeeName: `${item.employeeName} (${item.employeeCode})`,
                weekendPolicyName: item.weekendPolicyName || `Policy ID ${item.weekendPolicyId}`,
                effectiveFrom: item.effectiveFrom?.split("T")[0],
                effectiveTo: item.effectiveTo?.split("T")[0],
            }));
            setData(formatted);
        } catch (err) {
            console.error("Error fetching weekend mappings", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    /* ================= DELETE ================= */
    const confirmDelete = async () => {
        if (!deleteId) return;

        setDeleteLoading(true);
        try {
            await axiosInstance.delete(
                `/EmployeeWeekendPolicyMapping/delete/${deleteId}`
            );

            setConfirmOpen(false);
            setDeleteId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(false);
        }
    };

    /* ================= EXPORT ================= */
    const handleExport = async () => {
        try {
            const res = await axiosInstance.get(
                "/EmployeeWeekendPolicyMapping/export",
                { responseType: "blob" }
            );

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "EmployeeWeekendPolicyMappings.xlsx";
            link.click();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= IMPORT ================= */
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await axiosInstance.post(
                "/EmployeeWeekendPolicyMapping/import",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            fetchData();
        } catch (err) {
            console.error(err);
        }
    };


    /* ================= SEARCH ================= */
    const filteredData = data.filter(
        (item) =>
            item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.weekendPolicyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center p-2 shadow rounded-md gap-2">
                <h2 className="text-sm font-bold text-gray-800">
                    Employee Weekend Policy Mapping
                </h2>

                <div className="flex flex-col md:flex-row gap-2">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search employee or policy"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border px-3 py-1.5 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                    />

                    {/* Export */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium cursor-pointer rounded-md border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200"
                    >
                        <Download size={16} />
                        Export
                    </button>

                    {/* Import */}
                    <label className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all duration-200 cursor-pointer">
                        <Upload size={16} />
                        Import
                        <input
                            type="file"
                            accept=".xlsx"
                            hidden
                            onChange={handleImport}
                        />
                    </label>

                    {/* Assign */}
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium cursor-pointer rounded-md bg-primary text-white hover:bg-secondary transition-all duration-200 shadow-sm"
                    >
                        <Plus size={16} />
                        Assign Policy
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-700 text-center">
                        <tr>
                            <th className="px-3 py-2 border">S.No</th>
                            <th className="px-3 py-2 border">Employee</th>
                            <th className="px-3 py-2 border">Weekend Policy</th>
                            <th className="px-3 py-2 border">From</th>
                            <th className="px-3 py-2 border">To</th>
                            <th className="px-3 py-2 border">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    No mappings found
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item.mappingId}>
                                    <td className="border text-center py-2">{index + 1}</td>
                                    <td className="border text-center">{item.employeeName}</td>
                                    <td className="border text-center">
                                        {item.weekendPolicyName}
                                    </td>
                                    <td className="border text-center">
                                        {new Date(item.effectiveFrom).toLocaleDateString(
                                            "en-Gb",
                                        )}
                                    </td>
                                    <td className="border text-center">
                                        {new Date(item.effectiveTo).toLocaleDateString(
                                            "en-Gb",
                                        )}
                                    </td>

                                    <td className="border text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* Edit */}
                                            <button
                                                onClick={() => {
                                                    setSelectedMapping(item);
                                                    setModalOpen(true);
                                                }}
                                                className="flex items-center gap-1 cursor-pointer px-2 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDeleteClick(item.mappingId)}
                                                className="flex items-center gap-1 cursor-pointer px-2 py-1 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <EmployeeWeekendPolicyMappingForm
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedMapping(null);
                    }}
                    onSuccess={fetchData}
                    editData={selectedMapping} // KEY
                />
            )}

            {confirmOpen && (
                <ConfirmModal
                    title="Delete Mapping"
                    message="This will permanently remove the weekend policy mapping. Are you sure?"
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setConfirmOpen(false);
                        setDeleteId(null);
                    }}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
};

export default EmployeeWeekendPolicyMapping;