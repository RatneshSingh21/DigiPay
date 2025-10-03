import React, { useState, useEffect } from "react";
import { saveEmployeeESIDetail } from "../../../../../../services/esiService";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import Select from "react-select";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#60A5FA" : "#CBD5E1",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(96,165,250,0.5)" : "none",
    "&:hover": { borderColor: "#60A5FA" },
    borderRadius: "0.375rem",
    minHeight: "36px",
    fontSize: "0.875rem",
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999, fontSize: "0.875rem" }),
  multiValueLabel: (provided) => ({ ...provided, fontSize: "0.75rem" }),
  placeholder: (provided) => ({ ...provided, fontSize: "0.875rem" }),
};

const EmployeeESIDetailForm = ({ editData, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    esiNumber: "",
    isApplicable: true,
    coverageStartDate: "",
    coverageEndDate: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        employeeId: editData.employeeId,
        esiNumber: editData.esiNumber,
        isApplicable: editData.isApplicable,
        coverageStartDate: editData.coverageStartDate?.split("T")[0] || "",
        coverageEndDate: editData.coverageEndDate?.split("T")[0] || "",
      });
    }
  }, [editData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes] = await Promise.all([axiosInstance.get("/Employee")]);
        setEmployees(empRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error loading form data");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveEmployeeESIDetail(form);
      toast.success("Employee ESI detail saved successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Employee ESI detail");
    }
  };

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white relative p-6 rounded-lg max-h-[75vh] overflow-y-auto shadow-lg w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-red-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold mb-4">
          {editData ? "Edit Employee ESI Detail" : "Add Employee ESI Detail"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee */}
          <div>
            <label className="font-medium mb-1 block">Employee</label>
            <Select
              value={
                employees.find((emp) => emp.id === form.employeeId) || null
              }
              onChange={(selected) =>
                setForm({ ...form, employeeId: selected?.id || "" })
              }
              getOptionLabel={(emp) => `${emp.fullName} (${emp.employeeCode})`}
              getOptionValue={(emp) => emp.id}
              options={employees}
              styles={customSelectStyles}
              placeholder="Select Employee"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm">ESI Number</label>
            <input
              type="text"
              name="esiNumber"
              value={form.esiNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter ESI number"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isApplicable"
              checked={form.isApplicable}
              onChange={handleChange}
            />
            <label className="text-sm">Is Applicable</label>
          </div>
          <div>
            <label className="text-sm">Coverage Start Date</label>
            <input
              type="date"
              name="coverageStartDate"
              value={form.coverageStartDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="text-sm">Coverage End Date</label>
            <input
              type="date"
              name="coverageEndDate"
              value={form.coverageEndDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary cursor-pointer text-white rounded hover:bg-secondary"
            >
              {editData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeESIDetailForm;
