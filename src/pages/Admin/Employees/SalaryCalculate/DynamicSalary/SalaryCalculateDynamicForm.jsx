import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const SalaryCalculateDynamicForm = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    policyId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [selectedMonth, setSelectedMonth] = useState(
    monthOptions[new Date().getMonth()],
  );

  const handleMonthChange = (option) => {
    setSelectedMonth(option);

    setFormData((prev) => ({
      ...prev,
      month: option.value,
    }));
  };

  /* ================= FETCH EMPLOYEES ================= */

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axiosInstance.get("/Employee");

        const options = data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
        }));

        setEmployees(options);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch employees");
      }
    };

    fetchEmployees();
  }, []);

  /* ================= FETCH ACTIVE POLICY ================= */

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await axiosInstance.get("/DynamicSalaryPolicy/active");

        const policy = res.data?.data;

        if (policy) {
          const option = {
            value: policy.id,
            label: policy.policyName,
          };

          setPolicies([option]);
          setSelectedPolicy(option);

          setFormData((prev) => ({
            ...prev,
            policyId: policy.id,
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch salary policy");
      }
    };

    fetchPolicy();
  }, []);

  /* ================= HANDLERS ================= */

  const handleEmployeeChange = (option) => {
    setSelectedEmployee(option);

    setFormData((prev) => ({
      ...prev,
      employeeId: option.value,
    }));
  };

  const handlePolicyChange = (option) => {
    setSelectedPolicy(option);

    setFormData((prev) => ({
      ...prev,
      policyId: option.value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!formData.policyId) {
      toast.error("Salary policy not found");
      return;
    }

    try {
      const payrollMonth = `${formData.year}-${String(formData.month).padStart(
        2,
        "0",
      )}-01`;

      const res = await axiosInstance.post(
        `/DynamicSalaryEngine/process`,
        {},
        {
          params: {
            policyId: formData.policyId,
            employeeId: formData.employeeId,
            payrollMonth: payrollMonth,
          },
        },
      );

      toast.success("Salary calculated successfully");

      onSuccess(res.data.data); // pass result to parent
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to calculate salary");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        {/* TITLE */}
        <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
          Generate Salary (Dynamic)
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* POLICY SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Policy
            </label>

            <Select
              options={policies}
              value={selectedPolicy}
              onChange={handlePolicyChange}
              className="text-sm"
              isDisabled
            />
          </div>

          {/* EMPLOYEE SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>

            <Select
              options={employees}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              placeholder="Select Employee..."
              className="text-sm"
            />
          </div>

          {/* MONTH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>

            <Select
              options={monthOptions}
              value={selectedMonth}
              onChange={handleMonthChange}
              className="text-sm"
            />
          </div>

          {/* YEAR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>

            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-sm bg-primary text-white cursor-pointer rounded-lg hover:bg-secondary"
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryCalculateDynamicForm;
