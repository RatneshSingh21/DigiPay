// EmployeeOtPermission.jsx
import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import EmployeeOtPermissionForm from "./EmployeeOtPermissionForm";
import assets from "../../../../../assets/assets";

// GLOBAL CACHE — survives re-renders
const employeeCache = {};

export default function EmployeeOtPermission() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch employee name + code
  const fetchEmployeeName = async (id) => {
    if (!id) return "";

    // return from cache
    if (employeeCache[id]) return employeeCache[id];

    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res?.data?.data;

      const fullName = emp?.fullName || "";
      const code = emp?.employeeCode || "";

      const finalName = `${fullName} (${code})`;

      employeeCache[id] = finalName; // store in cache
      return finalName;
    } catch (error) {
      console.log("Employee fetch error:", error);
      employeeCache[id] = "Unknown";
      return "Unknown";
    }
  };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/EmployeeOTPermission/all");
      const list = res?.data?.data ?? [];

      // enrich rows with employee name + code
      const enriched = await Promise.all(
        list.map(async (p) => ({
          ...p,
          employeeName: await fetchEmployeeName(p.employeeId),
        }))
      );

      setPermissions(enriched);
    } catch (err) {
      console.error(err);
      // toast.error("Failed to load OT permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const openCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setShowForm(true);
  };

  const toggleAllowed = async (row) => {
    try {
      const payload = {
        employeeId: row.employeeId,
        isAllowed: !row.isAllowed,
        maxOTHoursPerDay: row.maxOTHoursPerDay ?? 0,
      };

      await axiosInstance.post("/EmployeeOTPermission/createOrUpdate", payload);

      toast.success(
        `${row.employeeName || "Employee"} OT ${
          payload.isAllowed ? "allowed" : "disallowed"
        }`
      );

      fetchPermissions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update permission");
    }
  };

  const filtered = permissions.filter((p) =>
    (p.employeeName || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <>
      {/* HEADER */}
      <div className="sticky top-14 bg-white shadow-sm px-4 py-2 mb-2 flex justify-between items-center z-10">
        <h2 className="text-xl font-semibold text-gray-800">
          Employee OT Permissions
        </h2>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-blue-400 outline-none rounded px-2 py-1 text-sm"
          />

          <button
            onClick={openCreate}
            className="flex items-center cursor-pointer text-xs gap-2 px-3 py-2 bg-primary text-white rounded"
          >
            <FiPlus /> Add
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2">S.No</th>
              <th className="px-3 py-2">Employee Name</th>
              <th className="px-3 py-2">Allowed</th>
              <th className="px-3 py-2">Max OT / day</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <img
                      src={assets.NoData}
                      alt="No Data Found"
                      className="w-64 mb-2 opacity-90"
                    />

                    <h3 className="text-lg font-semibold text-gray-800">
                      {search
                        ? "No Matching Employees"
                        : "No OT Permissions Configured"}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 max-w-md">
                      {search
                        ? "Try adjusting your search or clear the filter to see all employees."
                        : "Overtime permissions have not been configured yet. Add a permission to allow employees to work overtime."}
                    </p>

                    <div className="mt-6 flex gap-3">
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
                        >
                          Clear Search
                        </button>
                      )}

                      <button
                        onClick={openCreate}
                        className="px-4 py-2 rounded bg-primary cursor-pointer text-white text-sm hover:bg-secondary"
                      >
                        <FiPlus className="inline mr-1" />
                        Add OT Permission
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{idx + 1}</td>

                  <td className="px-3 py-2 font-medium">{row.employeeName}</td>

                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleAllowed(row)}
                      className={`px-2 py-1 rounded text-xs ${
                        row.isAllowed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.isAllowed ? "Allowed" : "Not allowed"}
                    </button>
                  </td>

                  <td className="px-3 py-2">{row.maxOTHoursPerDay ?? "—"}</td>

                  <td className="px-3 py-2 flex justify-center">
                    <button
                      onClick={() => openEdit(row)}
                      className="flex items-center gap-1 text-blue-600 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 cursor-pointer"
                    >
                      <FiEdit2 size={16} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <EmployeeOtPermissionForm
          initialData={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditData(null);
            fetchPermissions();
          }}
        />
      )}
    </>
  );
}
