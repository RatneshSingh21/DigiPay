import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Lakshadweep", "Puducherry"
];

const stateOptions = indianStates.map((state) => ({
  label: state,
  value: state,
}));

const WorkLocationForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",
    pinCode: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData(initialData);
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    setLoading(true);

    try {
      let response;

      if (isEdit === "Edit" && formData.id) {
        response = await axiosInstance.put(`/WorkLocation/${formData.id}`, payload);
      } else {
        response = await axiosInstance.post("/WorkLocation", payload);
      }

      toast.success("Work Location Saved Successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving work location");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
            onClick={onClose}
          >
            &times;
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isEdit === "Edit" ? "Edit" : "New"} Work Location
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Work Location Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-gray-700 font-medium mb-1">
                Address<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                name="addressLine2"
                placeholder="Address Line 2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex gap-2">
                <div className="w-1/3">
                  <Select
                    options={stateOptions}
                    placeholder="Select State"
                    value={stateOptions.find((opt) => opt.value === formData.state)}
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: selectedOption?.value || "",
                      }))
                    }
                    classNamePrefix="react-select"
                  />
                </div>

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-1/3 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="text"
                  name="pinCode"
                  placeholder="PIN Code"
                  value={formData.pinCode}
                  onChange={handleChange}
                  className="w-1/3 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-start gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-primary hover:bg-secondary"
                }`}
              >
                {loading ? <Spinner /> : "Save"}
              </button>

              <button
                type="reset"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                onClick={() =>
                  setFormData({
                    name: "",
                    addressLine1: "",
                    addressLine2: "",
                    state: "",
                    city: "",
                    pinCode: "",
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
    </>
  );
};

export default WorkLocationForm;
