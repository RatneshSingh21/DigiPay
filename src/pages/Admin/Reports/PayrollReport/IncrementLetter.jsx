
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import assets from "../../../../assets/assets";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const IncrementLetter = () => {
  const certificateRef = useRef();
  const [useDefaultHeader, setUseDefaultHeader] = useState(true);
  const [useDefaultFooter, setUseDefaultFooter] = useState(true);
  const [customHeader, setCustomHeader] = useState(null);
  const [customFooter, setCustomFooter] = useState(null);

  const [formData, setFormData] = useState({
    logoUrl: assets.Digicode,
    logoSize: 50,
    fullName: "Rahul Sharma",
    designation: "Software Developer",
    department: "IT",
    dateOfJoining: new Date().toISOString().slice(0, 10),
    currentSalary: 50000,
    incrementAmount: 10000,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    reason: "Performance Based Increment",
    issueDate: new Date().toISOString().slice(0, 10),
    termsAndConditions: "This increment is subject to company policies and performance review.",
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
    };
    reader.readAsDataURL(file);
  };

 const handlePrint = useReactToPrint({
    
     contentRef: certificateRef,
     documentTitle: formData.employeeName || "AppointmentLetter",
     pageStyle: `
       @page { 
         size: A4; 
         margin: 0; 
       }
       body {
         margin: 0;
         padding: 0;
         -webkit-print-color-adjust: exact !important;
         print-color-adjust: exact !important;
       }
       .print-container {
         width: 210mm;
         min-width: 210mm;
         height: 297mm;
         min-height: 297mm;
         margin: 0;
         padding: 0;
         box-sizing: border-box;
       }
     `,
   });

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach((key) => {
        if (!payload[key]) delete payload[key];
      });

      await axiosInstance.post("/IncrementLetter", payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Increment Letter submitted successfully");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to submit Increment Letter");
    }
  };

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
            <h2 className="font-bold text-xl">DigiCode Software Pvt. Ltd.</h2>
            <p className="text-sm">123 Main Street City, State ZIP</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="print-footer bottom-0 w-full">
      <img
        src={useDefaultFooter || !customFooter ? assets.Footer : customFooter}
        alt="Footer"
        className="w-full object-cover"
      />
    </div>
  );

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white shadow-md p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Increment Letter</h2>

        {["header", "footer"].map((type) => (
          <div key={type} className="mb-4">
            <label className="block font-semibold mb-1">{type.toUpperCase()} Options</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={type === "header" ? useDefaultHeader : useDefaultFooter}
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
          <p className="text-xs text-gray-500">Logo Size: {formData.logoSize}px</p>
        </div>

        {/* Form Fields */}
        {[
          "fullName",
          "designation",
          "department",
          "dateOfJoining",
          "currentSalary",
          "incrementAmount",
          "effectiveFrom",
          "reason",
          "issueDate",
          "termsAndConditions",
        ].map((field) => (
          <div key={field} className="mb-4">
            <label className="block font-semibold capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
            <input
              type={field.includes("Date") ? "date" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
        ))}

        {/* <button
          onClick={handleSubmit}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary w-full mb-2"
        >
          Submit to API
        </button> */}
        <button
          onClick={handlePrint}
          className="mt-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary w-full"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Preview */}
      <div
        ref={certificateRef}
        className="w-2/3 bg-white m-6 print-container flex flex-col"
      >
        <Header />
        <div className="flex-1 px-10 py-4">
          <h1 className="text-center text-2xl font-bold mb-6">Increment Letter</h1>
          <p className="mb-4 text-justify leading-relaxed">
            This is to certify that <strong>{formData.fullName}</strong>, working as <strong>{formData.designation}</strong> in <strong>{formData.department}</strong> department since <strong>{formData.dateOfJoining}</strong>, is granted an increment of <strong>{formData.incrementAmount}</strong>. 
          </p>
          <p className="mb-4 text-justify leading-relaxed">
            The new salary will be <strong>{formData.currentSalary + formData.incrementAmount}</strong>, effective from <strong>{formData.effectiveFrom}</strong>.
          </p>
          <p className="mb-4 text-justify leading-relaxed">{formData.reason}</p>
          <p className="mb-4 text-justify leading-relaxed">{formData.termsAndConditions}</p>
          <p className="mb-4 text-right">Issued Date: <strong>{formData.issueDate}</strong></p>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default IncrementLetter;
