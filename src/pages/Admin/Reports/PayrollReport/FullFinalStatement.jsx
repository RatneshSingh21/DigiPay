import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import assets from "../../../../assets/assets";
import { toast } from "react-toastify";

const FullAndFinalSettlementEditor = () => {
  const certificateRef = useRef();

  const [useDefaultHeader, setUseDefaultHeader] = useState(true);
  const [useDefaultFooter, setUseDefaultFooter] = useState(true);
  const [customHeader, setCustomHeader] = useState(null);
  const [customFooter, setCustomFooter] = useState(null);

  const [formData, setFormData] = useState({
    logoUrl: assets.Digicode,
    logoSize: 50,
    organizationName: "DigiCode Software Pvt. Ltd.",
    organizationAddress: "123 Main Street, City, State, ZIP",

    paycode: "0011",
    dateOfJoining: "2008-08-01",
    dateOfSettlement: "2025-09-19",
    employeeName: "Moyoukh Das",
    fatherName: "Sh. Mohan Lal Das",
    lastWorkingDay: "2025-08-31",
    department: "Marketing-Medical Devices",
    daysEncashable: 10,
    designation: "Jr. Manager",
    lastSalaryProcessed: "Aug-2025",
    issueDate: new Date().toISOString().slice(0, 10),
    amountInWords: "One lakh fifty one thousand six hundred twenty",
    netPayable: 151620,

    signatureUrl: "",
  });

  const [earnings, setEarnings] = useState([
    { description: "BASIC+DA", rate: 26000, amount: 52000 },
    { description: "HRA", rate: 10400, amount: 20800 },
    { description: "Skill Premium", rate: 39410, amount: 78820 },
    { description: "Bonus", rate: 0, amount: 0 },
    { description: "Leave Encash", rate: 0, amount: 0 },
    { description: "Gratuity (0 Years)", rate: 0, amount: 0 },
  ]);

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDeductions = 0;

  // For editing earnings dynamically
  const handleEarningsChange = (index, field, value) => {
    const updated = [...earnings];
    updated[index][field] = value;
    setEarnings(updated);
  };

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

  const Header = () => (
    <div className="print-header relative w-full">
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
  );

  const Footer = () => (
    <div className="print-footer absolute bottom-0 w-full">
      <img
        src={useDefaultFooter || !customFooter ? assets.Footer : customFooter}
        alt="Footer"
        className="w-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-center p-3 text-xs font-medium">
        <p>{formData.organizationName}</p>
        <p>{formData.organizationAddress}</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-100">
      {/* Left Form Panel */}
      <div className="w-1/3 bg-white shadow-md p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          Edit Full & Final Settlement
        </h2>

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
                <img
                  src={type === "header" ? customHeader : customFooter}
                  alt={`${type} preview`}
                  className="h-16 mt-2 object-contain"
                />
              </>
            )}
          </div>
        ))}

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

        {Object.entries(formData)
          .filter(([key]) => !["logoUrl", "logoSize"].includes(key))
          .map(([key, value]) => (
            <div key={key} className="mb-3">
              <label className="block font-semibold capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={key.toLowerCase().includes("date") ? "date" : "text"}
                name={key}
                value={value}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}

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
          className="mt-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary w-full"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Right Preview Panel */}
      <div
        ref={certificateRef}
        className="w-2/3 bg-white m-6 overflow-hidden print-container flex flex-col relative border shadow-lg"
      >
        <Header />
        <div className="flex-1 px-10 py-4 text-sm">
          <h1 className="text-center font-bold text-lg underline mt-4">
            FULL & FINAL SETTLEMENT
          </h1>

          <div className="grid grid-cols-2 gap-x-4 mt-6 text-sm">
            <p>
              <strong>Paycode:</strong> {formData.paycode}
            </p>
            <p>
              <strong>Date of Joining:</strong> {formData.dateOfJoining}
            </p>
            <p>
              <strong>Employee's Name:</strong> {formData.employeeName}
            </p>
            <p>
              <strong>Date of F&F Settlement:</strong>{" "}
              {formData.dateOfSettlement}
            </p>
            <p>
              <strong>Father's Name:</strong> {formData.fatherName}
            </p>
            <p>
              <strong>Date of Last Working Day:</strong>{" "}
              {formData.lastWorkingDay}
            </p>
            <p>
              <strong>Department:</strong> {formData.department}
            </p>
            <p>
              <strong>Days for Encashable Leaves:</strong>{" "}
              {formData.daysEncashable}
            </p>
            <p>
              <strong>Designation:</strong> {formData.designation}
            </p>
            <p>
              <strong>Last Salary Processed:</strong>{" "}
              {formData.lastSalaryProcessed}
            </p>
          </div>

          {/* Earnings Table */}
          <table className="w-full border mt-4 text-xs">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="border p-1 text-left">Descriptions</th>
                <th className="border p-1 text-right">Rates</th>
                <th className="border p-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1">
                  Net Salary for the month of Aug-2025 (31 Days)
                </td>
                <td className="border p-1 text-right">—</td>
                <td className="border p-1 text-right">—</td>
              </tr>
              {earnings.map((row, i) => (
                <tr key={i}>
                  <td className="border p-1">{row.description}</td>
                  <td className="border p-1 text-right">{row.rate}</td>
                  <td className="border p-1 text-right">{row.amount}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="border p-1 text-right">Total Earnings (a)</td>
                <td className="border p-1 text-right">{totalEarnings / 2}</td>
                <td className="border p-1 text-right">{totalEarnings}</td>
              </tr>
            </tbody>
          </table>

          {/* Deductions and Amount */}
          <div className="mt-4 text-right">
            <p>
              <strong>Total Deductions (b):</strong> {totalDeductions}
            </p>
            <p>
              <strong>Net Payable / Recoverable (a-b):</strong>{" "}
              {formData.netPayable}
            </p>
            <p className="mt-2">
              <strong>Amount in Words:</strong> {formData.amountInWords}
            </p>
          </div>

          {/* Declaration */}
          <div className="mt-6 text-justify leading-relaxed text-xs border-t pt-3">
            <p>
              I, <strong>{formData.employeeName}</strong> S/o{" "}
              <strong>{formData.fatherName}</strong>, worked as{" "}
              <strong>
                {formData.designation} / {formData.department}
              </strong>{" "}
              declare that I agree the above full and final settlement with{" "}
              {formData.organizationName}. I have received Rs.{" "}
              <strong>{formData.netPayable}</strong> towards the full & final
              settlement of my service account with the organization.
            </p>
            <p className="mt-2">
              I also declare that I’ve received all my dues including leaves,
              gratuity, compensation etc. and no dues remain in my account.
              After this receipt, I have no right for any further claims with{" "}
              {formData.organizationName}.
            </p>
          </div>

          <div className="mt-4 leading-relaxed text-xs">
            <span>
              Witness 1: _________________________
              <span className="ml-8">Date: ____________</span>
            </span>
          </div>

          <div className="mt-4 leading-relaxed text-xs">
            <span>
              Prepared By: ___________________
              <span>Checked By: _____________________</span>
            </span>
          </div>

          <div className="text-left mt-6">
            {formData.signatureUrl && (
              <img
                src={formData.signatureUrl}
                alt="Signature"
                className="h-12 mb-1"
              />
            )}
            <p>Authorized By</p>
          </div>

          <div className="text-left mt-6">
            <p>Signature of Employee: _____________________</p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default FullAndFinalSettlementEditor;
