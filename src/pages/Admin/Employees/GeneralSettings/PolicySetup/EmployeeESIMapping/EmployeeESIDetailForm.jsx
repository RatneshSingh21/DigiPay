import React, { useState, useEffect, useMemo } from "react";
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
  option: (base, state) => ({
    ...base,
    color: state.isDisabled ? "#9ca3af" : base.color,
    cursor: state.isDisabled ? "not-allowed" : "pointer",
  }),
};

const EmployeeESIDetailForm = ({ editData, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [existingESI, setExistingESI] = useState([]);

  const [form, setForm] = useState({
    employeeId: "",
    esiNumber: "",
    isApplicable: true,
    coverageStartDate: "",
    coverageEndDate: "",
  });

  /* ================= PREFILL EDIT ================= */
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

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, esiRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/EmployeeESIDetails"),
        ]);

        setEmployees(empRes.data || []);
        setExistingESI(esiRes.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error loading form data");
      }
    };

    fetchData();
  }, []);

  /* ================= CHECK ALREADY ADDED ================= */
  const isEmployeeAlreadyAdded = (employeeId) => {
    return existingESI.some(
      (e) =>
        e.employeeId === employeeId &&
        (!editData || e.employeeId !== editData.employeeId)
    );
  };

  /* ================= EMPLOYEE OPTIONS ================= */
  const employeeOptions = useMemo(() => {
    return employees.map((emp) => {
      const isAdded = isEmployeeAlreadyAdded(emp.id);

      return {
        value: emp.id,
        label: `${emp.fullName} (${emp.employeeCode})${
          isAdded ? " • Already added" : ""
        }`,
        isDisabled: isAdded,
      };
    });
  }, [employees, existingESI, editData]);

  /* ================= CHANGE HANDLER ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmployeeAlreadyAdded(Number(form.employeeId))) {
      toast.warning("ESI details already exist for this employee");
      return;
    }

    try {
      await saveEmployeeESIDetail(form);
      toast.success(
        editData
          ? "Employee ESI detail updated successfully"
          : "Employee ESI detail saved successfully"
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to save Employee ESI detail"
      );
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
              options={employeeOptions}
              value={employeeOptions.find(
                (o) => o.value === Number(form.employeeId)
              )}
              onChange={(opt) =>
                setForm({ ...form, employeeId: opt?.value || "" })
              }
              styles={customSelectStyles}
              placeholder="Select Employee"
              isDisabled={!!editData} // optional: lock employee on edit
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
