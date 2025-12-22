import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { generateLetterPdf } from "../PdfUtils";
import ReactMarkdown from "react-markdown";

export default function AppointmentLetter() {
  const certificateRef = useRef(null);

  /* ================= MASTER DATA ================= */
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  /* ================= ORG ================= */
  const [org, setOrg] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  /* ================= PARAGRAPHS ================= */
  const [paragraphs, setParagraphs] = useState([
    "We are pleased to appoint **{EmployeeName}** as **{Position}** in the **{Department}** department at **{CompanyName}**, effective from **{DateOfJoining}**.",
    "Your appointment will be governed by the rules, regulations, and policies of the company as amended from time to time.",
    "Your salary structure will be as detailed below and shall be subject to applicable statutory deductions.",
    "This appointment is made based on the information furnished by you. Any discrepancy found at a later stage may result in termination of employment.",
    "We welcome you to **{CompanyName}** and wish you a successful and rewarding association.",
  ]);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    EmployeeId: null,
    EmployeeName: "",
    Email: "",
    FatherName: "",
    DepartmentId: null,
    DesignationId: null,
    Department: "",
    Position: "",
    DateOfJoining: "",
    IssueDate: new Date().toISOString(),
    AuthorizedPersonName: "",
    TermsAndConditions: "",
  });

  /* ================= SALARY ================= */
  const [salaryComponents, setSalaryComponents] = useState([
    { ComponentName: "Basic", Amount: 12900 },
    { ComponentName: "HRA", Amount: 5000 },
  ]);

  /* ================= UI SETTINGS ================= */
  const [uiSettings, setUiSettings] = useState({
    showLogo: true,
    showAddress: true,
    showCompanyName: true,
    showTerms: true,
    logoSize: 30,
    signatureSize: 56,
    signatureAlign: "left",
    companyNameColor: "#000000",
    addressColor: "#000000",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    axiosInstance.get("/Employee").then((r) => setEmployees(r.data));
    axiosInstance.get("/Department").then((r) => setDepartments(r.data));
    axiosInstance.get("/Designation").then((r) => setDesignations(r.data));
    axiosInstance.get("/OrganizationProfile/full").then((r) => setOrg(r.data));
  }, []);

  /* ================= VAR REPLACER ================= */
  const replaceVars = (text) =>
    text
      .replaceAll("{EmployeeName}", form.EmployeeName || "")
      .replaceAll("{Position}", form.Position || "")
      .replaceAll("{Department}", form.Department || "")
      .replaceAll("{CompanyName}", org.company?.companyName || "")
      .replaceAll(
        "{DateOfJoining}",
        form.DateOfJoining
          ? new Date(form.DateOfJoining).toLocaleDateString("en-GB")
          : ""
      );

  /* ================= EMPLOYEE SELECT ================= */
  const handleEmployeeSelect = (emp) => {
    setForm({
      ...form,
      EmployeeId: emp.id,
      EmployeeName: emp.fullName,
      Email: emp.workEmail,
      FatherName: emp.fatherName || "",
      DepartmentId: emp.departmentId,
      DesignationId: emp.designationId,
      DateOfJoining: emp.dateOfJoining?.slice(0, 10),
      Department:
        departments.find((d) => d.id === emp.departmentId)?.name || "",
      Position:
        designations.find((d) => d.id === emp.designationId)?.title || "",
    });
  };

  /* ================= PARAGRAPH CONTROLS ================= */
  const updatePara = (i, val) => {
    const copy = [...paragraphs];
    copy[i] = val;
    setParagraphs(copy);
  };

  const addPara = () => setParagraphs([...paragraphs, ""]);
  const removePara = (i) =>
    setParagraphs(paragraphs.filter((_, idx) => idx !== i));

  /* ================= SALARY CONTROLS ================= */
  const updateSalary = (i, key, val) => {
    const copy = [...salaryComponents];
    copy[i][key] = key === "Amount" ? Number(val) : val;
    setSalaryComponents(copy);
  };

  const addSalary = () =>
    setSalaryComponents([...salaryComponents, { ComponentName: "", Amount: 0 }]);

  const removeSalary = (i) =>
    setSalaryComponents(salaryComponents.filter((_, idx) => idx !== i));


  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      if (!certificateRef.current) {
        toast.error("Preview not ready");
        return;
      }

      // Generate PDF
      const result = await generateLetterPdf(certificateRef);
      if (!result?.blob) throw new Error("PDF generation failed");

      // Prepare FormData
      const fd = new FormData();
      fd.append("EmployeeId", form.EmployeeId);
      fd.append("EmployeeName", form.EmployeeName);
      fd.append("Email", form.Email);
      fd.append("FatherName", form.FatherName);
      fd.append("DepartmentId", form.DepartmentId);
      fd.append("DesignationId", form.DesignationId);
      fd.append("DateOfJoining", new Date(form.DateOfJoining).toISOString());
      fd.append("IssueDate", new Date().toISOString());
      fd.append("TermsAndConditions", form.TermsAndConditions);
      fd.append("AuthorizedPersonName", form.AuthorizedPersonName);
      fd.append("File", result.blob, "AppointmentLetter.pdf");

      // Corrected SalaryComponentsJson (stringified exactly like Swagger)
      const salaryJson = `[${salaryComponents
        .map(
          (s) =>
            `{"ComponentName":"${s.ComponentName}","Amount":"${s.Amount}"}`
        )
        .join(",")}]`;
      fd.append("SalaryComponentsJson", salaryJson);

      // Upload
      await axiosInstance.post("/AppointmentLetter/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Appointment Letter created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload Appointment Letter");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  /* ================= UI ================= */
  return (
    <div className="flex bg-gray-100 min-h-screen gap-4">
      {/* ================= FORM ================= */}
      <div className="w-1/3 bg-white shadow p-6 overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4">Appointment Letter Details</h2>

        <label className="text-xs font-medium">Employee</label>
        <Select
          options={employees}
          getOptionLabel={(e) => `${e.employeeCode} - ${e.fullName}`}
          getOptionValue={(e) => e.id}
          onChange={handleEmployeeSelect}
        />
        {[

          ["FatherName", "Father Name"],
          ["Email", "Email"],
          ["DesignationId", "Designation ID"],
          ["DepartmentId", "Department ID"],
          ["Position", "Position"],
          ["AuthorizedPersonName", "Authorized Person"],
          ["TermsAndConditions", "Terms And Conditions"],

        ].map(([k, label]) => (
          <div key={k} className="text-xs mb-1">
            <label className="block font-medium">{label}</label>
            <input
              className={inputClass}
              value={form[k] ?? ""}
              onChange={(e) =>
                setForm({ ...form, [k]: e.target.value })
              }
            />
          </div>
        ))}

        <label className="text-xs font-medium mt-2">Date of Joining</label>
        <input
          type="date"
          className={inputClass}
          value={form.DateOfJoining}
          onChange={(e) =>
            setForm({ ...form, DateOfJoining: e.target.value })
          }
        />

        {/* ================= SALARY ================= */}
        <h3 className="font-semibold text-sm mt-4">Salary Components</h3>
        {salaryComponents.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className={inputClass}
              placeholder="Component"
              value={s.ComponentName}
              onChange={(e) =>
                updateSalary(i, "ComponentName", e.target.value)
              }
            />
            <input
              type="number"
              className={inputClass}
              placeholder="Amount"
              value={s.Amount}
              onChange={(e) =>
                updateSalary(i, "Amount", e.target.value)
              }
            />
            <button
              className="text-red-600 text-sm"
              onClick={() => removeSalary(i)}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addSalary}
          className="text-primary text-xs font-medium mb-2"
        >
          + Add Salary Component
        </button>

        <h3 className="font-semibold my-2">Letter Content</h3>
        {paragraphs.map((p, i) => (
          <div key={i} className="mb-2">
            <textarea
              rows={3}
              className={inputClass}
              value={p}
              onChange={(e) => updatePara(i, e.target.value)}
            />
            {paragraphs.length > 1 && (
              <button
                className="text-red-600 mt-1 text-sm cursor-pointer font-medium"
                onClick={() => removePara(i)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addPara}
          className="text-primary text-sm cursor-pointer font-medium mb-2"
        >
          + Add Paragraph
        </button>

        <h3 className="font-semibold my-3 text-sm">Header & Signature Settings</h3>

        <div className="grid grid-cols-2 gap-3 text-xs border rounded-md p-3 bg-gray-50 my-2">

          {/* Show Logo */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={uiSettings.showLogo}
              onChange={(e) =>
                setUiSettings({ ...uiSettings, showLogo: e.target.checked })
              }
            />
            Show Logo
          </label>

          {/* Show Company Name */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={uiSettings.showCompanyName}
              onChange={(e) =>
                setUiSettings({ ...uiSettings, showCompanyName: e.target.checked })
              }
            />
            Show Company Name
          </label>

          {/* Show Address */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={uiSettings.showAddress}
              onChange={(e) =>
                setUiSettings({ ...uiSettings, showAddress: e.target.checked })
              }
            />
            Show Address
          </label>
          <label className="flex items-center gap-2 ">
            <input
              type="checkbox"
              checked={uiSettings.showTerms}
              onChange={(e) =>
                setUiSettings({ ...uiSettings, showTerms: e.target.checked })
              }
            />
            Show Terms & Conditions
          </label>


          {/* Logo Size */}
          <div>
            <label className="block font-medium mb-1">
              Logo Size ({uiSettings.logoSize}px)
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={uiSettings.logoSize}
              onChange={(e) =>
                setUiSettings({
                  ...uiSettings,
                  logoSize: Number(e.target.value),
                })
              }
            />
          </div>

          {/* Signature Size */}
          <div>
            <label className="block font-medium mb-1">
              Signature Size ({uiSettings.signatureSize}px)
            </label>
            <input
              type="range"
              min="40"
              max="120"
              value={uiSettings.signatureSize}
              onChange={(e) =>
                setUiSettings({
                  ...uiSettings,
                  signatureSize: Number(e.target.value),
                })
              }
            />
          </div>

          {/* Signature Alignment */}
          <div>
            <label className="block font-medium mb-1">
              Signature Alignment
            </label>
            <select
              className={inputClass}
              value={uiSettings.signatureAlign}
              onChange={(e) =>
                setUiSettings({
                  ...uiSettings,
                  signatureAlign: e.target.value,
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {/* Company Name Color */}
          <div>
            <label className="block font-medium mb-1">
              Company Name Color
            </label>
            <select
              className={inputClass}
              value={uiSettings.companyNameColor}
              onChange={(e) =>
                setUiSettings({
                  ...uiSettings,
                  companyNameColor: e.target.value,
                })
              }
            >
              <option value="#000000">Black</option>
              <option value="#ffffff">White</option>
            </select>
          </div>

          {/* Address Color */}
          <div>
            <label className="block font-medium mb-1">
              Address Text Color
            </label>
            <select
              className={inputClass}
              value={uiSettings.addressColor}
              onChange={(e) =>
                setUiSettings({
                  ...uiSettings,
                  addressColor: e.target.value,
                })
              }
            >
              <option value="#000000">Black</option>
              <option value="#ffffff">White</option>
            </select>
          </div>

        </div>



        {uploadProgress > 0 && (
          <div className="absolute bottom-0 left-6 right-6">
            <div className="w-full bg-gray-200 rounded">
              <div
                className="bg-green-600 text-white text-xs p-1 rounded"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={uploadProgress > 0}
          className={`bg-primary text-white text-sm w-full py-2 rounded-md font-semibold mt-4
          ${uploadProgress > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Save & Upload PDF
        </button>
      </div>



      <style>
        {`
/* =========================
   PDF / PREVIEW SAFE (PX)
   A4 @ 96 DPI
========================= */

.print-container {
  width: 794px; /* 210mm */
  position: relative;
  font-family: Arial, Helvetica, sans-serif;
  background: #fff;
}

.print-page {
  min-height: 1123px; /* 297mm */
  padding-top: 227px; /* 60mm */
  padding-bottom: 151px; /* 40mm */
  position: relative;
  box-sizing: border-box;
}

/* ================= HEADER ================= */

.print-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 151px; /* 40mm */
  overflow: hidden;
}

.header-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}



.header-overlay {
  position: absolute;
  inset: 0;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 0 0 auto;
}

.header-right {
  text-align: right;
  max-width: 50%;
}

.header-logo {
  height: 30px;
  display: block;
}

.header-company-name {
  font-size: 18px;
  font-weight: 700;
}

.header-company-address {
  font-size: 12px;
}

/* ================= BODY ================= */

.print-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin: 24px 0;
}

.print-page p {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.print-page h1 {
  font-size: 22px;
  margin: 24px 0;
}

/* ================= FOOTER ================= */

.print-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 113px; /* 30mm */
}

.print-footer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.footer-text {
  position: absolute;
  bottom: 12px;
  width: 100%;
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  color: #000;
}

/* ================= BODY SPACING ================= */

.print-body {
  padding: 24px 40px;
}
  .paragraphs{
  text-align: justify;
  }

  .paragraphs strong {
  font-weight: bold;
}

.paragraphs em {
  font-style: italic;
}

.paragraphs del {
  text-decoration: line-through;
}

.print-date {
  text-align: right;
}

.print-to {
  margin-top: 16px;
}

.print-signature {
  margin-top: 40px;
}

/* ================= SIGNATURE ================= */

.signature-img {
  height: 56px; /* h-14 */
  margin-top: 8px;
  display: block;
}

.print-body table,
.print-body th,
.print-body td {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}
`}
      </style>

      {/* ================= PREVIEW (SAME AS LOI) ================= */}
      <div
        ref={certificateRef}
        className="print-container"
        style={{
          color: "#000",
          backgroundColor: "#fff",
          borderColor: "#000",
        }}
      >
        <div className="print-page">
          {/* HEADER */}
          {org.orgHeaderImage && (
            <div className="print-header">
              <img
                src={org.orgHeaderImage}
                className="header-bg"
                crossOrigin="anonymous"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="header-overlay header-split">
                <div className="header-left">
                  {uiSettings.showLogo && org.orgLogo && (
                    <img
                      src={org.orgLogo}
                      crossOrigin="anonymous"
                      style={{
                        height: `${uiSettings.logoSize}px`,
                        objectFit: "contain",
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
                <div className="header-right">
                  {uiSettings.showCompanyName && (
                    <h2
                      className="header-company-name"
                      style={{ color: uiSettings.companyNameColor }}
                    >
                      {org.company?.companyName}
                    </h2>
                  )}
                  {uiSettings.showAddress && (
                    <p
                      className="header-company-address"
                      style={{ color: uiSettings.addressColor }}
                    >
                      {org.workLocation?.addressLine1},
                      {org.workLocation?.addressLine2},{org.workLocation?.city},
                      {org.workLocation?.state} - {org.workLocation?.pinCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="print-body">
            <p className="print-date">
              <b>Date:</b> {new Date(form.IssueDate).toLocaleDateString("en-GB")}
            </p>

            <h1 className="print-title">APPOINTMENT LETTER</h1>

            {paragraphs.map((p, i) => (
              <div key={i} className="paragraphs">
                <ReactMarkdown>{replaceVars(p)}</ReactMarkdown>
              </div>
            ))}

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 20,
                tableLayout: "fixed", // important for even columns
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      textAlign: "center",
                    }}
                  >
                    Component
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      textAlign: "center",
                    }}
                  >
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {salaryComponents.map((s, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        textAlign: "center",
                      }}
                    >
                      {s.ComponentName}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        textAlign: "center",
                      }}
                    >
                      ₹ {Number(s.Amount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ================= TERMS & CONDITIONS ================= */}
            {uiSettings.showTerms && form.TermsAndConditions && (
              <div className="paragraphs" style={{ marginTop: 20 }}>
                <h2>Terms & Conditions</h2>
                <ReactMarkdown>{form.TermsAndConditions}</ReactMarkdown>
              </div>
            )}

            <div
              className="print-signature"
              style={{
                textAlign: uiSettings.signatureAlign,
              }}
            >
              {org.orgSignature && (
                <img
                  src={org.orgSignature}
                  crossOrigin="anonymous"
                  style={{
                    height: `${uiSettings.signatureSize}px`,
                    objectFit: "contain",
                    display: "inline-block",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <p>
                Authorized Signatory<br />
                {form.AuthorizedPersonName}
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="print-footer">
            {org.orgFooterImage && (
              <img
                src={org.orgFooterImage}
                crossOrigin="anonymous"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <div className="footer-text">
              This is a system generated document
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
