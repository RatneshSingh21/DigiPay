import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import useAuthStore from "../../../store/authStore";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const HolidayListAddForm = ({ onClose, isEdit, initialData, onSuccess }) => {
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

  const { user } = useAuthStore();

  // Load Work Locations
  useEffect(() => {
    const fetchWorkLocations = async () => {
      try {
        const res = await axiosInstance.get("/WorkLocation");
        setWorkLocations(res.data);
      } catch (error) {
        toast.error("Failed to fetch work locations");
      }
    };
    fetchWorkLocations();
  }, []);

  // If editing, load initial data
  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        ...initialData,
        holidayDate: initialData.holidayDate
          ? initialData.holidayDate.split("T")[0]
          : "",
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // react-select value setter
  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let payload;
    if (isEdit === "Edit") {
      payload = {
        ...formData,
        holidayId: formData.holidayId,
        updatedBy: user?.userId,
        updatedOn: new Date().toISOString(),
      };
    } else {
      payload = {
        ...formData,
        createdBy: user?.userId,
        updatedBy: 0,
        createdOn: new Date().toISOString(),
      };
    }

    try {
      await axiosInstance.post("/HolidayListMaster/create-or-update", payload);
      toast.success("Holiday Saved Successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving Holiday");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4 "
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-2xl relative  overflow-y-scroll max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {isEdit === "Edit" ? "Edit Holiday" : "New Holiday"}
        </h2>

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          {/* Holiday Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Holiday Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="holidayName"
              value={formData.holidayName}
              onChange={handleChange}
              placeholder="Holiday Name"
              autoFocus
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Holiday Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Holiday Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="holidayDate"
              value={formData.holidayDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Holiday Type (React Select) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Holiday Type<span className="text-red-500">*</span>
            </label>
            <Select
              options={[
                { value: "Festival", label: "Festival" },
                { value: "National", label: "National" },
                { value: "Public", label: "Public" },
                { value: "Other", label: "Other" },
              ]}
              value={
                formData.holidayType
                  ? {
                      value: formData.holidayType,
                      label: formData.holidayType,
                    }
                  : null
              }
              onChange={(selected) =>
                handleSelectChange("holidayType", selected)
              }
              placeholder="Select Type"
              isClearable
            />
          </div>

          {/* Work Location (React Select) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Work Location<span className="text-red-500">*</span>
            </label>
            <Select
              options={workLocations.map((loc) => ({
                value: String(loc.id),
                label: `${loc.name} (${loc.city})`,
              }))}
              value={
                formData.workLocationId
                  ? workLocations
                      .map((loc) => ({
                        value: String(loc.id),
                        label: `${loc.name} (${loc.city})`,
                      }))
                      .find(
                        (opt) => opt.value === String(formData.workLocationId)
                      )
                  : null
              }
              onChange={(selected) =>
                handleSelectChange("workLocationId", selected)
              }
              placeholder="Select Location"
              isClearable
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write description here..."
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "isOptional", label: "Optional" },
              { name: "isRecurring", label: "Recurring" },
              { name: "isActive", label: "Active" },
              { name: "isRestricted", label: "Restricted" },
            ].map((item) => (
              <label key={item.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-start gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white cursor-pointer ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? <Spinner /> : "Save"}
            </button>

            <button
              type="reset"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                setFormData({
                  holidayId: "",
                  holidayName: "",
                  holidayDate: "",
                  holidayType: "",
                  isOptional: false,
                  isRecurring: false,
                  workLocationId: "",
                  isActive: true,
                  isRestricted: false,
                  description: "",
                  createdBy: "",
                  updatedBy: "",
                  createdOn: "",
                  updatedOn: null,
                })
              }
            >
              Clear
            </button>
          </div>

          <p className="text-sm text-red-500 mt-1">
            * Indicates mandatory fields
          </p>
        </form>
      </div>
    </div>
  );
};

export default HolidayListAddForm;
