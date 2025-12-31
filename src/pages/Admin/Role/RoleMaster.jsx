import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";
import Select from "react-select";

const ROLE_OPTIONS = [
  { value: "Admin", label: "Admin" },
  { value: "User", label: "User" },
  { value: "Hod", label: "HOD" },
  { value: "Manager", label: "Manager" },
  { value: "SuperAdmin", label: "Super Admin" },
];

const RoleMaster = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/RoleList/getall");
      if (Array.isArray(res.data)) {
        setRoles(res.data);
      } else {
        toast.error("Unexpected API response");
      }
    } catch {
      toast.error("Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roleName || !formData.description.trim()) {
      toast.error("Both fields are required!");
      return;
    }

    // 🔐 Check if role already exists (case-insensitive)
    const roleExists = roles.some(
      (r) => r.roleName.toLowerCase() === formData.roleName.toLowerCase()
    );

    if (roleExists) {
      toast.warn(`Role "${formData.roleName}" already exists!`);
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/RoleList/create", {
        roleName: formData.roleName.trim(),
        description: formData.description.trim(),
      });

      toast.success("Role added successfully!");
      setFormData({ roleName: "", description: "" });
      fetchRoles();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding role.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Role Master</h2>
      </div>

      {/* Add Role Form */}
      <div className="bg-white w-fit shadow-lg rounded-xl p-6 mb-3 flex flex-col items-center mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Add New Role
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-1 gap-3"
        >
          <Select
            options={ROLE_OPTIONS}
            placeholder="Select Role"
            value={ROLE_OPTIONS.find((opt) => opt.value === formData.roleName)}
            onChange={(selected) =>
              setFormData({
                ...formData,
                roleName: selected.value,
              })
            }
            isClearable={false}
            className="w-72"
            classNamePrefix="react-select"
          />

          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            minLength={3}
            className="w-72 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className={`w-72 flex items-center justify-center px-4 py-2 cursor-pointer rounded-lg shadow text-white transition ${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {submitting ? <Spinner /> : "Add Role"}
          </button>
        </form>
      </div>

      {/* Role List */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Existing Roles
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="overflow-x-auto shadow">
            <table className="min-w-full divide-y text-xs divide-gray-200 text-center">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2">S NO.</th>
                  <th className="p-2">Role Name</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Created By</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => (
                  <tr key={role.roleID} className="hover:bg-gray-50">
                    <td className="p-2">{idx + 1}.</td>
                    <td className="p-2">{role.roleName}</td>
                    <td className="p-2">{role.description}</td>
                    <td className="p-2">{role.createdBy || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {roles.length === 0 && (
              <p className="text-gray-500 text-center py-4">No roles found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleMaster;
