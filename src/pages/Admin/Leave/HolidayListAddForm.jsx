import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const HolidayListAddForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [workLocations, setWorkLocations] = useState([]);
  const [formData, setFormData] = useState({
    holidayName: "",
    holidayDate: "",
    holidayType: "",
    isOptional: false,
    isRecurring: false,
    workLocationId: "",
    isActive: true,
    isRestricted: false,
    description: "",
  });

  useEffect(() => {
    axiosInstance
      .get("/WorkLocation")
      .then((res) => setWorkLocations(res.data))
      .catch(() => toast.error("Failed to fetch work locations"));
  }, []);

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        ...initialData,
        holidayDate: initialData.holidayDate?.split("T")[0] || "",
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSelectChange = (name, option) =>
    setFormData((p) => ({ ...p, [name]: option ? option.value : "" }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      ...(isEdit === "Edit"
        ? { updatedBy: user?.userId, updatedOn: new Date().toISOString() }
        : { createdBy: user?.userId, updatedBy: 0, createdOn: new Date().toISOString() }),
    };

    try {
      await axiosInstance.post("/HolidayListMaster/create-or-update", payload);
      toast.success("Holiday Saved Successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving Holiday");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () =>
    setFormData({
      holidayName: "",
      holidayDate: "",
      holidayType: "",
      isOptional: false,
      isRecurring: false,
      workLocationId: "",
      isActive: true,
      isRestricted: false,
      description: "",
    });

  const inputClass =
    "w-full border rounded-lg px-3 py-2 text-xs border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400";

  const renderInput = (label, name, type = "text", required = false) => (
    <div>
      <label className="block text-gray-700 font-medium text-sm mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={inputClass}
        required={required}
      />
    </div>
  );

  const renderSelect = (label, name, options, required = false) => (
    <div>
      <label className="block text-gray-700 font-medium text-sm mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        options={options}
        value={
          formData[name]
            ? options.find((opt) => opt.value === String(formData[name])) || null
            : null
        }
        onChange={(selected) => handleSelectChange(name, selected)}
        placeholder={`Select ${label}`}
        isClearable
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "34px",
            height: "34px",
            borderColor: "#93c5fd",
            fontSize: "0.75rem",
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0 6px",
          }),
          input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: "30px",
          }),
        }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-2xl relative overflow-y-scroll max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {isEdit === "Edit" ? "Edit Holiday" : "New Holiday"}
        </h2>

        <form className="space-y-1" onSubmit={handleSubmit}>
          {renderInput("Holiday Name", "holidayName", "text", true)}
          {renderInput("Holiday Date", "holidayDate", "date", true)}

          {renderSelect(
            "Holiday Type",
            "holidayType",
            [
              { value: "Festival", label: "Festival" },
              { value: "National", label: "National" },
              { value: "Public", label: "Public" },
              { value: "Other", label: "Other" },
            ],
            true
          )}

          {renderSelect(
            "Work Location",
            "workLocationId",
            workLocations.map((loc) => ({
              value: String(loc.id),
              label: `${loc.name} (${loc.city})`,
            })),
            true
          )}

          <div>
            <label className="block text-gray-700 font-medium text-sm mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write description here..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "isOptional", label: "Optional" },
              { name: "isRecurring", label: "Recurring" },
              { name: "isActive", label: "Active" },
              { name: "isRestricted", label: "Restricted" },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={name}
                  checked={formData[name]}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 cursor-pointer rounded-lg text-white text-sm ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? <Spinner /> : "Save"}
            </button>

            <button
              type="reset"
              onClick={clearForm}
              className="border cursor-pointer border-gray-300 text-gray-700 px-5 py-2 text-sm rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          </div>

          <p className="text-xs text-red-500 mt-1">* Indicates mandatory fields</p>
        </form>
      </div>
    </div>
  );
};

export default HolidayListAddForm;
