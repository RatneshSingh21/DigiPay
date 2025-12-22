import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import useAuthStore from "../../../store/authStore";

const OrganisationProfile = () => {
  const [loading, setLoading] = useState(true);
  const companyId = useAuthStore((state) => state.companyId);
  // options
  const [workLocationOptions, setWorkLocationOptions] = useState([]);

  // profile & ids
  const [organizationProfileId, setOrganizationProfileId] = useState(null);
  const [companyName, setCompanyName] = useState(""); // display only
  const [companyAddressId, setCompanyAddressId] = useState(null);

  // organization fields (editable text fields that are SENT only when changed)
  const [organizationData, setOrganizationData] = useState({
    businessCountry: "India",
    industry: "",
    companyEmail: "",
  });

  // address display-only (parsed from workLocationAddress string)
  const [orgAddress, setOrgAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pinCode: "",
    workLocationName: "",
  });

  // images
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [headerPreview, setHeaderPreview] = useState(null);
  const [headerFile, setHeaderFile] = useState(null);

  const [footerPreview, setFooterPreview] = useState(null);
  const [footerFile, setFooterFile] = useState(null);

  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  // Keep original server snapshot for change detection
  const originalProfileRef = useRef(null);

  // static options
  const stateOptions = [
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
  ].map((s) => ({ label: s, value: s }));

  const industryOptions = [
    // IT & Technology
    "Information Technology (IT)",
    "Software Development",
    "Web Development",
    "Web Designing",
    "Mobile App Development",
    "SaaS (Software as a Service)",
    "IT Services & Consulting",
    "Cyber Security",
    "AI / Machine Learning",
    "Data Analytics",

    // Business & Services
    "Professional Services",
    "Consulting",
    "Agency or Sales House",
    "Marketing & Advertising",
    "Digital Marketing",
    "Business Process Outsourcing (BPO)",
    "KPO / LPO",
    "Staffing & Recruitment",
    "Call Center",

    // Manufacturing & Industrial
    "Manufacturing",
    "Small Scale Manufacturing",
    "Large Scale Manufacturing",
    "Automobile Manufacturing",
    "Electronics Manufacturing",
    "Textile & Garments",
    "Steel & Metal Industry",
    "Chemical Manufacturing",
    "Pharmaceutical Manufacturing",
    "Plastic & Packaging",

    // Construction & Infrastructure
    "Construction",
    "Real Estate",
    "Infrastructure Development",
    "Architecture & Interior Design",
    "Civil Engineering",

    // Retail & Wholesale
    "Retail",
    "Wholesale",
    "E-commerce",
    "Online Marketplace",
    "FMCG",
    "Consumer Goods",

    // Finance & Legal
    "Banking",
    "Financial Services",
    "Accounting & Auditing",
    "Insurance",
    "Investment & Trading",
    "Legal Services",

    // Healthcare
    "Healthcare",
    "Hospital & Clinics",
    "Pharmaceuticals",
    "Medical Equipment",
    "Diagnostics & Labs",
    "Wellness & Fitness",

    // Education
    "Education",
    "Schools & Colleges",
    "EdTech",
    "Coaching & Training",
    "Online Learning",

    // Media & Creative
    "Media & Entertainment",
    "Art and Design",
    "Graphic Design",
    "Film & Production",
    "Photography",
    "Content Writing",
    "Writers",

    // Travel & Hospitality
    "Travel & Tourism",
    "Hospitality",
    "Hotels & Resorts",
    "Restaurants & Cafes",
    "Food & Beverage",

    // Logistics & Transport
    "Logistics",
    "Transportation",
    "Supply Chain Management",
    "Courier Services",
    "Warehousing",

    // Agriculture & Allied
    "Agriculture",
    "Agro-Based Industry",
    "Food Processing",
    "Dairy & Poultry",
    "Fisheries",

    // Energy & Utilities
    "Power & Energy",
    "Renewable Energy",
    "Oil & Gas",
    "Utilities",

    // Telecom & Networking
    "Telecommunications",
    "Networking Services",
    "Internet Service Provider (ISP)",

    // Government & NGO
    "Government",
    "Public Sector Undertaking (PSU)",
    "Non-Profit / NGO",
    "Trust / Society",

    // Miscellaneous
    "Startup",
    "MSME",
    "Freelancer / Individual",
    "Trading Company",
    "Import & Export",
    "Other",
  ].map((item) => ({ label: item, value: item }));

  // Parse the comma-separated workLocationAddress returned by your API:
  // "AddressLine1, AddressLine2, City, State, Pin"
  const parseWorkLocationAddress = (address = "") => {
    const parts = (address || "")
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p !== "");
    return {
      line1: parts[0] || "",
      line2: parts[1] || "",
      city: parts[2] || "",
      state: parts[3] || "",
      pinCode: parts[4] || "",
    };
  };

  // ---- fetch initial data ----
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // work locations (used for selecting CompanyAddressId)
        try {
          const wlRes = await axiosInstance.get("/WorkLocation");
          const wlList = wlRes.data || [];
          setWorkLocationOptions(
            wlList.map((w) => ({ label: w.name, value: w.id, raw: w }))
          );
        } catch (err) {
          console.error("Failed to fetch work locations", err);
        }

        // ---- fetch company name from Company master ----
        try {
          if (companyId) {
            const companyRes = await axiosInstance.get("/Company");
            const companyList = companyRes.data || [];

            const matchedCompany = companyList.find(
              (c) => Number(c.companyId) === Number(companyId)
            );

            if (matchedCompany) {
              setCompanyName(matchedCompany.companyName);
            }
          }
        } catch (err) {
          console.error("Failed to fetch company name", err);
        }

        // organization profile (if exists)
        try {
          const profileRes = await axiosInstance.get("/OrganizationProfile");
          const data = profileRes.data;

          if (data) {
            originalProfileRef.current = { ...data };

            setOrganizationProfileId(data.organizationProfileId ?? null);
            // setCompanyName(data.companyName ?? "");
            setCompanyAddressId(
              data.companyAddressId && data.companyAddressId > 0
                ? data.companyAddressId
                : null
            );

            setOrganizationData({
              businessCountry: data.businessCountry ?? "India",
              industry: data.industry ?? "",
              companyEmail: data.companyEmail ?? "",
            });

            // parse full address string from server into UI fields
            const parsedAddress = parseWorkLocationAddress(
              data.workLocationAddress || ""
            );
            setOrgAddress({
              ...parsedAddress,
              workLocationName: data.workLocationName || "",
            });

            setLogoPreview(data.orgLogo || null);
            setHeaderPreview(data.orgHeaderImage || null);
            setFooterPreview(data.orgFooterImage || null);
            setSignaturePreview(data.orgSignature || null);
          }
        } catch (err) {
          console.log("No Organization Profile found yet — ready for POST");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- file handling & previews ----
  const handleFileInput = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // optional: file size limit (1MB)
    const maxBytes = 1 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("File too large. Max 1 MB allowed.");
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ---- when user selects a new work location (companyAddressId) ----
  const handleWorkLocationChange = (selected) => {
    if (!selected) return;
    const raw = selected.raw || {};
    setCompanyAddressId(selected.value);

    // if WorkLocation object has structured fields, show them; else blank
    setOrgAddress({
      line1: raw.addressLine1 || raw.address || "",
      line2: raw.addressLine2 || "",
      city: raw.city || raw.name || "",
      state: raw.state || "",
      pinCode: raw.pinCode || raw.postalCode || "",
      workLocationName: raw.name || "",
    });
  };

  // ---- helper: determine which fields changed (for PATCH) ----
  const getChangedFields = () => {
    const original = originalProfileRef.current || {};
    const changed = {};

    // CompanyAddressId changed?
    if ((original.companyAddressId ?? null) !== (companyAddressId ?? null)) {
      if (companyAddressId && companyAddressId > 0)
        changed["companyAddressId"] = companyAddressId;
    }

    if (
      (original.businessCountry ?? "") !==
      (organizationData.businessCountry ?? "")
    ) {
      changed["businessCountry"] = organizationData.businessCountry ?? "";
    }

    if ((original.industry ?? "") !== (organizationData.industry ?? "")) {
      changed["industry"] = organizationData.industry ?? "";
    }

    if (
      (original.companyEmail ?? "") !== (organizationData.companyEmail ?? "")
    ) {
      changed["companyEmail"] = organizationData.companyEmail ?? "";
    }

    if (logoFile) changed["orgLogo"] = logoFile;
    if (headerFile) changed["orgHeaderImage"] = headerFile;
    if (footerFile) changed["orgFooterImage"] = footerFile;
    if (signatureFile) changed["orgSignature"] = signatureFile;

    return changed;
  };

  // ---- helper: build FormData for POST (create) ----
  const buildFormDataForPost = () => {
    const fd = new FormData();

    // Convert number to string
    if (companyAddressId && companyAddressId > 0)
      fd.append("companyAddressId", Number(companyAddressId));

    fd.append("businessCountry", organizationData.businessCountry ?? "");
    fd.append("industry", organizationData.industry ?? "");
    fd.append("companyEmail", organizationData.companyEmail ?? "");

    if (logoFile) fd.append("orgLogo", logoFile);
    if (headerFile) fd.append("orgHeaderImage", headerFile);
    if (footerFile) fd.append("orgFooterImage", footerFile);
    if (signatureFile) fd.append("orgSignature", signatureFile);

    return fd;
  };

  // ---- helper: build FormData for PATCH (partial) ----
  const buildFormDataForPatch = (changedFields) => {
    const fd = new FormData();

    // only append changed keys (backend UpdatePartialAsync expects only changed fields)
    Object.entries(changedFields).forEach(([k, v]) => {
      if (v instanceof File) {
        fd.append(k, v);
      } else {
        // ensure we append primitives as strings
        fd.append(k, String(v ?? ""));
      }
    });

    return fd;
  };

  // ---- handleSubmit ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // For both POST and PATCH, CompanyAddressId must be present (server requires it for POST, for PATCH it's optional but usually included)
    if (!companyAddressId || companyAddressId <= 0) {
      return toast.error("Select Work Location.");
    }

    const isPatch = !!organizationProfileId;

    if (!isPatch) {
      // CREATE (POST)
      const fd = buildFormDataForPost();

      // log payload
      console.log("===== FormData Payload Sent to API (POST) =====");
      for (let pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("========================================");

      try {
        await axiosInstance.post("/OrganizationProfile", fd);
        toast.success("Organization Profile created");
        // refetch/state refresh below
      } catch (err) {
        console.error(err?.response || err);
        toast.error("Failed to create Organization Profile");
        return;
      }
    } else {
      // UPDATE (PATCH) — partial, send only changed fields
      const changed = getChangedFields();

      // If nothing changed, avoid PATCH
      if (Object.keys(changed).length === 0) {
        toast.info("No changes to update.");
        return;
      }

      const fd = buildFormDataForPatch(changed);

      // log payload
      console.log("===== FormData Payload Sent to API (PATCH) =====");
      for (let pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("========================================");

      try {
        await axiosInstance.patch(
          `/OrganizationProfile/update/${organizationProfileId}`,
          fd
        );
        toast.success("Organization Profile updated");
      } catch (err) {
        console.error(err?.response || err);
        toast.error("Failed to update Organization Profile");
        return;
      }
    }

    // REFRESH profile to sync UI after a successful POST or PATCH
    try {
      const res = await axiosInstance.get("/OrganizationProfile");
      const data = res.data || {};
      originalProfileRef.current = { ...data };

      setOrganizationProfileId(data.organizationProfileId ?? null);
      setCompanyName(data.companyName ?? "");
      setCompanyAddressId(data.companyAddressId ?? null);

      setOrganizationData({
        businessCountry:
          data.businessCountry ?? organizationData.businessCountry,
        industry: data.industry ?? organizationData.industry,
        companyEmail: data.companyEmail ?? organizationData.companyEmail,
      });

      const parsedAddress = parseWorkLocationAddress(
        data.workLocationAddress || ""
      );
      setOrgAddress({
        ...parsedAddress,
        workLocationName: data.workLocationName || "",
      });

      setLogoPreview(data.orgLogo || logoPreview);
      setHeaderPreview(data.orgHeaderImage || headerPreview);
      setFooterPreview(data.orgFooterImage || footerPreview);
      setSignaturePreview(data.orgSignature || signaturePreview);
    } catch (err) {
      // ignore refetch errors
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div>
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10">
        <h2 className="font-semibold text-xl">Organisation Profile</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg space-y-8"
      >
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organisation Logo
          </label>
          <div className="flex items-start gap-6">
            <div
              className="w-40 h-40 border border-dashed border-gray-300 rounded-md relative overflow-hidden bg-gray-50 cursor-pointer"
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600">
                  <FiUpload size={20} />
                  <span className="text-xs mt-1">Upload Logo</span>
                </div>
              )}

              <input
                id="logo-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={(e) =>
                  handleFileInput(e, setLogoFile, setLogoPreview)
                }
              />
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-1">
                This logo will be displayed on documents such as Payslip and TDS
                Worksheet.
              </p>
              <p className="text-gray-500">
                Preferred Image Size: 240 × 240 px, Max 1MB.
              </p>
              <p className="text-gray-500">File Formats: PNG, JPG, JPEG</p>
            </div>
          </div>
        </div>

        {/* Company (display-only input) & Work Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={companyName}
              readOnly
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Location *
            </label>
            <Select
              options={workLocationOptions}
              value={
                workLocationOptions.find((w) => w.value === companyAddressId) ||
                null
              }
              onChange={handleWorkLocationChange}
              placeholder="Choose work location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Country
            </label>
            <input
              type="text"
              value={organizationData.businessCountry}
              onChange={(e) =>
                setOrganizationData((p) => ({
                  ...p,
                  businessCountry: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <Select
              options={industryOptions}
              value={
                industryOptions.find(
                  (i) => i.value === organizationData.industry
                ) || null
              }
              onChange={(sel) =>
                setOrganizationData((p) => ({
                  ...p,
                  industry: sel?.value || "",
                }))
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Email
            </label>
            <input
              type="email"
              value={organizationData.companyEmail}
              onChange={(e) =>
                setOrganizationData((p) => ({
                  ...p,
                  companyEmail: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Address (disabled, display-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organisation Address
          </label>
          <input
            type="text"
            value={orgAddress.line1}
            placeholder="Address Line 1"
            readOnly
            disabled
            className="w-full px-4 py-2 mb-2 border border-blue-300 rounded-md bg-gray-50"
          />
          <input
            type="text"
            value={orgAddress.line2}
            placeholder="Address Line 2"
            readOnly
            disabled
            className="w-full px-4 py-2 mb-2 border border-blue-300 rounded-md bg-gray-50"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              placeholder="State"
              options={stateOptions}
              value={
                stateOptions.find((s) => s.value === orgAddress.state) || null
              }
              isDisabled
            />
            <input
              type="text"
              value={orgAddress.city}
              readOnly
              disabled
              className="border p-2 rounded-md bg-gray-50"
            />
            <input
              type="text"
              value={orgAddress.pinCode}
              readOnly
              disabled
              className="border p-2 rounded-md bg-gray-50"
            />
          </div>
        </div>

        {/* Header / Footer / Signature images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              key: "header",
              label: "Header Image",
              preview: headerPreview,
              setFile: setHeaderFile,
              setPreview: setHeaderPreview,
            },
            {
              key: "footer",
              label: "Footer Image",
              preview: footerPreview,
              setFile: setFooterFile,
              setPreview: setFooterPreview,
            },
            {
              key: "signature",
              label: "Signature",
              preview: signaturePreview,
              setFile: setSignatureFile,
              setPreview: setSignaturePreview,
            },
          ].map(({ key, label, preview, setFile, setPreview }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <div className="flex items-center gap-4">
                <div className="w-48 h-20 border border-dashed rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt={label}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">No {label}</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileInput(e, setFile, setPreview)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-red-500">* indicates mandatory fields</p>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded cursor-pointer hover:bg-secondary"
          >
            Save
          </button>
        </div>
      </form>

      {/* Contact information (kept as in your previous UI) */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-indigo-600">📇</span> Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-100 text-indigo-700 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-xl font-semibold">D</span>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">
                  DigiCode Software
                </p>
                <p className="text-sm text-gray-600">
                  support@digicodesoftware.com
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              This email serves as your primary contact and receives all
              payroll-related updates and notifications.
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
              Since this is a public domain email, emails will be sent via{" "}
              <br />
              <strong>info@digicodesoftware.com</strong> to prevent spam.
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center text-xl">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">
                  Sender Settings
                </p>
                <p className="text-sm text-gray-600">
                  How emails are delivered
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              Customize which email addresses are used for sending payroll
              notifications and reports.
            </p>
            <p className="text-sm text-gray-900">
              Default Sender: <br />
              <strong>info@digicodesoftware.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationProfile;
