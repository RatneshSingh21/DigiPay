import { useEffect, useState } from "react";
import Select from "react-select";

const differentlyAbledOptions = [
  { label: "None", value: "" },
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

const PersonalDetails = ({
  data = {},
  updateData = () => {},
  goNext = () => {},
}) => {
  const [form, setForm] = useState(data.personalDetails || {});

  useEffect(() => {
    setForm(data.personalDetails || {});
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setForm((prev) => ({ ...prev, [name]: selectedOption?.value || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData("personalDetails", form);
    goNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-12 py-8 bg-white shadow-xl rounded-2xl space-y-6"
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
          <label className="block text-sm font-medium">Employee Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth || ""}
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
            className="w-full px-4 py-2 uppercase border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            onChange={handleSelectChange}
            options={differentlyAbledOptions}
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

        {/* State */}
        <div>
          <label className="block text-sm font-medium">State</label>
          <Select
            name="state"
            value={stateOptions.find((opt) => opt.value === form.state) || null}
            onChange={handleSelectChange}
            options={stateOptions}
            isClearable
            className="react-select-container"
            classNamePrefix="select"
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
      </div>

      {/* Address */}

      {/* Address Line 1 & 2 in the same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* Submit */}
      <div className="flex justify-between mt-6">
        <button
          type="submit"
          className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded"
        >
          Save and Continue
        </button>
      </div>
    </form>
  );
};

export default PersonalDetails;
