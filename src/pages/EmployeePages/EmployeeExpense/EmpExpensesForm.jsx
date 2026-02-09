import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import Select from "react-select";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import { FaTimes } from "react-icons/fa";

const EmpExpensesForm = ({ onClose, onSuccess }) => {
  const User = useAuthStore((state) => state.user);
  const employeeId = User?.userId;

  const [formData, setFormData] = useState({
    headerId: "",
    expenseDetailsName: "",
    expenseDate: "",
    expenseLastDate: "",
    amount: "",
    description: "",
    file: null,
  });

  const [headers, setHeaders] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  // ---------- Fetch Headers ----------
  const fetchHeaders = async () => {
    try {
      const res = await axiosInstance.get(`/Header/employee/${employeeId}`);
      if (res.data?.statusCode === 200 && res.data?.response) {
        const formatted = res.data.response.map((h) => ({
          value: h.headerId,
          label: h.headerName,
          maxAllowedAmount: h.maxAllowedAmount,
        }));
        setHeaders(formatted);
      }
    } catch {
      toast.error("Failed to load headers");
    }
  };

  useEffect(() => {
    fetchHeaders();
  }, []);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((p) => ({ ...p, file: e.target.files[0] }));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.headerId || !formData.amount) {
      setError("Header and Amount are required.");
      return;
    }

    try {
      setLoading(true);

      const uploadData = new FormData();
      uploadData.append("HeaderId", formData.headerId);
      uploadData.append("ExpenseDetailsName", formData.expenseDetailsName);
      uploadData.append("ExpenseDate", formData.expenseDate);
      uploadData.append("ExpenseLastDate", formData.expenseLastDate);
      uploadData.append("Amount", formData.amount);
      uploadData.append("Description", formData.description || "");

      if (formData.file) uploadData.append("File", formData.file);

      await axiosInstance.post("/ExpenseDetails/create", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Expense added successfully!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg animate-fade-in">
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Add New Expense
          </h3>
          <button onClick={onClose}>
            <FaTimes className="text-gray-500 hover:text-red-500 transition cursor-pointer" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 px-6 py-4">
          {/* Header */}
          <div>
            <label className="text-sm font-medium">
              Header <span className="text-red-500">*</span>
            </label>
            <Select
              options={headers}
              value={headers.find((h) => h.value === formData.headerId) || null}
              onChange={(selected) => {
                setSelectedHeader(selected);
                setFormData((p) => ({
                  ...p,
                  headerId: selected?.value || "",
                  expenseDetailsName: selected?.label || "",
                }));
              }}
              placeholder="Select expense header"
              required
            />
            {selectedHeader?.maxAllowedAmount && (
              <p className="text-xs text-red-500 mt-1 font-semibold">
                Max Allowed: ₹{selectedHeader.maxAllowedAmount}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter amount"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Last Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expenseLastDate"
                value={formData.expenseLastDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="Optional description"
            />
          </div>

          {/* File */}
          <div>
            <label className="text-sm font-medium">Upload Bill</label>
            <input
              type="file"
              onChange={handleFileChange}
              className={inputClass}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2.5 cursor-pointer text-white font-medium transition ${
              loading
                ? "bg-primary cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {loading ? <Spinner /> : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmpExpensesForm;
