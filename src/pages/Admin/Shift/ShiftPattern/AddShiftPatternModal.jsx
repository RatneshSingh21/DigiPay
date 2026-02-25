import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";

const AddShiftPatternModal = ({ onClose, onSuccess, isEdit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [customCycle, setCustomCycle] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    patternStartDate: "",
    cycleLength: 1,
    days: [{ dayNumber: 1, shiftId: "" }],
  });

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "12px",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
      "&:hover": { borderColor: "#3B82F6" },
    }),
  };

  // ================= FETCH EMPLOYEES =================
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axiosInstance.get("/Shift");
      setShifts(res.data || []);
    } catch (error) {
      toast.error("Failed to load shifts");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.fullName}(${emp.employeeCode})`,
  }));

  const cycleOptions = [
    { value: 1, label: "1 Day" },
    { value: 7, label: "7 Days" },
    { value: "custom", label: "Custom" },
  ];

  const shiftOptions = shifts.map((shift) => ({
    value: shift.id,
    label: shift.shiftName,
  }));

  const handleCycleChange = (selectedOption) => {
    if (selectedOption.value === "custom") {
      setCustomCycle(true);
      return;
    }

    setCustomCycle(false);
    generateDays(selectedOption.value);
  };

  const generateDays = (length) => {
    const daysArray = Array.from({ length }, (_, i) => ({
      dayNumber: i + 1,
      shiftId: "",
    }));

    setFormData((prev) => ({
      ...prev,
      cycleLength: length,
      days: daysArray,
    }));
  };

  const handleCustomCycleChange = (e) => {
    const length = Number(e.target.value);

    if (length > 0) {
      generateDays(length);
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cycleLength") {
      const length = Number(value);

      setFormData((prev) => ({
        ...prev,
        cycleLength: length,
        days: Array.from({ length }, (_, i) => ({
          dayNumber: i + 1,
          shiftId: "",
        })),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDayShiftChange = (index, value) => {
    const updatedDays = [...formData.days];
    updatedDays[index].shiftId = Number(value);

    setFormData((prev) => ({
      ...prev,
      days: updatedDays,
    }));
  };

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        employeeId: initialData.employeeId,
        patternStartDate: initialData.patternStartDate?.split("T")[0],
        cycleLength: initialData.cycleLength,
        days: initialData.days || [],
      });
    }
  }, [isEdit, initialData]);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.patternStartDate) {
      toast.error("Employee and Start Date required");
      return;
    }

    if (formData.days.some((d) => !d.shiftId)) {
      toast.error("All cycle days must have a shift");
      return;
    }

    const payload = {
      employeeId: Number(formData.employeeId),
      patternStartDate: formData.patternStartDate,
      cycleLength: Number(formData.cycleLength),
      days: formData.days.map((d) => ({
        dayNumber: d.dayNumber,
        shiftId: Number(d.shiftId),
      })),
    };

    setLoading(true);

    try {
      if (isEdit === "Edit" && initialData?.patternId) {
        await axiosInstance.put(
          `/shift-pattern/${initialData.patternId}`,
          payload,
        );
      } else {
        await axiosInstance.post("/shift-pattern", payload);
      }

      toast.success(
        isEdit === "Edit"
          ? "Shift Pattern Updated Successfully"
          : "Shift Pattern Saved Successfully",
      );
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error saving Shift Pattern",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div
        className="bg-white w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {isEdit === "Edit"
                ? "Edit Shift Pattern"
                : "Create Shift Pattern"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure employee shift cycle assignment
            </p>
          </div>

          <button
            type="button"
            className="text-gray-500 hover:text-red-500 cursor-pointer text-2xl transition"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* ================= BODY ================= */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-3"
        >
          {/* BASIC DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                options={employeeOptions}
                value={employeeOptions.find(
                  (option) => option.value === Number(formData.employeeId),
                )}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({
                    ...prev,
                    employeeId: selectedOption?.value || "",
                  }))
                }
                placeholder="Select employee"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pattern Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="patternStartDate"
                value={formData.patternStartDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Cycle Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cycle Length <span className="text-red-500">*</span>
              </label>

              <Select
                options={cycleOptions}
                value={
                  formData.cycleLength === 1
                    ? cycleOptions.find((opt) => opt.value === 1)
                    : formData.cycleLength === 7
                      ? cycleOptions.find((opt) => opt.value === 7)
                      : {
                          value: formData.cycleLength,
                          label: `${formData.cycleLength} Days`,
                        }
                }
                onChange={handleCycleChange}
                placeholder="Select cycle length"
                styles={customSelectStyles}
              />

              {customCycle && (
                <input
                  type="number"
                  min="1"
                  placeholder="Enter number of days"
                  className={inputClass + " mt-3"}
                  onChange={handleCustomCycleChange}
                />
              )}
            </div>
          </div>

          {/* ================= SHIFT CYCLE SECTION ================= */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Shift Cycle Schedule
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Assign shifts for each day in the cycle
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {formData.days.map((day, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center bg-white border border-gray-200 rounded-lg px-4 py-3"
                >
                  <div className="md:col-span-1 text-sm font-medium text-gray-600">
                    Day {day.dayNumber}
                  </div>

                  <div className="md:col-span-5">
                    <Select
                      styles={customSelectStyles}
                      options={shiftOptions}
                      value={shiftOptions.find(
                        (option) => option.value === day.shiftId,
                      )}
                      onChange={(selectedOption) =>
                        handleDayShiftChange(index, selectedOption?.value)
                      }
                      placeholder="Select shift"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-red-500">
            * Mandatory fields must be completed before saving
          </p>
        </form>

        {/* ================= FOOTER ================= */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg cursor-pointer text-sm font-medium text-white transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {loading ? <Spinner /> : "Save Pattern"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShiftPatternModal;
