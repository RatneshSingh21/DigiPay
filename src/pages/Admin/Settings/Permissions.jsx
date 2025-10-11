import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";
import useAuthStore from "../../../store/authStore";
import AddModule from "../Permission/AddModule";

const Permissions = () => {
  const [employees, setEmployees] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // modal state

  const { companyId } = useAuthStore();

  const isDisabled = !selectedEmployee || saving;

  // Fetch admins and employees separately
  const fetchEmployees = async (companyId) => {
    try {
      setLoading(true);

      // 1. Fetch Admins
      const adminRes = await axiosInstance.get("/user-auth/all");
      const adminOptions = adminRes.data.map((admin) => ({
        value: admin.userId,
        label: `${admin.name} (${admin.role})`,
        type: "admin",
      }));

      // 2. Fetch Employees by companyId
      const empRes = await axiosInstance.get(
        `/user-auth/getEmployee/companyId/${companyId}`
      );
      const empOptions =
        empRes.data?.data?.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
          type: "employee",
        })) || [];

      // 3. Set grouped options
      setEmployees([
        { label: "Admins", options: adminOptions },
        { label: "Employees", options: empOptions },
      ]);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // fetch modules from API
  const fetchModules = async () => {
    try {
      const res = await axiosInstance.get("/ModuleMaster");
      setModules(
        res.data?.data?.map((m) => ({
          moduleId: m.moduleId,
          moduleName: m.moduleName,
        })) || []
      );
    } catch (err) {
      toast.error("Failed to load modules");
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchEmployees(companyId);
      fetchModules();
    }
  }, [companyId]);

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
      [module.moduleName]: {
        ...prev[module.moduleName],
        [permKey]: !prev[module.moduleName]?.[permKey],
        adminUserId: selectedEmployee?.value,
        moduleId: module.moduleId, // include moduleId
        moduleName: module.moduleName,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    try {
      setSaving(true);

      // build payload from all modules, not just toggled ones
      const payload = modules.map((m) => ({
        adminUserId: selectedEmployee.value,
        moduleId: m.moduleId,
        moduleName: m.moduleName,
        canView: permissions[m.moduleName]?.canView || false,
        canCreate: permissions[m.moduleName]?.canCreate || false,
        canEdit: permissions[m.moduleName]?.canEdit || false,
        canDelete: permissions[m.moduleName]?.canDelete || false,
      }));

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
      <div className="px-4 py-2 mb-5 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Permissions</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setIsModalOpen(true)} //open modal
            className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Module
          </button>
        </div>
      </div>

      {/* Employee Select */}
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
                    (m) =>
                      permissions[m.moduleName]?.canView &&
                      permissions[m.moduleName]?.canCreate &&
                      permissions[m.moduleName]?.canEdit &&
                      permissions[m.moduleName]?.canDelete
                  )}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newPerms = {};
                    modules.forEach((m) => {
                      newPerms[m.moduleName] = {
                        ...permissions[m.moduleName],
                        adminUserId: selectedEmployee?.value,
                        moduleId: m.moduleId,
                        moduleName: m.moduleName,
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

            <table className="min-w-full divide-y text-xs text-center divide-gray-200">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3">Modules</th>
                  {["View", "Create", "Edit", "Delete"].map((action) => (
                    <th key={action} className="p-3 text-center">
                      {action.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.moduleId} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{m.moduleName}</td>
                    {["canView", "canCreate", "canEdit", "canDelete"].map(
                      (permKey) => (
                        <td key={permKey} className="text-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 cursor-pointer accent-primary"
                            checked={
                              permissions[m.moduleName]?.[permKey] || false
                            }
                            onChange={() => handleCheckboxChange(m, permKey)}
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
      <div className="flex justify-end gap-4 px-5 text-sm pb-5">
        <button
          onClick={handleSave}
          disabled={isDisabled}
          className={`px-6 py-2 rounded cursor-pointer font-medium text-white flex items-center gap-2 ${
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
          className={`px-6 py-2 rounded cursor-pointer font-medium ${
            isDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          Cancel
        </button>
      </div>

      {/* Add Module Modal */}
      <AddModule
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchModules(); // refresh
        }}
      />
    </>
  );
};

export default Permissions;
