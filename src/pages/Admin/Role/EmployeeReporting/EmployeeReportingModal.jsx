import { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import Select from "react-select";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,.25)" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    fontSize: "0.875rem",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    fontSize: "0.875rem",
    zIndex: 60,
  }),
};

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const EmployeeReportingModal = ({
  isOpen,
  onClose,
  onSuccess,
  editData = null,
}) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    id: 0,
    employeeId: "",
    reportsToEmployeeId: "",
    departmentId: "",
    effectiveFrom: "",
    effectiveTo: "",
  });

  /* Load data */

  useEffect(() => {
    if (!isOpen) return;

    fetchEmployees();
    fetchDepartments();

    if (editData) {
      setForm({
        id: editData.id,
        employeeId: editData.employeeId,
        reportsToEmployeeId: editData.reportsToEmployeeId,
        departmentId: editData.departmentId,
        effectiveFrom: editData.effectiveFrom?.split("T")[0],
        effectiveTo: editData.effectiveTo?.split("T")[0],
      });
    } else {
      resetForm(); // THIS IS THE KEY FIX
    }
  }, [isOpen, editData]);

  const resetForm = () => {
    setForm({
      id: 0,
      employeeId: "",
      reportsToEmployeeId: "",
      departmentId: "",
      effectiveFrom: "",
      effectiveTo: "",
    });
  };

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

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: emp.fullName,
    departmentId: emp.departmentId,
  }));

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const emp = employees.find((x) => x.id == empId);

    setForm({
      ...form,
      employeeId: empId,
      departmentId: emp?.departmentId || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: form.id,
      reportsToEmployeeId: Number(form.reportsToEmployeeId),
      departmentId: Number(form.departmentId),
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo,
    };

    try {
      if (form.id) {
        await axiosInstance.put("/hierarchy/employee-reporting", payload);
        toast.success("Reporting updated successfully");
      } else {
        await axiosInstance.post("/hierarchy/employee-reporting", {
          employeeId: Number(form.employeeId),
          ...payload,
        });
        toast.success("Reporting added successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[480px] rounded-xl shadow-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer"
        >
          <FiX size={20} />
        </button>

        {/* Header */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {form.id ? "Edit Employee Reporting" : "Add Employee Reporting"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Define reporting manager and department mapping
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Employee */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Employee
            </label>

            <Select
              options={employeeOptions}
              value={employeeOptions.find((o) => o.value === form.employeeId)}
              onChange={(opt) => {
                if (!opt) return;
                setForm({
                  ...form,
                  employeeId: opt.value,
                  departmentId: opt.departmentId || "",
                });
              }}
              isDisabled={!!form.id}
              placeholder="Select Employee"
              styles={selectStyles}
            />
          </div>

          {/* Manager */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Reporting Manager
            </label>

            <Select
              options={employeeOptions.filter(
                (e) => e.value !== form.employeeId,
              )}
              value={employeeOptions.find(
                (o) => o.value === form.reportsToEmployeeId,
              )}
              onChange={(opt) =>
                setForm({
                  ...form,
                  reportsToEmployeeId: opt?.value || "",
                })
              }
              placeholder="Select Manager"
              styles={selectStyles}
            />
          </div>

          {/* Department */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Department
            </label>

            <Select
              options={departmentOptions}
              value={departmentOptions.find(
                (o) => o.value === form.departmentId,
              )}
              onChange={(opt) =>
                setForm({
                  ...form,
                  departmentId: opt?.value || "",
                })
              }
              placeholder="Select Department"
              styles={selectStyles}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Effective From
              </label>
              <input
                type="date"
                name="effectiveFrom"
                value={form.effectiveFrom}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Effective To
              </label>
              <input
                type="date"
                name="effectiveTo"
                value={form.effectiveTo}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-400">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-primary text-white rounded-md hover:bg-secondary cursor-pointer"
            >
              {form.id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeReportingModal;
