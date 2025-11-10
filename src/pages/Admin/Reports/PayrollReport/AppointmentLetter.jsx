import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import assets from "../../../../assets/assets";
import Select from "react-select";

const AppointmentLetterForm = () => {
  const certificateRef = useRef();

  const [useDefaultHeader, setUseDefaultHeader] = useState(true);
  const [useDefaultFooter, setUseDefaultFooter] = useState(true);
  const [customHeader, setCustomHeader] = useState(null);
  const [customFooter, setCustomFooter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [designationList, setDesignationList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [addressList, setAddressList] = useState([]);

  const [formData, setFormData] = useState({
    EmployeeName: "Ram Kumar",
    EmployeeEmail: "ram@gmail.com",
    FatherName: "Dinesh Kumar",
    DesignationId: "",
    DepartmentId: "",
    DateOfJoining: "",
    IssueDate: new Date().toISOString().slice(0, 10),
    SalaryComponentsJson: [],
    TermsAndConditions:
      "This appointment is subject to company rules and policies. Please adhere to all safety and operational guidelines.",
    acceptanceMessage:
      "Kindly confirm your acceptance and join our organization at your earliest convenience. We look forward to your valuable contribution.",

    OrganizationAddressId: "",
    signatureFile: null,
    companyLogoFile: null,
    organizationName: "DigiCode Software Pvt. Ltd.",
    organizationAddress: "123 Main Street, City, State, ZIP",
    authorizedPersonName: "Ramesh Verma",
    authorizedPersonDesignation: "HR Manager",
    authorizedPersonEmail: "hr@digicode.com",
  });

  // ===== Fetch Dropdown Data =====
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [designations, departments, addresses] = await Promise.all([
          axiosInstance.get("/Designation"),
          axiosInstance.get("/Department"),
          axiosInstance.get("/WorkLocation"),
        ]);
        setDesignationList(designations.data || []);
        setDepartmentList(departments.data || []);
        setAddressList(addresses.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdowns();
  }, []);

  // ===== Handle Change =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== File Upload =====
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === "header" || field === "footer") {
      const reader = new FileReader();
      reader.onloadend = () =>
        field === "header"
          ? setCustomHeader(reader.result)
          : setCustomFooter(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [field]: file }));
    }
  };

  // ===== Print Setup =====
  const handlePrint = useReactToPrint({
    contentRef: certificateRef,
    pageStyle: `
      @page { size: A4; margin: 0; }
      body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-container { width: 210mm; height: 297mm; margin: 0; box-sizing: border-box; }
    `,
  });

  // ===== Submit Handler =====
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (
          ["DateOfJoining", "IssueDate", "SalaryComponentsJson"].includes(key)
        )
          return;
        if (value !== null && value !== "") form.append(key, value);
      });

      // Convert dates to ISO
      if (formData.DateOfJoining)
        form.append(
          "DateOfJoining",
          new Date(formData.DateOfJoining).toISOString()
        );
      if (formData.IssueDate)
        form.append("IssueDate", new Date(formData.IssueDate).toISOString());

      // Convert salary components
      if (Array.isArray(formData.SalaryComponentsJson)) {
        form.append(
          "SalaryComponentsJson",
          JSON.stringify(formData.SalaryComponentsJson)
        );
      }

      await axiosInstance.post("/AppointmentLetter", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Appointment Letter submitted successfully!");
      setFormData((prev) => ({
        ...prev,
        EmployeeName: "",
        EmployeeEmail: "",
        FatherName: "",
        DesignationId: "",
        DepartmentId: "",
        DateOfJoining: "",
        SalaryComponentsJson: [],
        OrganizationAddressId: "",
        signatureFile: null,
        companyLogoFile: null,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit Appointment Letter");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== Header =====
  const Header = () => (
    <div className="print-header relative w-full">
      <img
        src={useDefaultHeader || !customHeader ? assets.Header : customHeader}
        alt="Header"
        className="w-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-between p-6">
        {formData.companyLogoFile && (
          <img
            src={
              formData.companyLogoFile instanceof File
                ? URL.createObjectURL(formData.companyLogoFile)
                : formData.companyLogoFile
            }
            alt="Logo"
            className="object-contain bg-white p-1 rounded shadow"
            style={{ height: `${formData.logoSize}px` }}
          />
        )}
        <div className="text-right">
          <h2 className="font-bold text-xl">{formData.organizationName}</h2>
          <p className="text-sm">{formData.organizationAddress}</p>
        </div>
      </div>
    </div>
  );

  // ===== Footer =====
  const Footer = () => (
    <div className="print-footer absolute bottom-0 w-full">
      <img
        src={useDefaultFooter || !customFooter ? assets.Footer : customFooter}
        alt="Footer"
        className="w-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-center p-4 font-medium text-sm">
        <p>{formData.organizationName}</p>
        <p>{formData.organizationAddress}</p>
      </div>
    </div>
  );

  // ===== Total Salary =====
  const totalSalary = formData.SalaryComponentsJson.reduce(
    (sum, comp) => sum + Number(comp.amount || 0),
    0
  );

  return (
    <div className="flex bg-gray-100">
      {/* ===== LEFT PANEL ===== */}
      <div className="w-1/3 bg-white shadow-md p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          Appointment Letter Editor
        </h2>

        

        {/* Header/Footer Uploads */}
        {["header", "footer"].map((type) => (
          <div key={type} className="mb-4">
            <label className="block font-semibold mb-1">
              {type.toUpperCase()} Options
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={
                  type === "header" ? useDefaultHeader : useDefaultFooter
                }
                onChange={() =>
                  type === "header"
                    ? setUseDefaultHeader(!useDefaultHeader)
                    : setUseDefaultFooter(!useDefaultFooter)
                }
              />
              <span>Use Default {type}</span>
            </div>
            {((type === "header" && !useDefaultHeader) ||
              (type === "footer" && !useDefaultFooter)) && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, type)}
                />
                {(type === "header" ? customHeader : customFooter) && (
                  <img
                    src={type === "header" ? customHeader : customFooter}
                    alt={`${type} preview`}
                    className="h-16 mt-2 object-contain"
                  />
                )}
              </>
            )}
          </div>
        ))}

        {/* Files */}
        {/* Company Logo + Live Size Adjustment */}
        <div className="mb-6 flex items-center justify-between space-x-4">
          {/* Left Side - Edit Fields */}
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "companyLogoFile")}
              className="w-full mb-2"
            />
            <label className="block text-sm font-medium mb-1">Logo Size</label>
            <input
              type="range"
              min="30"
              max="150"
              value={formData.logoSize}
              onChange={(e) =>
                setFormData({ ...formData, logoSize: +e.target.value })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current Size: {formData.logoSize}px
            </p>
          </div>

          {/* Right Side - Live Preview */}
          <div className="w-1/2 flex justify-center items-center border border-gray-300 rounded p-2 bg-gray-50">
            {formData.companyLogoFile ? (
              <img
                src={
                  formData.companyLogoFile instanceof File
                    ? URL.createObjectURL(formData.companyLogoFile)
                    : formData.companyLogoFile
                }
                alt="Logo Preview"
                className="object-contain bg-white p-1 rounded shadow"
                style={{ height: `${formData.logoSize}px` }}
              />
            ) : (
              <p className="text-xs text-gray-500">No logo uploaded</p>
            )}
          </div>
        </div>

        {/* Basic Info */}
        {[
          { name: "EmployeeName", label: "Employee Name" },
          { name: "EmployeeEmail", label: "Employee Email" },
          { name: "FatherName", label: "Father Name" },
        ].map(({ name, label }) => (
          <div key={name} className="mb-4">
            <label className="block font-semibold">{label}</label>
            <input
              type="text"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
        ))}

        {/* React Selects */}
        <div className="mb-4">
          <label className="block font-semibold">Designation</label>
          <Select
            options={designationList.map((d) => ({
              value: d.id,
              label: d.title || d.designationName,
            }))}
            value={
              designationList
                .map((d) => ({
                  value: d.id,
                  label: d.title || d.designationName,
                }))
                .find((opt) => opt.value === formData.DesignationId) || null
            }
            onChange={(sel) =>
              setFormData((p) => ({ ...p, DesignationId: sel?.value || "" }))
            }
            placeholder="Select Designation"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold">Department</label>
          <Select
            options={departmentList.map((d) => ({
              value: d.id,
              label: d.name || d.departmentName,
            }))}
            value={
              departmentList
                .map((d) => ({
                  value: d.id,
                  label: d.name || d.departmentName,
                }))
                .find((opt) => opt.value === formData.DepartmentId) || null
            }
            onChange={(sel) =>
              setFormData((p) => ({ ...p, DepartmentId: sel?.value || "" }))
            }
            placeholder="Select Department"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold">Organization Address</label>
          <Select
            options={addressList.map((a) => ({ value: a.id, label: a.name }))}
            value={
              addressList
                .map((a) => ({ value: a.id, label: a.name }))
                .find((opt) => opt.value === formData.OrganizationAddressId) ||
              null
            }
            onChange={(sel) =>
              setFormData((p) => ({
                ...p,
                OrganizationAddressId: sel?.value || "",
              }))
            }
            placeholder="Select Address"
          />
        </div>

        {/* Dates */}
        {["DateOfJoining", "IssueDate"].map((dateField) => (
          <div key={dateField} className="mb-4">
            <label className="block font-semibold">
              {dateField === "DateOfJoining" ? "Date of Joining" : "Issue Date"}
            </label>
            <input
              type="date"
              name={dateField}
              value={formData[dateField]}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
        ))}

        {/* Salary Components */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Salary Components</label>

          {formData.SalaryComponentsJson.map((comp, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                placeholder="Component Name"
                value={comp.componentName}
                onChange={(e) => {
                  const updated = [...formData.SalaryComponentsJson];
                  updated[index].componentName = e.target.value;
                  setFormData((p) => ({ ...p, SalaryComponentsJson: updated }));
                }}
                className="border p-2 rounded w-1/2"
              />
              <input
                type="number"
                placeholder="Amount"
                value={comp.amount}
                onChange={(e) => {
                  const updated = [...formData.SalaryComponentsJson];
                  updated[index].amount = e.target.value;
                  setFormData((p) => ({ ...p, SalaryComponentsJson: updated }));
                }}
                className="border p-2 rounded w-1/3"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = formData.SalaryComponentsJson.filter(
                    (_, i) => i !== index
                  );
                  setFormData((p) => ({ ...p, SalaryComponentsJson: updated }));
                }}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setFormData((p) => ({
                ...p,
                SalaryComponentsJson: [
                  ...(p.SalaryComponentsJson || []),
                  { componentName: "", amount: "" },
                ],
              }))
            }
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            + Add Component
          </button>
        </div>

        {/* Terms */}
        <div className="mb-4">
          <label className="block font-semibold">Terms & Conditions</label>
          <textarea
            name="TermsAndConditions"
            value={formData.TermsAndConditions}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={3}
          />
        </div>

        {/* Acceptance Message */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Acceptance Message</label>
          <textarea
            name="acceptanceMessage"
            value={formData.acceptanceMessage || ""}
            onChange={handleChange}
            placeholder="Enter acceptance message"
            className="border p-2 rounded w-full"
            rows={3}
          />
        </div>

        

        <div className="mb-4">
          <label className="block font-semibold">Digital Signature</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "signatureFile")}
          />
        </div>
        {/* Authorized Person Details */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Authorized Person Details</h3>

          <div className="mb-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="authorizedPersonName"
              value={formData.authorizedPersonName}
              onChange={handleChange}
              placeholder="Enter Authorized Person Name"
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium">Designation</label>
            <input
              type="text"
              name="authorizedPersonDesignation"
              value={formData.authorizedPersonDesignation}
              onChange={handleChange}
              placeholder="Enter Designation"
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="authorizedPersonEmail"
              value={formData.authorizedPersonEmail}
              onChange={handleChange}
              placeholder="Enter Email"
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-4 text-white px-4 py-2 rounded-md w-full mb-2 cursor-pointer ${
            isSubmitting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 cursor-pointer w-full"
        >
          Print / Save PDF
        </button>
      </div>

      {/* ===== RIGHT PANEL (Preview) ===== */}
      <div
        ref={certificateRef}
        className="w-2/3 bg-white m-6 overflow-hidden print-container flex flex-col relative"
      >
        <Header />

        <div className="flex-1 px-10 py-4">
          <p className="text-right text-sm mb-6">
            <strong>Date:</strong> {formData.IssueDate}
          </p>

          <h1 className="text-center text-2xl font-bold mb-6">
            Appointment Letter
          </h1>

          <p className="mb-4">
            Dear <strong>{formData.EmployeeName || "__________"}</strong>,
          </p>

          <p className="mb-4 text-justify leading-relaxed">
            We are pleased to appoint{" "}
            <strong>{formData.EmployeeName || "__________"}</strong>
            {formData.FatherName && `, Son of ${formData.FatherName}`} as{" "}
            <strong>
              {designationList.find((d) => d.id === formData.DesignationId)
                ?.title || "__________"}
            </strong>{" "}
            in the{" "}
            <strong>
              {departmentList.find((d) => d.id === formData.DepartmentId)
                ?.name || "__________"}
            </strong>{" "}
            department, located at{" "}
            <strong>
              {addressList.find((l) => l.id === formData.OrganizationAddressId)
                ?.name || "__________"}
            </strong>
            . Your joining date will be{" "}
            <strong>
              {formData.DateOfJoining
                ? new Date(formData.DateOfJoining).toLocaleDateString()
                : "__________"}
            </strong>
            .
          </p>

          {/* Salary Table */}
          {formData.SalaryComponentsJson.length > 0 && (
            <div className="mt-6 mb-6">
              <h3 className="font-semibold mb-2">Salary Breakdown:</h3>
              <table className="w-full border border-gray-400 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-400 px-2 py-1 text-left">
                      Component
                    </th>
                    <th className="border border-gray-400 px-2 py-1 text-right">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.SalaryComponentsJson.map((comp, index) => (
                    <tr key={index}>
                      <td className="border border-gray-400 px-2 py-1">
                        {comp.componentName || "—"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1 text-right">
                        {comp.amount
                          ? Number(comp.amount).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-400 px-2 py-1 text-right">
                      Total
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right">
                      ₹ {totalSalary.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <p className="mb-4 text-justify leading-relaxed">
            {formData.TermsAndConditions ||
              "This appointment is subject to company rules and policies."}
          </p>

          <p className="mb-6 text-justify leading-relaxed">
            {formData.acceptanceMessage ||
              "Kindly confirm your acceptance and join our organization at your earliest convenience. We look forward to your valuable contribution."}
          </p>

          <div className="mt-12 text-left">
            {formData.signatureFile && (
              <img
                src={
                  formData.signatureFile instanceof File
                    ? URL.createObjectURL(formData.signatureFile)
                    : formData.signatureFile
                }
                alt="Signature"
                className="h-16 my-2"
              />
            )}
            <p className="font-semibold">
              {formData.authorizedPersonName || ""}
            </p>
            <p>{formData.authorizedPersonDesignation || ""}</p>
            <p>{formData.authorizedPersonEmail || ""}</p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AppointmentLetterForm;
