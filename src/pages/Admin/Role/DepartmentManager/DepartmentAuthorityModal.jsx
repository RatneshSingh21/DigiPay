import { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import Select from "react-select";

/* ===================== INPUT STYLE ===================== */
const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

/* ===================== REACT-SELECT STYLE ===================== */
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.5)" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    fontSize: "0.875rem",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 12px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: "38px",
  }),
};

const DepartmentAuthorityModal = ({
  isOpen,
  onClose,
  onSuccess,
  editData = null,
}) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roleMappings, setRoleMappings] = useState([]);

  const [form, setForm] = useState({
    id: 0,
    departmentId: "",
    employeeId: "",
    roleId: "",
    roleName: "",
    isPrimary: true,
  });

  /* ===================== LOAD ===================== */
  useEffect(() => {
    if (!isOpen) return;

    fetchEmployees();
    fetchDepartments();
    fetchRoleMappings();

    if (editData) {
      setForm({
        id: editData.id,
        departmentId: editData.departmentId,
        employeeId: editData.employeeId,
        roleId: editData.roleId,
        roleName: editData.roleName,
        isPrimary: editData.isPrimary,
      });
    } else {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setForm({
      id: 0,
      departmentId: "",
      employeeId: "",
      roleId: "",
      roleName: "",
      isPrimary: true,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* ===================== FETCH ===================== */
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/Department");
      setDepartments(res.data);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  const fetchRoleMappings = async () => {
    try {
      const res = await axiosInstance.get("/EmployeeRoleMapping");
      setRoleMappings(res.data);
    } catch {
      toast.error("Failed to load role mapping");
    }
  };

  /* ===================== OPTIONS ===================== */
  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.fullName,
  }));

  /* ===================== CHANGE ===================== */
  const handleCheckboxChange = (e) => {
    setForm({ ...form, isPrimary: e.target.checked });
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.roleId) {
      toast.error("Employee has no assigned role");
      return;
    }

    const payload = {
      id: form.id,
      departmentId: Number(form.departmentId),
      employeeId: Number(form.employeeId),
      roleId: Number(form.roleId),
      isPrimary: form.isPrimary,
    };

    try {
      if (form.id) {
        await axiosInstance.put("/hierarchy/department-authority", payload);
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post("/hierarchy/department-authority", payload);
        toast.success("Added successfully");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold">
            {form.id ? "Edit Department Authority" : "Add Department Authority"}
          </h2>

          <button
            onClick={handleClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 cursor-pointer hover:text-red-500"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-2 px-5 py-4">
          {/* Department */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Department
            </label>
            <Select
              options={departmentOptions}
              value={departmentOptions.find(
                (o) => o.value === Number(form.departmentId),
              )}
              onChange={(option) =>
                setForm({ ...form, departmentId: option?.value || "" })
              }
              placeholder="Select Department"
              styles={selectStyles}
            />
          </div>

          {/* Employee */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Employee
            </label>
            <Select
              options={employeeOptions}
              value={employeeOptions.find(
                (o) => o.value === Number(form.employeeId),
              )}
              onChange={(option) => {
                if (!option) {
                  setForm({
                    ...form,
                    employeeId: "",
                    roleId: "",
                    roleName: "",
                  });
                  return;
                }

                const mapping = roleMappings.find(
                  (x) => x.employeeId === option.value,
                );

                if (!mapping) {
                  toast.warning("No role assigned to this employee");
                  setForm({
                    ...form,
                    employeeId: option.value,
                    roleId: "",
                    roleName: "",
                  });
                  return;
                }

                setForm({
                  ...form,
                  employeeId: option.value,
                  roleId: mapping.roleId,
                  roleName: mapping.roleName,
                });
              }}
              placeholder="Select Employee"
              styles={selectStyles}
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Role
            </label>
            <input
              type="text"
              value={form.roleName}
              readOnly
              placeholder="Auto assigned"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Primary */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={handleCheckboxChange}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm text-gray-700">Primary Authority</span>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border px-4 py-1.5 text-sm cursor-pointer hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-1.5 text-sm text-white hover:bg-secondary cursor-pointer"
            >
              {form.id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentAuthorityModal;
