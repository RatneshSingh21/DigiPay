import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../../components/Spinner";

const AddHeaderForm = ({ onClose, onSuccess, headerId }) => {
  const [form, setForm] = useState({
    headerName: "",
    description: "",
    maxAllowedAmount: "",
    allowedToUserIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const inputClass =
    "w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/Employee");
        if (Array.isArray(res.data)) {
          const formatted = res.data.map((emp) => ({
            value: emp.id,
            label: `${emp.fullName} (${emp.employeeCode})`,
          }));
          setEmployees(formatted);
        } else {
          toast.error("Invalid employee list response");
        }
      } catch (err) {
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, []);

  // Fetch Header Data (Edit Mode)
  useEffect(() => {
    if (headerId) {
      setIsEdit(true);
      const fetchHeaderDetails = async () => {
        try {
          setLoading(true);
          const res = await axiosInstance.get(`/Header/${headerId}`);
          if (res.data.statusCode === 200) {
            const data = res.data.response;
            setForm({
              headerName: data.headerName || "",
              description: data.description || "",
              maxAllowedAmount: data.maxAllowedAmount || "",
              allowedToUserIds: data.allowedToUserIds || [],
            });

            // Pre-select employees in dropdown
            setSelectedEmployees(
              employees.filter((e) =>
                (data.allowedToUserIds || []).includes(e.value)
              )
            );
          } else {
            toast.error(res.data.message || "Failed to load header details");
          }
        } catch (error) {
          toast.error("Error loading header details");
        } finally {
          setLoading(false);
        }
      };
      fetchHeaderDetails();
    }
  }, [headerId, employees]); // Run after employees are loaded

  // Handle Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOptions) => {
    setSelectedEmployees(selectedOptions || []);
    setForm({
      ...form,
      allowedToUserIds: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
    setSelectAll(selectedOptions?.length === employees.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
      setForm({ ...form, allowedToUserIds: [] });
      setSelectAll(false);
    } else {
      setSelectedEmployees(employees);
      setForm({ ...form, allowedToUserIds: employees.map((e) => e.value) });
      setSelectAll(true);
    }
  };

  // Submit Handler (POST or PUT)
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
        description: form.description || "",
        maxAllowedAmount: form.maxAllowedAmount || "",
        allowedToUserIds: form.allowedToUserIds,
      };

      let res;
      if (isEdit && headerId) {
        res = await axiosInstance.put(`/Header/${headerId}`, payload);
      } else {
        res = await axiosInstance.post("/Header", payload);
      }

      if (res.data.statusCode === 200 || res.status === 200) {
        toast.success(isEdit ? "Header updated successfully" : "Header added successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to save header");
      }
    } catch (error) {
      toast.error(isEdit ? "Error updating header" : "Error adding header");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          onClick={onClose}
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
          <form onSubmit={handleSubmit} className="overflow-y-scroll max-h-[70vh] px-2">
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Header Name</label>
              <input
                type="text"
                name="headerName"
                value={form.headerName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter header name"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter description"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Max Allowed Amount</label>
              <input
                type="text"
                name="maxAllowedAmount"
                value={form.maxAllowedAmount}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Allowed To Employees
              </label>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">
                  Select one or more employees
                </span>
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
                onChange={handleSelectChange}
                className="text-sm"
                placeholder="Select employees..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-secondary"
              >
                {loading ? <Spinner size="sm" /> : isEdit ? "Update" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddHeaderForm;
