import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import EmployeeOtPermissionForm from "./EmployeeOtPermissionForm";
import assets from "../../../../../assets/assets";

const employeeCache = {};

export default function EmployeeOtPermission() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch employee name with cache
  const fetchEmployeeName = async (id) => {
    if (!id) return "";
    if (employeeCache[id]) return employeeCache[id];

    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res?.data?.data;
      const finalName = `${emp?.fullName || ""} ${
        emp?.employeeCode ? `(${emp.employeeCode})` : ""
      }`;
      employeeCache[id] = finalName;
      return finalName;
    } catch {
      employeeCache[id] = "Unknown";
      return "Unknown";
    }
  };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/EmployeeOTPermission/all");
      const list = res?.data?.data ?? [];
      const enriched = await Promise.all(
        list.map(async (p) => ({
          ...p,
          employeeName: await fetchEmployeeName(p.employeeId),
        })),
      );
      setPermissions(enriched);
    } catch {
      toast.error("Failed to fetch OT permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const filtered = permissions.filter((p) =>
    p.employeeName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white min-h-screen">
      {/* HEADER */}

      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        <h2 className="font-semibold text-xl">Employee OT Permissions</h2>

        <div className="relative flex gap-2 w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-1 w-full rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 cursor-pointer text-sm transition"
          >
            <FiPlus /> Add
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-xl overflow-x-auto p-4">
        <table className="min-w-full text-xs text-center border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3">S.No</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Allowed</th>
              <th className="px-4 py-3">Max OT</th>
              <th className="px-4 py-3">Start After (min)</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-gray-500 font-medium">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <img
                    src={assets.NoData}
                    alt="No Data"
                    className="w-64 mx-auto mb-3"
                  />
                  No OT Permissions Found
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{idx + 1}.</td>
                  <td className="px-4 py-2">{row.employeeName}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.isAllowed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.isAllowed ? "Allowed" : "Not Allowed"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{row.maxOTHoursPerDay} hr.</td>
                  <td className="px-4 py-2">{row.startAfterMinutes} min</td>
                  <td className="px-4 py-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditData(row);
                        setShowForm(true);
                      }}
                      className="flex items-center gap-1 text-blue-600 cursor-pointer bg-blue-50 px-2 py-1 rounded-lg text-xs hover:bg-blue-100 transition"
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <EmployeeOtPermissionForm
          initialData={editData}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchPermissions();
          }}
        />
      )}
    </div>
  );
}
