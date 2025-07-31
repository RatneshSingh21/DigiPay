import { useState, useEffect } from "react";
import Select from "react-select";
import { FiDownload, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const AddShiftForm = ({ onClose, onSuccess, initialData, isEdit }) => {
  const [form, setForm] = useState({
    shiftName: "",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    isShiftMarginEnabled: false,
    marginBeforeShift: "",
    marginAfterShift: "",
    isCoreHoursEnabled: false,
    coreStart: "",
    coreEnd: "",
    isWeekendBasedOnLocation: true,
    hasShiftAllowance: false,
    shiftAllowanceAmount: 0,
    department: null,
    departmentIds: [],
  });

  const [coreHours, setCoreHours] = useState([{ from: "", to: "" }]);
  const [showCriteria, setShowCriteria] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const customSelectStyles = {
    menuList: (provided) => ({
      ...provided,
      maxHeight: 150, // make scroll appear after height exceeds
      overflowY: "auto",
    }),
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get("/Department");
        const options = response.data.map((dept) => ({
          value: dept.id,
          label: dept.name,
        }));
        setDepartmentOptions(options);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setForm({
        ...initialData,
        department:
          initialData.departmentIds?.map((id) => {
            const match = departmentOptions.find((d) => d.value === id);
            return match ? match : { value: id, label: `Dept-${id}` };
          }) || [],
      });

      if (initialData.coreStart || initialData.coreEnd) {
        setCoreHours([
          { from: initialData.coreStart, to: initialData.coreEnd },
        ]);
      }
    }
  }, [isEdit, initialData, departmentOptions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleCoreHourChange = (index, key, value) => {
    const updated = [...coreHours];
    updated[index][key] = value;
    setCoreHours(updated);
    if (index === 0) {
      setForm({
        ...form,
        coreStart: key === "from" ? value : updated[0].from,
        coreEnd: key === "to" ? value : updated[0].to,
      });
    }
  };

  const addCoreHour = () => {
    setCoreHours([...coreHours, { from: "", to: "" }]);
  };

  const removeCoreHour = (index) => {
    const updated = [...coreHours];
    updated.splice(index, 1);
    setCoreHours(updated);
    if (index === 0) {
      setForm({ ...form, coreStart: "", coreEnd: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedForm = { ...form };
    cleanedForm.shiftAllowanceAmount =
      Number(cleanedForm.shiftAllowanceAmount) || 0;
    cleanedForm.departmentIds =
      cleanedForm.department?.map((d) => d.value) || [];

    if (!cleanedForm.isCoreHoursEnabled) {
      delete cleanedForm.coreStart;
      delete cleanedForm.coreEnd;
    }

    if (!cleanedForm.isShiftMarginEnabled) {
      delete cleanedForm.marginBeforeShift;
      delete cleanedForm.marginAfterShift;
    }

    delete cleanedForm.department;

    try {
      let res;
      if (isEdit === "Edit" && initialData?.id) {
        res = await axiosInstance.put(`/shift/${initialData.id}`, cleanedForm);
        toast.success("Shift updated successfully.");
      } else {
        res = await axiosInstance.post("/shift", cleanedForm);
        toast.success("Shift created successfully.");
      }
      onSuccess && onSuccess();

      // Reset form
      setForm({
        shiftName: "",
        shiftStart: "09:00",
        shiftEnd: "18:00",
        isShiftMarginEnabled: false,
        marginBeforeShift: "",
        marginAfterShift: "",
        isCoreHoursEnabled: false,
        coreStart: "",
        coreEnd: "",
        isWeekendBasedOnLocation: true,
        hasShiftAllowance: false,
        shiftAllowanceAmount: 0,
        department: null,
        departmentIds: [],
      });

      setCoreHours([{ from: "", to: "" }]);
      onClose(); // close modal
    } catch (error) {
      console.error("Error submitting shift:", error);
      toast.error(error?.response?.data?.message || "Failed to create shift.");
    }
  };

  return (
    <div
      className=" fixed  inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-h-[100vh] 
 overflow-y-auto  p-6 rounded-lg shadow-lg max-w-xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-6">
          {" "}
          {isEdit === "Edit" ? "Edit" : "New"} Shift
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shift Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            <div>
              <label className="font-medium">
                Shift name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="shiftName"
                value={form.shiftName}
                onChange={handleChange}
                placeholder="Shift Name"
                className="w-full mt-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>
            <div>
              <label className="font-medium">
                From <span className="text-red-600">*</span>
              </label>
              <input
                type="time"
                name="shiftStart"
                value={form.shiftStart}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="font-medium">
                To <span className="text-red-600">*</span>
              </label>
              <input
                type="time"
                name="shiftEnd"
                value={form.shiftEnd}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Shift Margin */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isShiftMarginEnabled"
                checked={form.isShiftMarginEnabled}
                onChange={handleChange}
              />
              <span className="font-medium">Shift Margin</span>
            </label>
            {form.isShiftMarginEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-gray-100 p-4 rounded">
                <div>
                  <label className="text-sm font-medium">
                    Before Shift{" "}
                    <span className="text-gray-500 text-xs">
                      (Format: HH:MM)
                    </span>
                  </label>
                  <input
                    type="time"
                    name="marginBeforeShift"
                    className="w-full mt-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.marginBeforeShift}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    After Shift{" "}
                    <span className="text-gray-500 text-xs">
                      (Format: HH:MM)
                    </span>
                  </label>
                  <input
                    type="time"
                    name="marginAfterShift"
                    value={form.marginAfterShift}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Core Working Hours */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isCoreHoursEnabled"
                checked={form.isCoreHoursEnabled}
                onChange={handleChange}
              />
              <span className="font-medium">Core Working Hours</span>
            </label>
            {form.isCoreHoursEnabled && (
              <div className="bg-gray-100 p-4 rounded space-y-3 mt-2">
                {coreHours.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-1.5">
                    <input
                      type="time"
                      value={slot.from}
                      onChange={(e) =>
                        handleCoreHourChange(index, "from", e.target.value)
                      }
                      className=" mt-1 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-gray-500 text-xs">
                      (Format: HH:MM)
                    </span>
                    <span>-</span>
                    <input
                      type="time"
                      value={slot.to}
                      onChange={(e) =>
                        handleCoreHourChange(index, "to", e.target.value)
                      }
                      className=" mt-1 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-gray-500 text-xs">
                      (Format: HH:MM)
                    </span>

                    <button
                      type="button"
                      onClick={() => removeCoreHour(index)}
                      className="text-red-500"
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCoreHour}
                  className="text-sm text-white bg-primary px-4 py-2 rounded hover:bg-secondary"
                >
                  + Add
                </button>
              </div>
            )}
          </div>

          {/* Weekend Option */}
          <div>
            <p className="font-medium mb-1">Weekends are based on</p>
            <label className="mr-4">
              <input
                type="radio"
                name="isWeekendBasedOnLocation"
                checked={form.isWeekendBasedOnLocation}
                onChange={() =>
                  setForm({ ...form, isWeekendBasedOnLocation: true })
                }
              />{" "}
              Location
            </label>
            <label>
              <input
                type="radio"
                name="isWeekendBasedOnLocation"
                checked={!form.isWeekendBasedOnLocation}
                onChange={() =>
                  setForm({ ...form, isWeekendBasedOnLocation: false })
                }
              />{" "}
              Shift
            </label>
          </div>

          {/* Shift Allowance */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="hasShiftAllowance"
                checked={form.hasShiftAllowance}
                onChange={handleChange}
              />
              <span className="font-medium">Provide shift allowance</span>
            </label>
            {form.hasShiftAllowance && (
              <div className="bg-gray-100 mt-2 p-4 rounded">
                <label className="font-medium">Rate per day</label>
                <input
                  type="number"
                  name="shiftAllowanceAmount"
                  value={form.shiftAllowanceAmount}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
          </div>

          {/* Eligibility */}
          <div>
            <p className="font-medium">Eligibility Criteria</p>
            <p className="text-sm text-gray-500">
              Select the shift eligibility criteria. To assign this shift to
              eligible employees, go to{" "}
              <strong>
                Operations &gt; Employee Shift Mapping &gt; Assign Shift
              </strong>
            </p>
            {showCriteria ? (
              <div className="bg-gray-100 p-4 rounded mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="font-medium w-full sm:w-1/3">
                  Departments
                </label>
                <div className="w-full">
                  <Select
                    options={departmentOptions}
                    value={form.department}
                    onChange={(selected) =>
                      setForm({ ...form, department: selected })
                    }
                    placeholder="Departments"
                    className="w-full"
                    isMulti
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCriteria(false)}
                  className="text-red-500"
                >
                  <FiTrash />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-4 text-sm bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
                onClick={() => setShowCriteria(true)}
              >
                + Add Criteria
              </button>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="border px-5 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-5 py-2 rounded hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShiftForm;
