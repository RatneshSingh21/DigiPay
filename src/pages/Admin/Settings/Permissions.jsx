import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiDownload, FiUpload } from "react-icons/fi";
import Spinner from "../../../components/Spinner";

// Module list
const modules = [
  "Employee",
  "Salary",
  "Attendance",
  "Pay Schedule",
  "Permission",
  "Work Location",
  "Payroll Run",
];

// Replace with dynamic fetch from API in real scenario
const userOptions = [
  { value: "1", label: "Admin 1" },
  { value: "2", label: "Admin 2" },
];

const Permissions = () => {
  const [adminUserId, setAdminUserId] = useState("");
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDisabled = !adminUserId || saving;

  const handleCheckboxChange = (module, permKey) => {
    if (isDisabled) return;
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permKey]: !prev[module]?.[permKey],
        adminUserId: parseInt(adminUserId),
        moduleName: module,
      },
    }));
  };

  const fetchPermissions = async (id) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/Permission/admin/${id}`);
      const perms = {};
      res.data?.forEach((perm) => {
        perms[perm.moduleName] = perm;
      });
      setPermissions(perms);
    } catch (err) {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!adminUserId) return;

    try {
      setSaving(true);
      const payload = Object.values(permissions);
      for (let item of payload) {
        await axiosInstance.post("/Permission/set", item);
      }
      toast.success("Permissions updated!");

      // Reset form after save
      setAdminUserId("");
      setPermissions({});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (adminUserId) {
      fetchPermissions(adminUserId);
    } else {
      setPermissions({});
    }
  }, [adminUserId]);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 mb-5 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Permissions</h2>
        <div className="flex gap-2 items-center">
          <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
            <FiDownload />
            Import
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
            <FiUpload />
            Export
          </button>
        </div>
      </div>

      {/* Admin Select & Input */}
      <div className="flex items-center gap-4 py-2 px-5 flex-wrap">
        <div className="w-64">
          <Select
            options={userOptions}
            placeholder="Select Admin"
            value={userOptions.find((u) => u.value === adminUserId) || null}
            onChange={(selected) => setAdminUserId(selected?.value || "")}
            isClearable
            isDisabled={saving}
          />
        </div>
        <span className="text-gray-400 font-medium">or</span>
        <input
          type="number"
          placeholder="Enter Admin ID"
          className="w-60 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={adminUserId}
          onChange={(e) => setAdminUserId(e.target.value)}
          disabled={saving}
          autoFocus
        />
      </div>

      {/* Permissions Table */}
      <div className="overflow-x-auto bg-white p-5 rounded-lg mt-4">
        {loading ? (
          <p className="text-center py-10 text-gray-500">
            Loading permissions...
          </p>
        ) : (
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-left">Modules</th>
                {["View", "Create", "Edit", "Delete"].map((action) => (
                  <th key={action} className="p-3 border text-center">
                    {action.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <tr key={module} className="hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">{module}</td>
                  {["canView", "canCreate", "canEdit", "canDelete"].map(
                    (permKey) => (
                      <td key={permKey} className="border text-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5 cursor-pointer"
                          checked={permissions[module]?.[permKey] || false}
                          onChange={() => handleCheckboxChange(module, permKey)}
                          disabled={isDisabled}
                        />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 my-4 px-5">
        <button
          onClick={handleSave}
          disabled={isDisabled}
          className={`px-6 py-2 rounded font-medium text-white flex items-center gap-2 ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-secondary transition"
          }`}
        >
          {saving && <Spinner />}
          Save
        </button>
        <button
          onClick={() => setPermissions({})}
          disabled={isDisabled}
          className={`px-6 py-2 rounded font-medium ${
            isDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default Permissions;
