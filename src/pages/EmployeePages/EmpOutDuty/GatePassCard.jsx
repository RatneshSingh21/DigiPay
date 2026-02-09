import { useRef } from "react";
import { FiPrinter, FiX } from "react-icons/fi";
import { useReactToPrint } from "react-to-print";
import QRCode from "react-qr-code";

const GatePassCard = ({ data, onClose }) => {
  const printRef = useRef(null);
  const employee = data.employee;

  const approverNames = data.approvalHistory?.length
    ? data.approvalHistory
        .map(
          (a) =>
            `${a.approverName || "System"} (${a.approverType}) - ${a.status}`,
        )
        .join(", ")
    : "N/A";

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `GatePass-${employee?.employeeCode || ""}-${
      employee?.fullName || ""
    }`,
    removeAfterPrint: true,
  });

  const qrData = `
Employee: ${employee.fullName} (${employee.employeeCode})
Reason: ${data.reason}
From: ${new Date(data.inDateTime).toLocaleString("en-GB")}
To: ${new Date(data.outDateTime).toLocaleString("en-GB")}
Total: ${(data.totalTime / 60).toFixed(1)} hrs
Approver: ${approverNames}
Status: Approved
`.trim();

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-xl p-5 shadow-2xl w-full max-w-md relative print:hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700"
        >
          <FiX size={22} />
        </button>

        {/* PRINTABLE AREA */}
        <div
          ref={printRef}
          className="p-6 border border-gray-300 rounded-lg shadow-sm bg-white print:shadow-none print:border print:border-gray-400"
        >
          <h1 className="text-center text-2xl font-extrabold mb-1 tracking-wide">
            COMPANY GATE PASS
          </h1>
          <p className="text-center text-xs text-gray-500 mb-4">
            (System Generated – No Signature Required)
          </p>

          {/* CONTENT + QR ROW */}
          <div className="flex justify-between items-start gap-4">
            {/* LEFT SIDE DETAILS */}
            <div className="text-sm space-y-1 leading-relaxed w-2/3">
              {employee && (
                <p>
                  <strong>Employee Name:</strong> {employee.fullName} (
                  {employee.employeeCode})
                </p>
              )}

              <p>
                <strong>Reason:</strong> {data.reason}
              </p>

              <p>
                <strong>From:</strong>{" "}
                {new Date(data.inDateTime).toLocaleString("en-GB")}
              </p>

              <p>
                <strong>To:</strong>{" "}
                {new Date(data.outDateTime).toLocaleString("en-GB")}
              </p>

              <p>
                <strong>Total Duration:</strong>{" "}
                {(data.totalTime / 60).toFixed(1)} hrs
              </p>

              <p>
                <strong>Approver:</strong> {approverNames}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="text-green-700 font-semibold">Approved</span>
              </p>
            </div>

            {/* RIGHT SIDE QR */}
            <div className="w-1/3 flex justify-end">
              <QRCode value={qrData} size={110} />
            </div>
          </div>

          <div className="mt-6 pt-3 border-t text-center text-xs text-gray-500">
            This Gate Pass is digitally generated for authorized movement.
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-between mt-5 gap-3 print:hidden">
          <button
            onClick={onClose}
            className="w-1/2 py-2 bg-gray-200 text-gray-800 cursor-pointer rounded-lg hover:bg-gray-300"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="w-1/2 py-2 bg-primary hover:bg-secondary cursor-pointer text-white rounded-lg flex items-center justify-center gap-2"
          >
            <FiPrinter size={18} /> Print Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default GatePassCard;
