import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import assets from "../../../../assets/assets";

const ExperienceCertificateEditor = () => {
  const certificateRef = useRef();
  const [showFatherName, setShowFatherName] = useState(true);
  const [showDepartment, setShowDepartment] = useState(true);
  const [useDefaultHeader, setUseDefaultHeader] = useState(true);
  const [useDefaultFooter, setUseDefaultFooter] = useState(true);
  const [customHeader, setCustomHeader] = useState(null);
  const [customFooter, setCustomFooter] = useState(null);

  const [formData, setFormData] = useState({
    logoUrl: assets.Digicode,
    logoSize: 50,
    organizationName: "DigiCode Software Pvt. Ltd.",
    organizationAddress: "123 Main Street City, State ZIP",
    date: "20-Sept-2025",
    employeeName: "Mr. Santosh Kumar",
    fatherName: "Mr. Sh. Sheetala Prasad",
    designation: "Sr. Supervisor",
    department: "Production - Welding Shop",
    startDate: "04-April-2012",
    endDate: "03-Aug-2024",
    remarks:
      "His exposure in the areas of this department was appreciable. During his tenure with our company, he ably handled major responsibilities single-handedly and was found to be a hardworking employee.",
    closingRemarks:
      "We have found him to be a self-starter, duty-bound and a highly committed team player.",
    finalWish:
      "We at DigiCode wish him all the success in his future endeavors.",
    signatory: "Authorised Signatory",
    signatureUrl: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === "logo")
        setFormData({ ...formData, logoUrl: reader.result });
      else if (field === "header") setCustomHeader(reader.result);
      else if (field === "footer") setCustomFooter(reader.result);
      else if (field === "signature")
        setFormData({ ...formData, signatureUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = useReactToPrint({
  contentRef: certificateRef,
  pageStyle: `
    @page { 
      size: A4;
      margin: 0;         /* remove default print margin */
    }
    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-container {
      width: 210mm;       /* full A4 width */
      min-width: 210mm;
      height: 297mm;      /* full A4 height */
      min-height: 297mm;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  `,
});

  // ---------- Reusable Header Component ----------
  const Header = () => (
    <div className="print-header relative w-full">
      <div className="relative w-full">
        <img
          src={useDefaultHeader || !customHeader ? assets.Header : customHeader}
          alt="Header"
          className="w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-between p-6">
          <img
            src={formData.logoUrl}
            alt="Logo"
            className="object-contain bg-white p-1 rounded shadow"
            style={{ height: formData.logoSize }}
          />
          <div className="text-right">
            <h2 className="font-bold text-xl">{formData.organizationName}</h2>
            <p className="text-sm">{formData.organizationAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- Reusable Footer Component ----------
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
        {/* <p>Email: info@digicode.com | Website: www.digicode.com</p> */}
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white shadow-md p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          Edit Certificate Template
        </h2>

        {/* Header/Footer Options */}
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

        {/* Toggles */}
        <div className="flex items-center justify-between mb-3">
          <span>Show Father Name</span>
          <input
            type="checkbox"
            checked={showFatherName}
            onChange={() => setShowFatherName(!showFatherName)}
          />
        </div>
        <div className="flex items-center justify-between mb-3">
          <span>Show Department</span>
          <input
            type="checkbox"
            checked={showDepartment}
            onChange={() => setShowDepartment(!showDepartment)}
          />
        </div>

        {/* Logo Upload */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Company Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "logo")}
          />
          <input
            type="range"
            min="30"
            max="120"
            value={formData.logoSize}
            onChange={(e) =>
              setFormData({ ...formData, logoSize: +e.target.value })
            }
            className="w-full mt-2"
          />
          <p className="text-xs text-gray-500">
            Logo Size: {formData.logoSize}px
          </p>
        </div>

        {/* Employee & Organization Inputs */}
        {Object.keys(formData).map((field) =>
          [
            "organizationName",
            "organizationAddress",
            "employeeName",
            "fatherName",
            "designation",
            "department",
            "startDate",
            "endDate",
            "date",
            "remarks",
            "closingRemarks",
            "finalWish",
            "signatory",
          ].includes(field) ? (
            <div key={field} className="mb-4">
              <label className="block font-semibold capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              {["remarks", "closingRemarks", "finalWish"].includes(field) ? (
                <textarea
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              )}
            </div>
          ) : null
        )}

        {/* Signature */}
        <div className="mb-4">
          <label className="block font-semibold">Digital Signature</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "signature")}
          />
        </div>

        <button
          onClick={handlePrint}
          className="mt-4 bg-primary cursor-pointer text-white px-4 py-2 rounded-md hover:bg-secondary w-full"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Certificate Preview */}
      <div
        ref={certificateRef}
        className="w-2/3 bg-white m-6 overflow-hidden print-container flex flex-col relative"
      >
        <Header />
        <div className="flex-1 px-10 py-4">
          <p className="text-right text-sm mb-6">
            <strong>Date:</strong> {formData.date}
          </p>
          <h1 className="text-center text-2xl font-bold mb-6">
            Experience Certificate
          </h1>
          <p className="mb-4">
            <strong>To Whomsoever It May Concern</strong>
          </p>
          <p className="mb-4 text-justify leading-relaxed">
            This is to certify that <strong>{formData.employeeName}</strong>
            {showFatherName && (
              <>
                {" "}
                Son of <strong>{formData.fatherName}</strong>
              </>
            )}
            was employed with <strong>{formData.organizationName} </strong>from <strong>{ formData.startDate}</strong> till{" "}
            <strong>{formData.endDate}</strong> as a/an{" "}
            <strong>{formData.designation}</strong>
            {showDepartment && (
              <>
                {" "}
                in our <strong>{formData.department}</strong>
              </>
            )}{" "}
            .
          </p>
          <p className="mb-4 text-justify leading-relaxed">
            {formData.remarks}
          </p>
          <p className="mb-4 text-justify leading-relaxed">
            {formData.closingRemarks}
          </p>
          <p className="mb-8 text-justify leading-relaxed">
            {formData.finalWish}
          </p>

          <div className="mt-12 text-left">
            <p className="mb-1">
              For <strong>{formData.organizationName}</strong>
            </p>
            {formData.signatureUrl && (
              <img
                src={formData.signatureUrl}
                alt="Signature"
                className="h-16 my-2"
              />
            )}
            <p className="font-semibold">{formData.signatory}</p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ExperienceCertificateEditor;
