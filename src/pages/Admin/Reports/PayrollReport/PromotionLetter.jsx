import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { generateLetterPdf } from "../PdfUtils";
import ReactMarkdown from "react-markdown";

export default function PromotionLetter() {
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
    "We are pleased to inform **{EmployeeName}** that you have been promoted.",
    "Your designation has changed from **{CurrentDesignation}** to **{NewDesignation}**, effective from **{EffectiveFrom}**.",
    "Your revised salary will be **₹{NewSalary}** per annum.",
  ]);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    EmployeeId: null,
    EmployeeName: "",
    Email: "",
    Department: "",
    CurrentDesignation: "",
    NewDesignation: "",
    CurrentSalary: "",
    NewSalary: "",
    EffectiveFrom: "",
    IssueDate: new Date().toISOString(),
    Reason: "",
    TermsAndConditions: "",
  });

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
      .replaceAll("{Department}", form.Department || "")
      .replaceAll("{CompanyName}", org.company?.companyName || "")
      .replaceAll("{CurrentDesignation}", form.CurrentDesignation || "")
      .replaceAll("{NewDesignation}", form.NewDesignation || "")
      .replaceAll("{CurrentSalary}", form.CurrentSalary || "")
      .replaceAll("{NewSalary}", form.NewSalary || "")
      .replaceAll("{Reason}", form.Reason || "")
      .replaceAll(
        "{EffectiveFrom}",
        form.EffectiveFrom
          ? new Date(form.EffectiveFrom).toLocaleDateString("en-GB")
          : ""
      );

  /* ================= EMPLOYEE SELECT ================= */
  const handleEmployeeSelect = async (emp) => {
    try {
      setForm((prev) => ({
        ...prev,
        EmployeeId: emp.id,
        EmployeeName: emp.fullName,
        Email: emp.workEmail,
        Department:
          departments.find((d) => d.id === emp.departmentId)?.name || "",
        CurrentDesignation:
          designations.find((d) => d.id === emp.designationId)?.title || "",
        CurrentSalary: "",
      }));

      const res = await axiosInstance.get(`/EmployeeSalary/employee/${emp.id}`);

      setForm((prev) => ({
        ...prev,
        CurrentSalary: res.data?.data?.grossEarnings ?? "",
      }));
    } catch (err) {
      toast.error("Failed to fetch salary");
    }
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
      fd.append("Department", form.Department);

      fd.append("CurrentDesignation", form.CurrentDesignation);
      fd.append("NewDesignation", form.NewDesignation);

      fd.append("CurrentSalary", Number(form.CurrentSalary));
      fd.append("NewSalary", Number(form.NewSalary));

      fd.append("EffectiveFrom", new Date(form.EffectiveFrom).toISOString());
      fd.append("IssueDate", new Date(form.IssueDate).toISOString());
      fd.append("Reason", form.Reason || "");
      fd.append("TermsAndConditions", form.TermsAndConditions || "");
      fd.append("File", result.blob, "PromotionLetter.pdf");

      // Upload
      await axiosInstance.post("/PromotionLetter/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Increment Letter created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload Increment Letter");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  /* ================= UI ================= */
  return (
    <div className="flex bg-gray-100 min-h-screen gap-4">
      {/* ================= FORM ================= */}
      <div className="w-1/3 bg-white shadow p-6 overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4">Promotion Letter Details</h2>

        <label className="text-xs font-medium">Employee</label>
        <Select
          options={employees}
          getOptionLabel={(e) => `${e.employeeCode} - ${e.fullName}`}
          getOptionValue={(e) => e.id}
          onChange={handleEmployeeSelect}
        />
        {[
          ["CurrentDesignation", "Current Designation"],
          ["NewDesignation", "New Designation"],
          ["CurrentSalary", "Current Salary"],
          ["NewSalary", "New Salary"],
          ["Reason", "Reason"],
          ["TermsAndConditions", "Terms & Conditions"],
        ].map(([k, label]) => (
          <div key={k} className="text-xs mb-1">
            <label className="block font-medium">{label}</label>
            <input
              type={k.includes("Salary") ? "number" : "text"}
              readOnly={k === "CurrentDesignation" || k === "CurrentSalary"}
              className={`${inputClass} ${
                k === "CurrentDesignation" || k === "CurrentSalary"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </div>
        ))}

        <label className="text-xs font-medium mt-2">Effective From</label>
        <input
          type="date"
          className={inputClass}
          value={form.EffectiveFrom}
          onChange={(e) => setForm({ ...form, EffectiveFrom: e.target.value })}
        />
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

        <h3 className="font-semibold my-3 text-sm">
          Header & Signature Settings
        </h3>

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
                setUiSettings({
                  ...uiSettings,
                  showCompanyName: e.target.checked,
                })
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
            <label className="block font-medium mb-1">Company Name Color</label>
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
            <label className="block font-medium mb-1">Address Text Color</label>
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
              <b>Date:</b>{" "}
              {new Date(form.IssueDate).toLocaleDateString("en-GB")}
            </p>

            <h1 className="print-title">PROMOTION LETTER</h1>

            {paragraphs.map((p, i) => (
              <div key={i} className="paragraphs">
                <ReactMarkdown>{replaceVars(p)}</ReactMarkdown>
              </div>
            ))}

            {form.Reason && (
              <div className="paragraphs" style={{ marginTop: 20 }}>
                <h2>Reason</h2>
                <ReactMarkdown>{form.Reason}</ReactMarkdown>
              </div>
            )}

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 20,
                tableLayout: "fixed", // important for even columns
              }}
            ></table>

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
                Authorized Signatory
                <br />
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
    </div>
  );
}
