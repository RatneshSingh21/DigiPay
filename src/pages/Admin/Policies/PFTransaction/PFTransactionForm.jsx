import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const PFTransactionForm = ({
  formData,
  setFormData,
  onClose,
  onSubmit,
  editId,
}) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Employees for dropdown
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/Employee"); // make sure API returns employeeId, fullName, employeeCode
      const data = res.data || [];
      setEmployees(
        data.map((emp) => ({
          value: emp.id, // or emp.employeeId depending on API
          label: `${emp.fullName} (${emp.employeeCode})`,
        }))
      );
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-semibold">
            {editId ? "Edit Transaction" : "Add Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 h-[70vh] overflow-y-auto"
        >
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <Select
              options={employees}
              isLoading={loading}
              value={
                employees.find((e) => e.value === formData.employeeId) || null
              }
              onChange={(option) =>
                setFormData({ ...formData, employeeId: option?.value })
              }
              placeholder="Select Employee"
              className="react-select-container"
              classNamePrefix="react-select"
              autoFocus
              isDisabled={!!editId} // disable in edit mode
              required
            />
          </div>

          {/* Payroll Month only in Add Mode */}
          {!editId && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Payroll Month
              </label>
              <input
                type="date"
                value={formData.payrollMonth || ""}
                onChange={(e) =>
                  setFormData({ ...formData, payrollMonth: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          )}

          {/* Edit Mode Fields */}
          {editId && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Wage Considered
                </label>
                <input
                  type="number"
                  value={formData.wageConsidered || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, wageConsidered: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee Contribution
                </label>
                <input
                  type="number"
                  value={formData.employeeContribution || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeContribution: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Employer Contribution
                </label>
                <input
                  type="number"
                  value={formData.employerContribution || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employerContribution: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Formula Used
                </label>
                <input
                  type="text"
                  value={formData.formulaUsed || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, formulaUsed: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Transaction Status
                </label>
                <input
                  type="number"
                  value={formData.transactionStatusId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionStatusId: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Processed At
                </label>
                <input
                  type="datetime-local"
                  value={formData.processedAt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, processedAt: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 cursor-pointer rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary cursor-pointer text-white rounded-lg hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PFTransactionForm;
