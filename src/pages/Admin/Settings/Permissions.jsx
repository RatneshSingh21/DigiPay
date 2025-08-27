import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiDownload, FiUpload } from "react-icons/fi";
import Spinner from "../../../components/Spinner";
import useAuthStore from "../../../store/authStore";

const modules = [
  "Employee",
  "Salary",
  "Attendance",
  "Pay Schedule",
  "Work Location",
  "Payroll Run",
];

const Permissions = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
    const { user } = useAuthStore();

  const isDisabled = !selectedEmployee || saving;

  // Fetch employees + include Admin itself
  const fetchEmployees = async (userId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/user-auth/User-Employee/${userId}`);
      const { userId: uId, userName, employees } = res.data;

      // First add Admin as an option
      const adminOption = {
        value: uId,
        label: `${userName} (Admin)`,
        type: "admin",
      };

      // Then map employees
      const empOptions = employees.map((emp) => ({
        value: emp.employeeId,
        label: `${emp.employeeName} (${emp.employeeCode})`,
        type: "employee",
      }));

      // Combine admin + employees in grouped format
      const groupedOptions = [
        {
          label: "Admin",
          options: [adminOption],
        },
        {
          label: "Employees",
          options: empOptions,
        },
      ];

      setEmployees(groupedOptions);
    } catch (err) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEmployees(user.userId);
  }, []);

  const fetchPermissions = async (employeeId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/Permission/admin/${employeeId}`);
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

  useEffect(() => {
    if (selectedEmployee?.value) {
      fetchPermissions(selectedEmployee.value);
    } else {
      setPermissions({});
    }
  }, [selectedEmployee]);

  const handleCheckboxChange = (module, permKey) => {
    if (isDisabled) return;
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permKey]: !prev[module]?.[permKey],
        adminUserId: selectedEmployee?.value,
        moduleName: module,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    try {
      setSaving(true);
      const payload = Object.values(permissions);
      for (let item of payload) {
        await axiosInstance.post("/Permission/set", item);
      }
      toast.success("Permissions updated!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update permissions"
      );
    } finally {
      setSaving(false);
    }
  };

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

      {/* Employee Select + Disabled ID input */}
      <div className="flex items-center gap-4 px-5 flex-wrap">
        <div className="w-80">
          <Select
            options={employees}
            placeholder="Select Employee"
            value={selectedEmployee}
            onChange={(selected) => setSelectedEmployee(selected)}
            isClearable
            isDisabled={saving || loading}
          />
        </div>
        <input
          type="number"
          className="w-60 px-4 py-2 border border-blue-300 rounded-md bg-gray-100"
          value={selectedEmployee?.value || ""}
          readOnly
          disabled
        />
      </div>

      {/* Permissions Table */}
      <div className="overflow-x-auto bg-white p-5 rounded-lg mt-4">
        {loading ? (
          <p className="text-center py-10 text-gray-500">
            Loading permissions...
          </p>
        ) : (
          <>
            {/* Select All */}
            <div className="flex justify-end mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={modules.every(
                    (module) =>
                      permissions[module]?.canView &&
                      permissions[module]?.canCreate &&
                      permissions[module]?.canEdit &&
                      permissions[module]?.canDelete
                  )}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newPerms = {};
                    modules.forEach((module) => {
                      newPerms[module] = {
                        ...permissions[module],
                        adminUserId: selectedEmployee?.value,
                        moduleName: module,
                        canView: checked,
                        canCreate: checked,
                        canEdit: checked,
                        canDelete: checked,
                      };
                    });
                    setPermissions(newPerms);
                  }}
                  disabled={isDisabled}
                />
                Select All
              </label>
            </div>

            {/* Table */}
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
                            className="w-5 h-5 cursor-pointer accent-primary"
                            checked={permissions[module]?.[permKey] || false}
                            onChange={() =>
                              handleCheckboxChange(module, permKey)
                            }
                            disabled={isDisabled}
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 px-5 pb-5">
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
