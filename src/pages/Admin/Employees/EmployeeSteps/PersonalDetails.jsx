import { useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";
import Spinner from "../../../../components/Spinner";

// Convert ISO datetime to yyyy-MM-dd for input[type="date"]
const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const differentlyAbledOptions = [
  { label: "None", value: "None" },
  { label: "Visually Impaired", value: "Visually Impaired" },
  { label: "Hearing Impaired", value: "Hearing Impaired" },
  { label: "Locomotor Disability", value: "Locomotor Disability" },
  { label: "Other", value: "Other" },
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Lakshadweep",
  "Puducherry",
];

const stateOptions = indianStates.map((state) => ({
  label: state,
  value: state,
}));

const PersonalDetails = () => {
  const {
    employeeId,
    personalDetails,
    setStepData,
    setCurrentStep,
    totalSteps,
    basicDetails,
  } = useAddEmployeeStore();

  const [form, setForm] = useState(personalDetails || {});
  const [isEdit, setIsEdit] = useState(!!personalDetails && personalDetails.employeeId); // edit if store already has data
  const [loading, setLoading] = useState(false);

  if (!basicDetails) return null;

  const fullName = `${basicDetails.firstName || ""} ${
    basicDetails.lastName || ""
  }`.trim();
  const employeeCode = basicDetails.employeeId || "N/A";
  const email = basicDetails.workEmail || "N/A";
  const departmentName = basicDetails.department?.label || "N/A";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setForm((prev) => ({ ...prev, [name]: selectedOption?.value || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error("No employee selected. Please add basic details first.");
      return;
    }

    try {
      setLoading(true);
      let response;
      if (isEdit) {
        response = await axiosInstance.put(`/PersonalDetails/update`, {
          employeeId,
          ...form,
        });
        toast.success("Personal details updated successfully!");
      } else {
        response = await axiosInstance.post(`/PersonalDetails/save`, {
          employeeId,
          ...form,
        });
        toast.success("Personal details added successfully!");
        setIsEdit(true); // switch to edit mode after creation
      }

      // Update store
      setStepData("personalDetails", response.data);

      // Move to next step
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } catch (error) {
      console.error("Error saving personal details:", error);
      toast.error(
        error.response?.data?.message || "Failed to save personal details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Employee summary */}
      <div className="p-4 bg-white rounded-xl shadow mb-4">
        <h2 className="text-lg font-semibold text-green-600 mb-2">
          Employee Summary :
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
          <p>
            <span className="font-medium">Employee Code:</span> {employeeCode}
          </p>
          <p>
            <span className="font-medium">Full Name:</span> {fullName}
          </p>
          <p>
            <span className="font-medium">Email:</span> {email}
          </p>
          <p>
            <span className="font-medium">Department:</span> {departmentName}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="px-12 py-4 bg-white rounded-xl shadow space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Father's Name */}
          <div>
            <label className="block text-sm font-medium">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={form.fatherName || ""}
              onChange={handleChange}
              placeholder="Enter Father's Name"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium">
              Employee Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formatDateForInput(form.dateOfBirth) || ""}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-medium">PAN Number</label>
            <input
              type="text"
              name="pan"
              value={form.pan || ""}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              maxLength={10}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Personal Email */}
          <div>
            <label className="block text-sm font-medium">Personal Email</label>
            <input
              type="email"
              name="personalEmailAddress"
              value={form.personalEmailAddress || ""}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Differently Abled Type */}
          <div>
            <label className="block text-sm font-medium">
              Differently Abled Type
            </label>
            <Select
              name="differentlyAbledType"
              value={
                differentlyAbledOptions.find(
                  (opt) => opt.value === form.differentlyAbledType
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange(selectedOption, {
                  name: "differentlyAbledType",
                })
              }
              options={differentlyAbledOptions}
              isClearable
              className="react-select-container"
              classNamePrefix="select"
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={form.addressLine1 || ""}
              onChange={handleChange}
              placeholder="House No, Street"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={form.addressLine2 || ""}
              onChange={handleChange}
              placeholder="Locality, Landmark"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              name="city"
              value={form.city || ""}
              onChange={handleChange}
              placeholder="Enter city"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium">State</label>
            <Select
              name="state"
              value={
                stateOptions.find((opt) => opt.value === form.state) || null
              }
              onChange={handleSelectChange}
              options={stateOptions}
              isClearable
              className="react-select-container"
              classNamePrefix="select"
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium">Pin Code</label>
            <input
              type="text"
              name="pinCode"
              value={form.pinCode || ""}
              onChange={handleChange}
              placeholder="110001"
              maxLength={6}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center cursor-pointer justify-center gap-2 bg-primary text-white px-6 py-2 rounded-full ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
          }`}
        >
          {loading && <Spinner />}
          <span>Save and Continue</span>
        </button>
      </form>
    </>
  );
};

export default PersonalDetails;
