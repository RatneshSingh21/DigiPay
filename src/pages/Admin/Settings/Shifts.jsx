// Required libraries: react, react-select, tailwindcss

import { useState, useEffect } from "react";
import Select from "react-select";
import { FiDownload, FiTrash } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const Shifts = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  // const [departments, setDepartments] = useState([]);
  // const [isEdit, setIsEdit] = useState("Add");
  // const [selectedDepartment, setSelectedDepartment] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedDepartment(null);
  };

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

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
      await axiosInstance.post("/shift", cleanedForm);
      toast.success("Shift created successfully.");

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
    } catch (error) {
      console.error("Error submitting shift:", error);
      toast.error(error?.response?.data?.message || "Failed to create shift.");
    }
  };

  return (
    <>
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Add Shifts</h2>
        {/* {departments.length > 0 && ( */}
        {/* <div className="flex gap-2 items-center">
          <button
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
            onClick={() => {
              setIsEdit("Add");
              setSelectedDepartment(null);
              openModal();
            }}
          >
            Add Shift
          </button>
          <button
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            onClick={openImport}
          >
            <FiDownload />
            Import
          </button>
        </div> */}
        {/* )} */}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow max-w-4xl mx-auto"
      >
        {/* Shift Name, Start, End Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="font-medium">
              Shift name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="shiftName"
              value={form.shiftName}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="font-medium">
              From <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              name="shiftStart"
              value={form.shiftStart}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="font-medium">
              To <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              name="shiftEnd"
              value={form.shiftEnd}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Shift Margin */}
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isShiftMarginEnabled"
              checked={form.isShiftMarginEnabled}
              onChange={handleChange}
            />
            <span className="font-medium">Shift Margin</span>
          </label>
          {form.isShiftMarginEnabled && (
            <div className="mt-2 bg-gray-100 p-4 rounded space-y-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">
                  Before Shift{" "}
                  <span className="text-gray-500 text-xs">(Format: HH:MM)</span>
                </label>
                <input
                  type="time"
                  name="marginBeforeShift"
                  value={form.marginBeforeShift}
                  onChange={handleChange}
                  className="border p-2 rounded focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">
                  After shift{" "}
                  <span className="text-gray-500 text-xs">(Format: HH:MM)</span>
                </label>
                <input
                  type="time"
                  name="marginAfterShift"
                  value={form.marginAfterShift}
                  onChange={handleChange}
                  className="border p-2 rounded focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Core Working Hours */}
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isCoreHoursEnabled"
              checked={form.isCoreHoursEnabled}
              onChange={handleChange}
            />
            <span className="font-medium">Core Working Hours</span>
          </label>
          {form.isCoreHoursEnabled && (
            <div className="mt-2 bg-gray-100 p-4 rounded space-y-3">
              {coreHours.map((slot, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="time"
                    value={slot.from}
                    onChange={(e) =>
                      handleCoreHourChange(index, "from", e.target.value)
                    }
                    className="p-2 border rounded  focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-gray-500 text-xs">(Format: HH:MM)</span>
                  <span>-</span>
                  <input
                    type="time"
                    value={slot.to}
                    onChange={(e) =>
                      handleCoreHourChange(index, "to", e.target.value)
                    }
                    className="p-2 border rounded  focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-gray-500 text-xs">(Format: HH:MM)</span>
                  <button
                    type="button"
                    onClick={() => removeCoreHour(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCoreHour}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                + Add
              </button>
            </div>
          )}
        </div>

        {/* Weekend Based On */}
        <div className="mt-6">
          <p className="font-medium mb-2">Weekends are based on</p>
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
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="hasShiftAllowance"
              checked={form.hasShiftAllowance}
              onChange={handleChange}
            />
            <span className="font-medium">Provide shift allowance</span>
          </label>
          {form.hasShiftAllowance && (
            <div className="mt-2 bg-gray-100 p-4 rounded">
              <label className="font-medium">Rate per day</label>
              <input
                type="number"
                name="shiftAllowanceAmount"
                value={form.shiftAllowanceAmount}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded  focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter amount"
              />
            </div>
          )}
        </div>

        {/* Eligibility Criteria */}
        <div className="mt-6">
          <p className="font-medium">Eligibility Criteria</p>
          <p className="text-sm text-gray-500">
            Select the shift eligibility criteria. To assign this shift to
            eligible employees, go to{" "}
            <strong>
              Operations &gt; Employee Shift Mapping &gt; Assign Shift
            </strong>
          </p>

          {showCriteria ? (
            <div className="bg-gray-100 p-4 rounded flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
                <label className="font-medium sm:w-1/3">Departments</label>
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
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCriteria(false)}
                className="text-red-500 hover:text-red-700 mt-2 sm:mt-0"
              >
                <FiTrash />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              onClick={() => setShowCriteria(true)}
            >
              + Add Criteria
            </button>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            className="border border-gray-300 px-5 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
};

export default Shifts;
