import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../../components/Spinner";

/* ================= INBUILT / INDUSTRY HEADERS ================= */
const INDUSTRY_HEADERS = [
  { value: "Travel Expense", label: "Travel Expense" },
  { value: "Food & Meals", label: "Food & Meals" },
  { value: "Accommodation", label: "Accommodation" },
  { value: "Fuel Expense", label: "Fuel Expense" },
  { value: "Mobile / Internet", label: "Mobile / Internet" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Client Entertainment", label: "Client Entertainment" },
  { value: "Training & Certification", label: "Training & Certification" },
  { value: "Medical Reimbursement", label: "Medical Reimbursement" },
  { value: "Miscellaneous", label: "Miscellaneous" },
];

const AddHeaderForm = ({ onClose, onSuccess, headerId }) => {
  const [form, setForm] = useState({
    headerName: "",
    description: "",
    maxAllowedAmount: "",
    allowedToUserIds: [],
  });

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

 const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  /* ================= FETCH EMPLOYEES ================= */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/Employee");
        if (Array.isArray(res.data)) {
          setEmployees(
            res.data.map((emp) => ({
              value: emp.id,
              label: `${emp.fullName} (${emp.employeeCode})`,
            }))
          );
        }
      } catch {
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, []);

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (!headerId || !employees.length) return;

    setIsEdit(true);

    const fetchHeaderDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/Header/${headerId}`);
        if (res.data?.statusCode === 200) {
          const data = res.data.response;

          setForm({
            headerName: data.headerName || "",
            description: data.description || "",
            maxAllowedAmount: data.maxAllowedAmount || "",
            allowedToUserIds: data.allowedToUserIds || [],
          });

          setSelectedEmployees(
            employees.filter((e) =>
              (data.allowedToUserIds || []).includes(e.value)
            )
          );
        }
      } catch {
        toast.error("Error loading header details");
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderDetails();
  }, [headerId, employees]);

  /* ================= EMPLOYEE HANDLERS ================= */
  const handleEmployeeChange = (selected) => {
    setSelectedEmployees(selected || []);
    setForm({
      ...form,
      allowedToUserIds: selected ? selected.map((s) => s.value) : [],
    });
    setSelectAll(selected?.length === employees.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
      setForm({ ...form, allowedToUserIds: [] });
    } else {
      setSelectedEmployees(employees);
      setForm({ ...form, allowedToUserIds: employees.map((e) => e.value) });
    }
    setSelectAll(!selectAll);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.headerName.trim()) {
      toast.error("Header name is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        headerName: form.headerName,
        description: form.description,
        maxAllowedAmount: form.maxAllowedAmount,
        allowedToUserIds: form.allowedToUserIds,
      };

      const res = isEdit
        ? await axiosInstance.put(`/Header/${headerId}`, payload)
        : await axiosInstance.post("/Header", payload);

      if (res.data?.statusCode === 200 || res.status === 200) {
        toast.success(isEdit ? "Header updated successfully" : "Header added successfully");
        onSuccess();
        onClose();
      }
    } catch {
      toast.error(isEdit ? "Error updating header" : "Error adding header");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-600 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Header" : "Add New Header"}
        </h2>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2 max-h-[70vh] p-2 overflow-y-auto">

            {/* HEADER NAME — TYPEAHEAD + CREATE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Header Name
              </label>

              <CreatableSelect
                options={INDUSTRY_HEADERS}
                value={
                  form.headerName
                    ? { label: form.headerName, value: form.headerName }
                    : null
                }
                onChange={(selected) =>
                  setForm({
                    ...form,
                    headerName: selected ? selected.value : "",
                  })
                }
                onCreateOption={(inputValue) => {
                  setForm({ ...form, headerName: inputValue });
                  toast.info(`New header created: "${inputValue}"`);
                }}
                placeholder="Type to search or create header"
                formatCreateLabel={(v) => `➕ Create new header "${v}"`}
                isClearable
                isSearchable
              />

              <p className="text-[11px] text-gray-500 italic mt-1">
                Start typing to see existing headers or continue to create a new one
              </p>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={inputClass}
              />
            </div>

            {/* MAX AMOUNT */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Allowed Amount
              </label>
              <input
                type="number"
                name="maxAllowedAmount"
                value={form.maxAllowedAmount}
                onChange={(e) =>
                  setForm({ ...form, maxAllowedAmount: e.target.value })
                }
                className={inputClass}
              />
            </div>

            {/* EMPLOYEES */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">
                  Allowed To Employees
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-blue-600 text-xs underline"
                >
                  {selectAll ? "Deselect All" : "Select All"}
                </button>
              </div>

              <Select
                isMulti
                options={employees}
                value={selectedEmployees}
                onChange={handleEmployeeChange}
                placeholder="Select employees..."
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 cursor-pointer bg-gray-200 text-sm rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary cursor-pointer text-white text-sm rounded"
              >
                {isEdit ? "Update" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddHeaderForm;
