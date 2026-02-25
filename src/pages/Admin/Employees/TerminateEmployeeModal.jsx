import { useEffect, useState } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const exitTypeOptions = [
  { label: "Resignation", value: "Resignation" },
  { label: "Termination", value: "Termination" },
  { label: "Retirement", value: "Retirement" },
  { label: "Absconded", value: "Absconded" },
  { label: "Death", value: "Death" },
];

const TerminateEmployeeModal = ({ open, onClose, employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedExitType, setSelectedExitType] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    exitDate: "",
    reason: "",
    remark: "",
    fnfCompleted: false,
    canRehire: true,
  });

  /* Reset when modal closes */
  useEffect(() => {
    if (!open) {
      setSelectedEmployee(null);
      setSelectedExitType(null);
      setFormData({
        exitDate: "",
        reason: "",
        remark: "",
        fnfCompleted: false,
        canRehire: true,
      });
      setLoading(false);
    }
  }, [open]);

  /* ESC close */
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) return toast.error("Please select employee");
    if (!formData.exitDate) return toast.error("Please select exit date");
    if (!selectedExitType) return toast.error("Please select exit type");

    try {
      setLoading(true);

      await axiosInstance.post(
        `/Employee/${selectedEmployee.value}/terminate`,
        {
          ...formData,
          exitType: selectedExitType.value,
          exitDate: new Date(formData.exitDate).toISOString(),
        },
      );

      toast.success("Employee terminated successfully");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Termination failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-red-50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Terminate Employee
            </h2>
            <p className="text-xs text-gray-500">
              Process employee exit from organization
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-red-100 cursor-pointer transition"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-2 max-h-[70vh] overflow-y-auto">
          {/* Employee Select */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Search & Select Employee"
              options={employees.map((e) => ({
                label: `${e.fullName} (${e.employeeCode})`,
                value: e.id,
              }))}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
            />
          </div>

          {/* Exit Date & Exit Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Exit Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Exit Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                value={formData.exitDate}
                onChange={(e) => handleChange("exitDate", e.target.value)}
              />
            </div>

            {/* Exit Type */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Exit Type <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Select Exit Type"
                options={exitTypeOptions}
                value={selectedExitType}
                onChange={setSelectedExitType}
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderRadius: "0.5rem",
                  }),
                }}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              rows={3}
              className={inputClass}
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              rows={2}
              className={inputClass}
              value={formData.remark}
              onChange={(e) => handleChange("remark", e.target.value)}
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.fnfCompleted}
                onChange={(e) => handleChange("fnfCompleted", e.target.checked)}
                className="h-4 w-4 accent-red-600"
              />
              FNF Completed
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.canRehire}
                onChange={(e) => handleChange("canRehire", e.target.checked)}
                className="h-4 w-4 accent-red-600"
              />
              Eligible for Rehire
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-300 cursor-pointer rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Termination"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminateEmployeeModal;
