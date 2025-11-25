// EmployeeLeaveAllocation.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  FiPlus,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import EmployeeLeaveAllocationForm from "./EmployeeLeaveAllocationForm";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

export default function EmployeeLeaveAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [groupedAllocations, setGroupedAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fileInputRef = useRef(null);

  // Caches for API calls
  const employeeCache = useRef({});
  const leaveTypeCache = useRef({});

  // Fetch employee name
  const getEmployeeName = async (id) => {
    if (!id) return "";
    if (employeeCache.current[id]) return employeeCache.current[id];

    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const name = res.data?.data?.fullName || "Unknown";

      employeeCache.current[id] = name;
      return name;
    } catch {
      return "Unknown";
    }
  };

  // Fetch leave type name
  const getLeaveTypeName = async (id) => {
    if (!id) return "";
    if (leaveTypeCache.current[id]) return leaveTypeCache.current[id];

    try {
      const res = await axiosInstance.get(`/LeaveType/${id}`);
      const name = res.data.leaveName || "Unknown";
      leaveTypeCache.current[id] = name;
      return name;
    } catch {
      return "Unknown";
    }
  };

  // Fetch allocations
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/EmployeeLeaveAllocation");
      let data = res?.data?.data ?? res?.data ?? [];

      // Add names
      data = await Promise.all(
        data.map(async (row) => ({
          ...row,
          employeeName: await getEmployeeName(row.employeeId),
          leaveTypeName: await getLeaveTypeName(row.leaveTypeId),
        }))
      );

      setAllocations(data);

      // GROUP data
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.employeeId]) acc[item.employeeId] = [];
        acc[item.employeeId].push(item);
        return acc;
      }, {});

      const formatted = Object.entries(grouped).map(([empId, rows]) => ({
        empId,
        employeeName: rows[0].employeeName,
        rows,
        totalAllocations: rows.length,
      }));

      setGroupedAllocations(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch allocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const openCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setShowForm(true);
  };

  // EXPORT
  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(
        "/EmployeeLeaveAllocation/export",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "LeaveAllocations.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  // IMPORT
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosInstance.post("/EmployeeLeaveAllocation/import", formData);
      toast.success("Import successful");
      fetchAllocations();
    } catch {
      toast.error("Import failed");
    }
  };

  const handleDelete = async (allocationId) => {
    if (!window.confirm("Delete this allocation?")) return;
    try {
      await axiosInstance.delete(`/EmployeeLeaveAllocation/${allocationId}`);
      toast.success("Deleted successfully");
      fetchAllocations();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Search filter
  const filtered = groupedAllocations.filter((g) =>
    g.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER BAR */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        <h2 className="font-semibold text-xl">Employee Leave Allocations</h2>

        <div className="flex gap-2 items-center text-sm">
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />

          {/* IMPORT BUTTON */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 border rounded hover:bg-gray-100"
          >
            <FiUpload /> Import
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls"
            className="hidden"
          />

          {/* EXPORT BUTTON */}
          <button
            onClick={handleExport}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 border rounded hover:bg-gray-100"
          >
            <FiDownload /> Export
          </button>

          {/* ADD BUTTON */}
          <button
            onClick={openCreate}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-primary text-white rounded"
          >
            <FiPlus /> Add
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* GROUPED VIEW */}
        {filtered.map((group) => (
          <div
            key={group.empId}
            className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Header Row */}
            <div
              className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setExpandedId(expandedId === group.empId ? null : group.empId)
              }
            >
              <h3 className="font-medium text-gray-800">
                {group.employeeName}
              </h3>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-blue-600">
                  Total Allocations: {group.totalAllocations}
                </span>

                {expandedId === group.empId ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
            </div>

            {/* EXPANDED SECTION */}
            <div
              className={`transition-all overflow-hidden ${
                expandedId === group.empId ? "max-h-[600px]" : "max-h-0"
              }`}
            >
              <div className="p-4 border-t border-gray-100 bg-gray-50/40">
                <div className="overflow-x-auto max-h-[35vh] overflow-y-scroll">
                  <table className="min-w-full text-xs text-center border-t border-gray-100">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="px-3 py-2">Leave Type</th>
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">Taken</th>
                        <th className="px-3 py-2">Remaining</th>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {group.rows.map((row) => (
                        <tr
                          key={row.allocationId}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-3 py-2">{row.leaveTypeName}</td>
                          <td className="px-3 py-2">
                            {row.totalLeavesAllocated}
                          </td>
                          <td className="px-3 py-2">{row.leavesTaken}</td>
                          <td className="px-3 py-2">{row.leavesRemaining}</td>
                          <td className="px-3 py-2">{row.year}</td>

                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => openEdit(row)}
                                className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                              >
                                <FiEdit2 size={16} />
                              </button>

                              <button
                                onClick={() => handleDelete(row.allocationId)}
                                className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <EmployeeLeaveAllocationForm
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditData(null);
            fetchAllocations();
          }}
          initialData={editData}
        />
      )}
    </>
  );
}
