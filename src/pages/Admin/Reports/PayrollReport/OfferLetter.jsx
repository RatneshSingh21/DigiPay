import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { generateLetterPdf } from "../PdfUtils";
import ReactMarkdown from "react-markdown";

export default function OfferLetter() {
  const certificateRef = useRef(null);

  const [org, setOrg] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const [paragraphs, setParagraphs] = useState([
    "We are pleased to offer you the position of **{JobTitle}** in the **{Department}** at **{CompanyName}**, subject to the terms and conditions outlined in this letter.",

    "Your employment will commence from **{DateOfJoining}**. You will initially be placed on **{EmploymentType}** for a period of **{Duration}**, during which your performance and conduct will be reviewed.",

    "Your total annual compensation (CTC) will be **₹{Salary}**, payable as per the company’s salary structure and applicable statutory deductions.",

    "You will be required to comply with all company policies, rules, and regulations, as amended from time to time, including confidentiality and code of conduct policies.",

    "This offer is contingent upon successful verification of your documents and background. Please sign and return a copy of this letter as acceptance of the offer."
  ]);

  const [form, setForm] = useState({
    CandidateName: "Rahul Sharma",
    Email: "ry027674@gmail.com",
    Phone: "9876543210",
    Address: "New Delhi, India",
    DateOfJoining: "2025-01-15",
    IssuedDate: "2025-01-01",
    JobTitle: "Software Engineer",
    EmploymentType: "Probation",
    Salary: 600000,
    Duration: "Six months",
    Department: "IT Department",
  });

  const [uiSettings, setUiSettings] = useState({
    showLogo: true,
    showAddress: true,
    showCompanyName: true,

    logoSize: 30, // px
    signatureSize: 56, // px
    signatureAlign: "left", // left | center | right

    companyNameColor: "#000000", // black | white
    addressColor: "#000000", // black | white
  });

  const replaceVars = (text) => {
    return text
      .replaceAll("{CandidateName}", form.CandidateName || "")
      .replaceAll("{JobTitle}", form.JobTitle || "")
      .replaceAll("{Department}", form.Department || "")
      .replaceAll("{CompanyName}", org.company?.companyName || "")
      .replaceAll(
        "{DateOfJoining}",
        form.DateOfJoining
          ? new Date(form.DateOfJoining).toLocaleDateString("en-GB")
          : ""
      )
      .replaceAll("{EmploymentType}", form.EmploymentType || "")
      .replaceAll("{Duration}", form.Duration || "")
      .replaceAll(
        "{Salary}",
        form.Salary
          ? Number(form.Salary).toLocaleString("en-IN")
          : "0"
      );
  };

  /* ================= LOAD ORG ================= */
  useEffect(() => {
    console.group("📦 Load Organization");
    const loadOrg = async () => {
      try {
        const res = await axiosInstance.get("/OrganizationProfile/full");
        console.log("✅ Org API Response:", res.data);
        setOrg(res.data);
      } catch (err) {
        console.error("❌ Org API Failed:", err);
        toast.error("Failed to load organization profile");
      } finally {
        console.groupEnd();
      }
    };
    loadOrg();
  }, []);

  /* ================= PARAGRAPHS ================= */
  const updatePara = (i, val) => {
    console.log(`✏️ Updating paragraph ${i}`, val);
    const copy = [...paragraphs];
    copy[i] = val;
    setParagraphs(copy);
  };

  const addPara = () => {
    console.log("➕ Adding paragraph");
    setParagraphs([...paragraphs, ""]);
  };

  const removePara = (i) => {
    console.log("🗑️ Removing paragraph", i);
    setParagraphs(paragraphs.filter((_, idx) => idx !== i));
  };

  /* ================= SUBMIT ================= */
  /* ================= UPLOAD DIAGNOSTICS ================= */
  /**
   * Logs detailed info about API requests/responses and network errors
   */
  const handleSubmit = async () => {
    console.group("🚀 Offer Letter Submit");

    try {
      if (!certificateRef.current) {
        console.error("❌ certificateRef is NULL - preview not ready");
        toast.error("Preview not ready");
        return;
      }

      console.log("📝 Form Data:", form);
      console.log("📄 Paragraphs:", paragraphs);

      setUploadProgress(0);

      /* ================= PDF GENERATION ================= */
      console.log("🖨️ Generating PDF...");
      const result = await generateOfferLetterPdf(certificateRef, {
        debug: true,
      });

      if (!result?.blob) throw new Error("PDF Blob missing");

      console.log("✅ PDF Generated:", {
        size: result.blob.size,
        type: result.blob.type,
      });

      /* ================= FORM DATA ================= */
      const fd = new FormData();
      const payload = {
        CandidateName: form.CandidateName,
        Email: form.Email,
        Phone: form.Phone,
        Address: form.Address,
        JobTitle: form.JobTitle,
        EmploymentType: form.EmploymentType,
        Department: form.Department,
        Duration: form.Duration,
        Salary: Number(form.Salary),
        DateOfJoining: new Date(form.DateOfJoining).toISOString(),
        IssuedDate: new Date(form.IssuedDate).toISOString(),
      };
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));

      fd.append("CustomFieldsJson", "");
      fd.append("File", result.blob, "OfferLetter.pdf");

      console.log("📡 Uploading to API...");

      const res = await axiosInstance.post("/OfferLetter/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const percent = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          console.log(`⬆️ Upload Progress: ${percent}%`);
          setUploadProgress(percent);
        },
      });

      console.log("✅ API Success Response:", res.data);
      toast.success("Offer Letter uploaded successfully");

      URL.revokeObjectURL(result.url);
    } catch (err) {
      console.error("❌ Offer Letter Upload Failed:", err);

      // Axios response error
      if (err.response) {
        console.error("📄 API Error Data:", err.response.data);
        console.error("📄 API Status:", err.response.status);
      }

      // Axios request error
      if (err.request) {
        console.error("📡 Network / Request Error:", err.request);
      }

      // General message
      if (err.message) console.error("📝 Error Message:", err.message);

      toast.error("Failed to upload offer letter");
    } finally {
      setUploadProgress(0);
      console.groupEnd();
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  /* ================= UI ================= */
  return (
    <div className="flex bg-gray-100 min-h-screen gap-4">
      {/* ================= FORM ================= */}
      <div className="w-1/3 bg-white shadow p-6 overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-6">Offer Letter Details</h2>

        {[
          ["CandidateName", "Candidate Name"],
          ["Email", "Candidate Email"],
          ["Phone", "Candidate Phone"],
          ["Address", "Candidate Address"],
          ["JobTitle", "Job Title"],
          ["Department", "Department"],
          ["EmploymentType", "Employment Type"],
        ].map(([key, label]) => (
          <div key={key} className="text-xs">
            <label className="block font-medium my-1">{label}</label>
            <input
              className={inputClass}
              value={form[key]}
              onChange={(e) => {
                console.log(`✏️ ${key}:`, e.target.value);
                setForm({ ...form, [key]: e.target.value });
              }}
            />
          </div>
        ))}

        <div className="text-xs">
          <label className="block font-medium mb-1">Date of Joining</label>
          <input
            type="date"
            className={inputClass}
            value={form.DateOfJoining}
            onChange={(e) =>
              setForm({ ...form, DateOfJoining: e.target.value })
            }
          />

          <label className="block font-medium mb-1">Offer Issued Date</label>
          <input
            type="date"
            className={inputClass}
            value={form.IssuedDate}
            onChange={(e) => setForm({ ...form, IssuedDate: e.target.value })}
          />

          <label className="block font-medium my-1">Salary / CTC</label>
          <input
            type="number"
            className={inputClass}
            value={form.Salary}
            onChange={(e) =>
              setForm({ ...form, Salary: Number(e.target.value) })
            }
          />

          <label className="block font-medium my-1">Probation / Duration</label>
          <input
            className={inputClass}
            value={form.Duration}
            onChange={(e) => setForm({ ...form, Duration: e.target.value })}
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

            <div /> {/* spacer */}

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
          className={`bg-primary text-white cursor-pointer text-sm w-full py-2 rounded-md font-semibold
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
`}
      </style>

      {/* ================= PREVIEW ================= */}
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

          {/* BODY */}
          <div className="print-body">
            <p className="print-date">
              <b>Date:</b> {new Date(form.IssuedDate).toLocaleDateString("en-GB")}
            </p>

            <p className="print-to">
              <b>To,</b>
            </p>
            <p>
              <b>{form.CandidateName}</b>
            </p>
            <p>{form.Address}</p>

            <h1 className="print-title">OFFER LETTER</h1>

            {paragraphs.map((p, i) => (
              <div key={i} className="paragraphs" style={{ textAlign: "justify" }}>
                <ReactMarkdown>{replaceVars(p)}</ReactMarkdown>
              </div>
            ))}

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
              <p>Authorized Sign by {org.company?.companyName}</p>
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
