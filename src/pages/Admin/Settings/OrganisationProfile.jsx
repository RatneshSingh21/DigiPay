import { format } from "date-fns"; 
import { useEffect, useState } from "react";
import Select from 'react-select'
import axiosInstance from "../../../axiosInstance/axiosInstance";
import FilingAddressModal from "../Organization/FilingAddressModal";
import { Pencil } from "lucide-react";
import { FiUpload } from "react-icons/fi";
import { MdContactPhone } from "react-icons/md";

const OrganisationProfile = () => {

  const [orgCode, setOrgCode] = useState("");
  const [dateFormat, setDateFormat] = useState(null);
  const [organizationData, setOrganizationData] = useState({
    technology: "",
  });
  const [orgAddress, setOrgAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: null,
    pinCode: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const [selectedState, setSelectedState] = useState(null);
  const [filingAddress, setFilingAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);

  const indianStates = [
    "Andhra Pradesh",
    "Bihar",
    "Delhi",
    "Uttar Pradesh",
    "West Bengal",
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Punjab",
    "Gujarat",
    "Rajasthan",
    "Kerala",
    "Haryana",
    "Assam",
    "Goa",
    "Madhya Pradesh",
    "Odisha",
    "Jharkhand",
    "Chhattisgarh",
    "Uttarakhand",
    "Himachal Pradesh",
    "Telangana",
    "Tripura",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Ladakh",
    "Jammu and Kashmir",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Puducherry",
    "Lakshadweep",
  ];

  const [stateOptions] = useState(
    indianStates.map((state) => ({ label: state, value: state }))
  );

  const today = new Date();  

  const dateFormatConfig = {
    short: [
      { label: `MM.dd.yy [${format(today, "MM.dd.yy")}]`, value: "MM.dd.yy" },
      { label: `dd.MM.yy [${format(today, "dd.MM.yy")}]`, value: "dd.MM.yy" },
      { label: `yy.MM.dd [${format(today, "yy.MM.dd")}]`, value: "yy.MM.dd" },
    ],
    medium: [
      {
        label: `MM.dd.yyyy [${format(today, "MM.dd.yyyy")}]`,
        value: "MM.dd.yyyy",
      },
      {
        label: `dd.MM.yyyy [${format(today, "dd.MM.yyyy")}]`,
        value: "dd.MM.yyyy",
      },
      {
        label: `yyyy.MM.dd [${format(today, "yyyy.MM.dd")}]`,
        value: "yyyy.MM.dd",
      },
    ],
    long: [
      {
        label: format(today, "dd MMM yyyy"),
        value: format(today, "dd MMM yyyy"),
      },
      {
        label: format(today, "dd MMMM yyyy"),
        value: format(today, "dd MMMM yyyy"),
      },
      {
        label: format(today, "MMMM dd, yyyy"),
        value: format(today, "MMMM dd, yyyy"),
      },
      {
        label: format(today, "EEE, MMMM dd, yyyy"),
        value: format(today, "EEE, MMMM dd, yyyy"),
      },
      {
        label: format(today, "EEEE, MMMM dd, yyyy"),
        value: format(today, "EEEE, MMMM dd, yyyy"),
      },
    ],
  };

  const [dateFormatOptions] = useState(
    Object.entries(dateFormatConfig).map(([key, formats]) => ({
      label: key,
      options: formats,
    }))
  );

  const technologies = [
    "Agency or Sales House",
    "Agriculture",
    "Art and Design",
    "Automotive",
    "Construction",
    "Telecommunications",
    "Travel/Hospitality",
    "Web Designing",
    "Web Development",
    "Writers",
  ];

  const [technologyOptions] = useState(
    technologies.map((tech) => ({ label: tech, value: tech }))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      orgCode,
      dateFormat: dateFormat?.value || null,
      ...organizationData,
    };
    console.log("Submitted Data:", data);
  };

  useEffect(() => {
    axiosInstance
      .get("/WorkLocation")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setAddressOptions(res.data);
          setFilingAddress(res.data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch filing address:", err);
      })
      .finally(() => {
        setLoadingAddress(false);
      });
  }, []);
  useEffect(() => {
    if (filingAddress) {
      setOrgAddress({
        line1: filingAddress.addressLine1 || "",
        line2: filingAddress.addressLine2 || "",
        city: filingAddress.city || "",
        state:
          stateOptions.find((opt) => opt.value === filingAddress.state) || null,
        pinCode: filingAddress.pinCode || "",
      });
    }
  }, [filingAddress, stateOptions]);

  return (
    <>
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10">
        <h2 className="font-semibold text-xl">Organisation Profile</h2>
      </div>
       <div className="p-6 bg-white rounded-lg space-y-10">
      {/* Organisation Logo */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Organisation Logo
  </label>
  <div className="flex items-start gap-6">
    <div
      className="w-40 h-40 border border-dashed border-gray-300 rounded-md relative overflow-hidden bg-gray-50 cursor-pointer"
      onClick={() => document.getElementById("logo-upload").click()}
    >
      {logoPreview ? (
        <img
          src={logoPreview}
          alt="Logo Preview"
          className="w-full h-full"
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600">
          <FiUpload size={20} />
          <span className="text-xs mt-1">Upload Logo</span>
        </div>
      )}
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        id="logo-upload"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>

    <div className="text-sm text-gray-600">
      <p className="mb-1">
        This logo will be displayed on documents such as Payslip and TDS
        Worksheet.
      </p>
      <p className="text-gray-500">
        Preferred Image Size: 240 × 240 pixels @ 72 DPI, Maximum size of 1MB.
      </p>
      <p className="text-gray-500">File Formats: PNG, JPG, and JPEG</p>
    </div>
  </div>
</div>

      {/* Organisation Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organisation Name <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-indigo-600 mb-2">
          This is your registered business name which will appear in all the
          forms and payslips.
        </p>
        <input
          type="text"
          className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter Organization Name "
        />
      </div>

      {/* Business Location & Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Location <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            disabled
          >
            <option>India</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Technology"
            className="react-select-container"
            classNamePrefix="react-select"
            options={technologyOptions}
            value={technologyOptions.find(
              (option) => option.value === organizationData.technology
            )}
            onChange={(selected) =>
              setOrganizationData((prev) => ({
                ...prev,
                technology: selected.value,
              }))
            }
          />
        </div>
      </div>

      {/* Date Format & Field Separator */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <Select
          options={dateFormatOptions}
          value={dateFormat}
          onChange={setDateFormat}
          placeholder="Select a date"
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Organisation Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organisation Address <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This will be considered as the address of your primary work location.
        </p>
        <input
          type="text"
          value={orgAddress.line1}
          placeholder="Noida Sector-53"
          className="w-full px-4 py-2 mb-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          value={orgAddress.line2}
          placeholder="Address Line 2"
          className="w-full px-4 py-2 mb-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            placeholder="Select State"
            options={stateOptions}
            value={orgAddress.state}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <input
            type="text"
            value={orgAddress.city}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="text"
            value={orgAddress.pinCode}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      {/* Filing Address */}
      <div>
        <h3 className="text-sm font-medium text-gray-800 mb-1">
          Filing Address
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          This registered address will be used across all Forms and Payslips.
        </p>

        {loadingAddress ? (
          <p className="text-sm text-gray-500">Loading address...</p>
        ) : filingAddress ? (
          <div className="bg-white border rounded-lg p-4 shadow-sm w-full md:w-96">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">
                {filingAddress.name}
              </h4>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center text-blue-600 text-sm hover:underline"
              >
                <Pencil size={14} className="mr-1" />
                Change
              </button>
            </div>
            <p className="text-sm text-gray-800">
              {filingAddress.addressLine1}
            </p>
            <p className="text-sm text-gray-800">
              {filingAddress.city}, {filingAddress.state}{" "}
              {filingAddress.pinCode}
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-500">No address found.</p>
        )}
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📇 Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Contact Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-100 text-indigo-700 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                D
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">
                  DigiCode Software
                </p>
                <p className="text-sm text-gray-600">
                  support@digicodesoftware.com
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              This email is your primary contact and receives all
              payroll-related updates.
            </p>
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg px-4 py-3">
              Since this is a public domain email, emails will be sent via{" "}
              <br />
              <strong>info@digicodesoftware.com</strong> to prevent spam.
            </div>
          </div>

          {/* Email Sender Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center text-xl">
                📧
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">
                  Sender Settings
                </p>
                <p className="text-sm text-gray-600">
                  How emails are delivered
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              You can customize the email addresses used for sending payroll
              emails.
            </p>
            <p className="text-sm text-gray-900">
              Default Sender:
              <br />
              <strong>info@digicodesoftware.com</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Save */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={handleSubmit}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary"
        >
          Save
        </button>
        <p className="text-sm text-red-500">* indicates mandatory fields</p>
      </div>
      <FilingAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filingOptions={addressOptions}
        selected={filingAddress}
        onSave={(addr) => setFilingAddress(addr)}
      />
    </div>
  
    </>
  );
};

export default OrganisationProfile;
