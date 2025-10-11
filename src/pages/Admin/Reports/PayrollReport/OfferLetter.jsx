
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import assets from "../../../../assets/assets";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function OfferLetter() {
  const certificateRef = useRef();

  const [useDefaultHeader, setUseDefaultHeader] = useState(true);
  const [useDefaultFooter, setUseDefaultFooter] = useState(true);
  const [customHeader, setCustomHeader] = useState(null);
  const [customFooter, setCustomFooter] = useState(null);

  const [formData, setFormData] = useState({
    logoUrl: assets.Digicode,
    logoSize: 40,
    organizationName: "DigiCode Software Pvt. Ltd.",
    date: "19-Sep-2025",
    employeeName: "Ratnesh Singh",
    employeeAddress: "123 Main Street City, State ZIP",
    subject: "Offer Letter",
    designation: "Manager - Quality Assurance",
    joinDate: "15-Oct-2025",
    conditions:
      "Please refer to the meeting you had with us. As discussed, we are pleased to offer you the position of Manager - Quality Assurance in our organization on the terms and conditions mutually discussed & agreed during the meeting.",
    rules:
      "You will abide by all rules and regulations of the company in vogue from time to time.",
    appointment:
      "You will be issued a detailed appointment letter within one week of your joining the duty.",
    relieving:
      "This offer is subject to your producing relieving certificate from the present employer, if any, at the time of joining the employment of the company.",
    documents:
      "Please bring with you a copy of your educational qualification certificates, five-colored passport sized photographs, Medical fitness certificate, Blood group test report, last 3 month salary slip, Bank statement certificate as well as a copy of this letter of intent.",
    acceptance:
      "Please sign the duplicate copy of this letter as a token of acceptance.",
    signatory: "Authorized Signatory",
    signatureUrl: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = (e, field) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === "logo") setFormData({ ...formData, logoUrl: reader.result });
      else if (field === "header") setCustomHeader(reader.result);
      else if (field === "footer") setCustomFooter(reader.result);
      else if (field === "signature") setFormData({ ...formData, signatureUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = useReactToPrint({
  contentRef: certificateRef,
    pageStyle: `
      @page { 
        size: A4;
        margin: 0;
      }
      body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-container { width:210mm; min-width:210mm; height:297mm; min-height:297mm; margin:0; padding:0; box-sizing:border-box; }
    `,
  });

  const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0]; // yyyy-MM-dd
};

  
const handleSubmit = async () => {
  try {
    const { logoUrl, signatureUrl, ...safeFormData } = formData;

 const payload = {
  candidateName: formData.employeeName,
  address: formData.employeeAddress,
  dateOfJoining: new Date(formData.joinDate).toISOString(),
  issuedDate: new Date(formData.date).toISOString(),
  jobTitle: formData.designation,
  employmentType: "Full-Time",
  salary: 0,
  duration: "Permanent",
  department: "QA",
  templateId: 1,
  customFieldsJson: JSON.stringify({
    conditions: formData.conditions,
    rules: formData.rules,
    appointment: formData.appointment,
    relieving: formData.relieving,
    documents: formData.documents,
    acceptance: formData.acceptance,
    signatory: formData.signatory,
    signatureUrl: formData.signatureUrl,
    logoUrl: formData.logoUrl,
    logoSize: formData.logoSize
  }),
};

    console.log("Final payload:", payload);

    const res = await axiosInstance.post("OfferLetter", payload);
    console.log("Offer letter saved:", res.data);
    toast.success("Offer Letter submitted successfully!");
  } catch (error) {
    console.error("Error submitting offer letter:", error);
    toast.error("Failed to submit offer letter!");
  }
};


  // Reusable Header for print
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
            {/* optional address could be added here if needed */}
          </div>
        </div>
      </div>
    </div>
  );

  // Reusable Footer for print
  const Footer = () => (
    <div className="print-footer absolute bottom-0 w-full">
      <img
        src={useDefaultFooter || !customFooter ? assets.Footer : customFooter}
        alt="Footer"
        className="w-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-center p-4 font-medium text-sm">
        <p>{formData.organizationName}</p>
         <p>{formData.employeeAddress}</p>
        {/* additional footer lines can be enabled */}
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-white shadow-md p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Offer Letter</h2>

        {/* Header/Footer Options */}
        {['header', 'footer'].map((type) => (
          <div key={type} className="mb-4">
            <label className="block font-semibold mb-1">{type.toUpperCase()} Options</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={type === 'header' ? useDefaultHeader : useDefaultFooter}
                onChange={() =>
                  type === 'header' ? setUseDefaultHeader(!useDefaultHeader) : setUseDefaultFooter(!useDefaultFooter)
                }
              />
              <span>Use Default {type}</span>
            </div>
            {((type === 'header' && !useDefaultHeader) || (type === 'footer' && !useDefaultFooter)) && (
              <>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, type)} />
                {(type === 'header' ? customHeader : customFooter) && (
                  <img
                    src={type === 'header' ? customHeader : customFooter}
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
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
          <input
            type="range"
            min="20"
            max="120"
            value={formData.logoSize}
            onChange={(e) => setFormData({ ...formData, logoSize: +e.target.value })}
            className="w-full mt-2"
          />
          <p className="text-xs text-gray-500">Logo Size: {formData.logoSize}px</p>
        </div>

        {/* Editable Fields */}
        {[
          'organizationName',
          'date',
          'employeeName',
          'employeeAddress',
          'subject',
          'designation',
          'joinDate',
          'conditions',
          'rules',
          'appointment',
          'relieving',
          'documents',
          'acceptance',
          'signatory',
        ].map((field) => (
          <div key={field} className="mb-4">
            <label className="block font-semibold capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
            {['conditions', 'rules', 'appointment', 'relieving', 'documents', 'acceptance'].includes(field) ? (
              <textarea name={field} value={formData[field]} onChange={handleChange} className="border p-2 rounded w-full" rows={3} />
            ) : (
              <input type="text" name={field} value={formData[field]} onChange={handleChange} className="border p-2 rounded w-full" />
            )}
          </div>
        ))}

        {/* Header/Footer image is handled above. Signature */}
        <div className="mb-4">
          <label className="block font-semibold">Digital Signature</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'signature')} />
        </div>
        {/* <button
  onClick={handleSubmit}
  className="mt-2 bg-green-600 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-green-700 w-full"
>
  Save
</button> */}

        <button  onClick={handlePrint} className="mt-4 bg-primary cursor-pointer text-white px-4 py-2 rounded-md hover:bg-secondary w-full">
          Print 
        </button>
      </div>

      {/* Preview */}
      <div ref={certificateRef} className="w-2/3 bg-white m-6 overflow-hidden print-container flex flex-col relative">
        <Header />

        <div className="flex-1 px-10 py-6">
          <p className="text-right text-sm mb-6"><strong>Date:</strong> {formData.date}</p>

          <div className="flex justify-between items-start mb-6">
            <div className="max-w-2/3 text-sm">
              <p className="mb-1">To,</p>
              <p className="font-semibold">{formData.employeeName}</p>
              <p className="text-sm">{formData.employeeAddress}</p>
            </div>
           
          </div>

          <h1 className="text-center text-2xl font-bold mb-6">{formData.subject}</h1>

          <div className="text-gray-800 space-y-4 leading-relaxed text-justify">
            <p>Dear Mr. {formData.employeeName.split(' ')[0]},</p>
            <p>{formData.conditions}</p>
            <p>{formData.rules}</p>
            <p>{formData.appointment}</p>
            <p>
              You may join the duty on or before <strong>{formData.joinDate}</strong>.
            </p>
            <p>{formData.relieving}</p>
            <p>{formData.documents}</p>
            <p>{formData.acceptance}</p>
          </div>

          <div className="mt-10 space-y-6">
            <p className="font-semibold">Thanking you,</p>
            <p className="font-bold">{formData.organizationName}</p>
            {formData.signatureUrl && <img src={formData.signatureUrl} alt="Signature" className="h-16 mt-2" />}
            <p className="font-semibold">{formData.signatory}</p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
