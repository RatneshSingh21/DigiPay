import { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";
import Spinner from "../../../../components/Spinner";

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
};

const differentlyAbledOptions = [
  { label: "None", value: "None" },
  { label: "Visually Impaired", value: "Visually Impaired" },
  { label: "Hearing Impaired", value: "Hearing Impaired" },
  { label: "Locomotor Disability", value: "Locomotor Disability" },
  { label: "Other", value: "Other" },
];

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands",
  "Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi",
  "Lakshadweep","Puducherry"
];

const stateOptions = indianStates.map((state) => ({
  value: state,
  label: state,
}));

export default function PersonalDetails() {
  const {
    employeeId,
    personalDetails,
    setStepData,
    setCurrentStep,
    totalSteps,
    basicDetails,
  } = useAddEmployeeStore();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  // ---------------------------------------
  // 1️⃣ Fetch data when user returns to step
  // ---------------------------------------
  useEffect(() => {
    if (!employeeId) return;
    fetchPersonalDetails();
  }, [employeeId]);

  const fetchPersonalDetails = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get(`/PersonalDetails/${employeeId}`);

      if (response.data) {
        setForm(response.data);
        setStepData("personalDetails", response.data);

        setIsEdit(true); // existing data found
      } else {
        setForm({});
        setIsEdit(false);
      }
    } catch (err) {
      console.error("GET personal details failed:", err);
    } finally {
      setFetching(false);
    }
  };

  // ---------------------------------------
  // Input Handlers
  // ---------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, { name }) => {
    setForm((prev) => ({ ...prev, [name]: value?.value || "" }));
  };

  // ---------------------------------------
  // 2️⃣ Submit Handler (POST + PUT)
  // ---------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error("Please fill Basic Details first.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        employeeId,
        dateOfBirth: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : null,
      };

      let response;

      if (isEdit) {
        response = await axiosInstance.put("/PersonalDetails/update", payload);
        toast.success("Personal details updated!");
      } else {
        response = await axiosInstance.post("/PersonalDetails/save", payload);
        toast.success("Personal details saved!");
        setIsEdit(true);
      }

      // Save returned payload to state
      setStepData("personalDetails", response.data);
      setForm(response.data);

      // Go to next step
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error.response?.data?.message || "Save failed!");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // Loading skeleton
  // ---------------------------------------
  if (fetching) return <div className="p-6"><Spinner /></div>;

  if (!basicDetails) return null;

  const fullName = `${basicDetails.firstName || ""} ${basicDetails.lastName || ""}`;
  const departmentName = basicDetails.department?.label || "-";

  return (
    <>
      {/* Employee summary */}
      <div className="p-4 bg-white rounded-xl shadow mb-4">
        <h2 className="text-lg font-semibold text-green-600 mb-2">
          Employee Summary :
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
          <p><strong>Employee Code:</strong> {basicDetails.employeeId}</p>
          <p><strong>Full Name:</strong> {fullName}</p>
          <p><strong>Email:</strong> {basicDetails.workEmail}</p>
          <p><strong>Department:</strong> {departmentName}</p>
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
          <Input
            label="Father's Name"
            name="fatherName"
            value={form.fatherName || ""}
            onChange={handleChange}
            placeholder="Enter Father's Name"
          />

          {/* Date of Birth */}
          <Input
            type="date"
            label="Date of Birth"
            name="dateOfBirth"
            required
            value={formatDateForInput(form.dateOfBirth)}
            onChange={handleChange}
          />

          <Input
            label="PAN Number"
            name="pan"
            maxLength={10}
            value={form.pan || ""}
            placeholder="ABCDE1234F"
            onChange={handleChange}
          />

          <Input
            type="email"
            label="Personal Email"
            name="personalEmailAddress"
            value={form.personalEmailAddress || ""}
            onChange={handleChange}
            placeholder="example@gmail.com"
          />

          {/* Differently Abled */}
          <SelectField
            label="Differently Abled Type"
            name="differentlyAbledType"
            value={form.differentlyAbledType}
            options={differentlyAbledOptions}
            onChange={handleSelectChange}
          />

          <Input
            label="Address Line 1"
            name="addressLine1"
            value={form.addressLine1 || ""}
            onChange={handleChange}
          />

          <Input
            label="Address Line 2"
            name="addressLine2"
            value={form.addressLine2 || ""}
            onChange={handleChange}
          />

          <Input
            label="City"
            name="city"
            value={form.city || ""}
            onChange={handleChange}
          />

          {/* State */}
          <SelectField
            label="State"
            name="state"
            value={form.state}
            options={stateOptions}
            onChange={handleSelectChange}
          />

          <Input
            label="Pin Code"
            name="pinCode"
            maxLength={6}
            value={form.pinCode || ""}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 bg-primary text-white px-6 py-2 rounded-full ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
          }`}
        >
          {loading && <Spinner />}
          <span>Save and Continue</span>
        </button>
      </form>
    </>
  );
}

// Reusable Input Component
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 border border-blue-300 rounded-md"
      />
    </div>
  );
}

// Reusable Select Component
function SelectField({ label, name, value, options, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Select
        name={name}
        value={options.find((o) => o.value === value) || null}
        onChange={(v) => onChange(v, { name })}
        options={options}
        isClearable
      />
    </div>
  );
}
