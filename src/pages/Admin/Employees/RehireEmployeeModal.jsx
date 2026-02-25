import { useEffect, useState } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const RehireEmployeeModal = ({
  open,
  onClose,
  employees,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [rehireDate, setRehireDate] = useState("");
  const [loading, setLoading] = useState(false);

  /* Reset form when closing */
  useEffect(() => {
    if (!open) {
      setSelectedEmployee(null);
      setRehireDate("");
      setLoading(false);
    }
  }, [open]);

  /* ESC Close */
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedEmployee) return toast.error("Please select employee");
    if (!rehireDate) return toast.error("Please select rehire date");

    try {
      setLoading(true);

      await axiosInstance.post(`/Employee/${selectedEmployee.value}/rehire`, {
        rehireDate: new Date(rehireDate).toISOString(),
      });

      toast.success("Employee rehired successfully");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Rehire failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-green-50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Rehire Employee
            </h2>
            <p className="text-xs text-gray-500">
              Restore employee employment status
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-green-100 cursor-pointer transition"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Employee Select */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
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

          {/* Rehire Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Rehire Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={inputClass}
              value={rehireDate}
              onChange={(e) => setRehireDate(e.target.value)}
            />
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
            className="px-5 py-2 text-sm bg-green-600 cursor-pointer text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Rehire"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RehireEmployeeModal;
