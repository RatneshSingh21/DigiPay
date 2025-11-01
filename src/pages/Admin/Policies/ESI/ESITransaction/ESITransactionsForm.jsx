import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { X } from "lucide-react"; // ✅ lightweight close icon
import {
  createESITransaction,
  getAllEmployees,
  getAllESIRules,
} from "../../../../../services/esiService";

const AddESITransactionsForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: null,
    ruleId: null,
    month: "",
    year: "",
    payDays: "",
    esiWages: "",
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const empRes = await getAllEmployees();
        if (Array.isArray(empRes.data)) {
          setEmployees(empRes.data);
        }

        const ruleRes = await getAllESIRules();
        if (
          ruleRes.data.statusCode === 200 &&
          Array.isArray(ruleRes.data.data)
        ) {
          setRules(ruleRes.data.data);
        }

        console.log(ruleRes.data.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        toast.error("Failed to load dropdown options");
      }
    };

    fetchOptions();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.ruleId) {
      toast.error("Please select Employee and ESI Rule");
      return;
    }

    setLoading(true);
    try {
      const response = await createESITransaction(formData);
      if (response.data.status) {
        toast.success("ESI Transaction created successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to create transaction");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Error creating transaction");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-3 text-gray-500 hover:text-red-600"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold mb-4">Add ESI Transaction</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Select */}
          <div>
            <label className="block text-sm font-medium">Employee</label>
            <Select
              options={employees.map((emp) => ({
                value: emp.id,
                label: emp.fullName,
              }))}
              onChange={(option) =>
                setFormData((prev) => ({ ...prev, employeeId: option.value }))
              }
              value={
                employees.find((emp) => emp.id === formData.employeeId)
                  ? {
                      value: formData.employeeId,
                      label: employees.find(
                        (emp) => emp.id === formData.employeeId
                      ).fullName,
                    }
                  : null
              }
              placeholder="Select Employee"
              autoFocus
            />
          </div>

          {/* ESI Rule Select */}
          <div>
            <label className="block text-sm font-medium">ESI Rule</label>
            <Select
              options={rules.map((rule) => ({
                value: rule.ruleId,
                label: `Rule ${rule.ruleId} | Emp: ${rule.employeeContributionRate}% | Empr: ${rule.employerContributionRate}% | Ceiling: ₹${rule.wageCeiling}`,
              }))}
              onChange={(option) =>
                setFormData((prev) => ({ ...prev, ruleId: option.value }))
              }
              value={
                rules.find((rule) => rule.ruleId === formData.ruleId)
                  ? {
                      value: formData.ruleId,
                      label: `Rule ${formData.ruleId}`,
                    }
                  : null
              }
              placeholder="Select ESI Rule"
            />
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Month</label>
              <input
                type="number"
                name="month"
                value={formData.month}
                onChange={handleChange}
                min="1"
                max="12"
                required
                placeholder="Enter month (1-12)"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                placeholder="Enter year (e.g., 2025)"
                className={inputClass}
              />
            </div>
          </div>

          {/* Pay Days */}
          <div>
            <label className="block text-sm font-medium">Pay Days</label>
            <input
              type="number"
              name="payDays"
              value={formData.payDays}
              onChange={handleChange}
              required
              placeholder="Enter pay days"
              className={inputClass}
            />
          </div>

          {/* ESI Wages */}
          <div>
            <label className="block text-sm font-medium">ESI Wages</label>
            <input
              type="number"
              name="esiWages"
              value={formData.esiWages}
              onChange={handleChange}
              required
              placeholder="Enter ESI wages"
              className={inputClass}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end text-sm gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 cursor-pointer bg-primary text-white rounded hover:bg-secondary disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddESITransactionsForm;
