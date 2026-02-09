import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import Select from "react-select";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

/* react-select styles */
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,.3)" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    fontSize: "0.875rem",
  }),
  menu: (base) => ({
    ...base,
    fontSize: "0.875rem",
    zIndex: 60,
  }),
};

const EmployeePasswordModal = ({ isOpen, onClose, employee }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [form, setForm] = useState({
    employeeId: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* Load Employees */
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();

      if (employee) {
        setSelectedEmp(employee);
        setForm((prev) => ({
          ...prev,
          employeeId: employee.employeeId || employee.id,
        }));
      }
    }
  }, [isOpen, employee]);

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  /* react-select options */
  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp.id,
        label: emp.fullName,
      })),
    [employees],
  );

  /* react-select handler */
  const handleEmployeeSelect = (option) => {
    if (!option) {
      setSelectedEmp(null);
      setForm({
        employeeId: "",
        newPassword: "",
        confirmPassword: "",
      });
      return;
    }

    const emp = employees.find((x) => x.id === option.value);

    setSelectedEmp(emp);
    setForm({
      employeeId: option.value,
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employeeId) {
      toast.error("Please select employee");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await axiosInstance.post("/user-auth/admin/setup-employee-password", {
        employeeId: Number(form.employeeId),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      toast.success("Password set successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to setup password");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Setup Employee Password
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-red-500"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          className={`grid gap-6 p-6 transition-all duration-300 ${
            selectedEmp ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* LEFT: Employee Selection */}
          <div className="rounded-lg border bg-gray-50 border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Employee Details
            </h3>

            <label className="text-xs font-medium text-gray-600">
              Select Employee
            </label>

            <Select
              options={employeeOptions}
              value={employeeOptions.find(
                (opt) => opt.value === form.employeeId,
              )}
              onChange={handleEmployeeSelect}
              placeholder="Select employee..."
              isClearable
              styles={selectStyles}
            />

            {selectedEmp && (
              <div className="mt-4 rounded-md bg-white p-3 text-xs text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedEmp.fullName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedEmp.workEmail || "N/A"}
                </p>
              </div>
            )}
          </div>
          {/* RIGHT: Password (ONLY when employee selected) */}
          {selectedEmp && (
            <div className="rounded-lg border p-5 border-gray-200">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Password Setup
              </h3>

              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm cursor-pointer text-white hover:bg-secondary"
                  >
                    Save Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePasswordModal;
