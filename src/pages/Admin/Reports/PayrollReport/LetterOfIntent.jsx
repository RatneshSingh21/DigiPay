import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { generateLetterPdf } from "../PdfUtils";
import ReactMarkdown from "react-markdown";


export default function LetterOfIntent() {
  const certificateRef = useRef(null);

  const [org, setOrg] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const [paragraphs, setParagraphs] = useState([
    "We are pleased to inform you that **{CandidateName}** is being considered for the position of **{Position}** at **{CompanyName}**. This Letter of Intent outlines the preliminary understanding between both parties and does not constitute a formal contract of employment.",

    "Your proposed engagement is expected to commence from **{ProposedJoiningDate}**, subject to successful completion of all internal approvals and submission of required documents. The role will be based at **{Location}** and assigned to the **{Department}** department.",

    "The proposed remuneration for this role is **₹{ProposedSalary} per annum**, or a stipend of **₹{Stipend}**, as applicable, for a duration of **{Duration}**. The final compensation structure and employment terms will be detailed in the formal offer letter, if issued.",

    "Please note that this Letter of Intent is non-binding in nature and does not obligate the organization to proceed with employment. Either party may withdraw from this understanding at any time without any legal or financial liability.",

    "If the above terms are acceptable, please acknowledge this Letter of Intent as a confirmation of your interest. We look forward to the possibility of working together."
  ]);

  const [form, setForm] = useState({
    CandidateName: "Rahul Sharma",
    FatherName: "Shyam",
    Address: "New Delhi, India",
    Email: "ry027674@gmail.com",
    Phone: "9876543210",
    Position: "Software Engineer",
    Department: "IT Department",
    ProposedJoiningDate: "2025-01-15",
    Location: "New Delhi, India",
    ProposedSalary: 600000,
    Stipend: 0,
    Duration: "Six months",
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
      .replaceAll("{Position}", form.Position || "")
      .replaceAll("{CompanyName}", org.company?.companyName || "")
      .replaceAll(
        "{ProposedJoiningDate}",
        form.ProposedJoiningDate
          ? new Date(form.ProposedJoiningDate).toLocaleDateString("en-GB")
          : ""
      )
      .replaceAll("{Location}", form.Location || "")
      .replaceAll("{Department}", form.Department || "")
      .replaceAll(
        "{ProposedSalary}",
        form.ProposedSalary
          ? form.ProposedSalary.toLocaleString("en-IN")
          : "0"
      )
      .replaceAll(
        "{Stipend}",
        form.Stipend
          ? form.Stipend.toLocaleString("en-IN")
          : "0"
      )
      .replaceAll("{Duration}", form.Duration || "");
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
    try {
      if (!certificateRef.current) {
        toast.error("Preview not ready");
        return;
      }

      setUploadProgress(0);

      // Generate PDF
      const result = await generateLetterPdf(certificateRef);
      if (!result?.blob) throw new Error("PDF generation failed");

      const fd = new FormData();

      fd.append("CandidateName", form.CandidateName);
      fd.append("FatherName", form.FatherName || "");
      fd.append("Address", form.Address || "");
      fd.append("Email", form.Email || "");
      fd.append("Phone", form.Phone || "");
      fd.append("Position", form.Position);
      fd.append("Department", form.Department || "");
      fd.append(
        "ProposedJoiningDate",
        new Date(form.ProposedJoiningDate).toISOString()
      );
      fd.append("Location", form.Location || "");
      fd.append("ProposedSalary", Number(form.ProposedSalary || 0));
      fd.append("Stipend", Number(form.Stipend || 0));
      fd.append("Duration", form.Duration || "");

      fd.append("File", result.blob, "LetterOfIntent.pdf");

      await axiosInstance.post("/LetterOfIntent/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const percent = e.total
            ? Math.round((e.loaded * 100) / e.total)
            : 0;
          setUploadProgress(percent);
        },
      });

      toast.success("Letter Of Intent uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload Letter Of Intent");
    } finally {
      setUploadProgress(0);
    }
  };


  const inputClass =
    "w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  /* ================= UI ================= */
  return (
    <div className="flex bg-gray-100 min-h-screen gap-4">
      {/* ================= FORM ================= */}
      <div className="w-1/3 bg-white shadow p-6 overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-6">Letter Of Intent Details</h2>

        {[
          ["CandidateName", "Candidate Name"],
          ["FatherName", "Father Name"],
          ["Email", "Candidate Email"],
          ["Phone", "Candidate Phone"],
          ["Address", "Candidate Address"],
          ["Position", "Position"],
          ["Department", "Department"],
          ["Location", "Location"],
        ].map(([key, label]) => (
          <div key={key} className="text-xs">
            <label className="block font-medium my-1">{label}</label>
            <input
              className={inputClass}
              value={form[key] || ""}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          </div>
        ))}

        <div className="text-xs">
          <label className="block font-medium mb-1">Proposed Joining Date</label>
          <input
            type="date"
            className={inputClass}
            value={form.ProposedJoiningDate}
            onChange={(e) =>
              setForm({ ...form, ProposedJoiningDate: e.target.value })
            }
          />

          <label className="block font-medium my-1">Proposed Salary</label>
          <input
            type="number"
            className={inputClass}
            value={form.ProposedSalary}
            onChange={(e) =>
              setForm({ ...form, ProposedSalary: Number(e.target.value) })
            }
          />

          <label className="block font-medium my-1">Stipend</label>
          <input
            type="number"
            className={inputClass}
            value={form.Stipend}
            onChange={(e) =>
              setForm({ ...form, Stipend: Number(e.target.value) })
            }
          />

          <label className="block font-medium my-1">Duration</label>
          <input
            className={inputClass}
            value={form.Duration}
            onChange={(e) =>
              setForm({ ...form, Duration: e.target.value })
            }
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
              <b>Date:</b> {new Date().toLocaleDateString("en-GB")}
            </p>

            <p className="print-to">
              <b>To,</b>
            </p>
            <p>
              <b>{form.CandidateName}</b>
            </p>
            <p>{form.Address}</p>

            <h1 className="print-title">LETTER OF INTENT</h1>

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
