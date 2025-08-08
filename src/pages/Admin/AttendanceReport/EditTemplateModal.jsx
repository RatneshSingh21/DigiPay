// import React, { useState } from "react";
// import { FiX } from "react-icons/fi";
// import { saveAs } from "file-saver";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { toast } from "react-toastify";

// const fieldOptions = [
//   "EmpCode",
//   "EmpName",
//   "Dept",
//   "EmpType",
//   "Shift",
//   "inTime",
//   "OutTime",
//   "WorkingHours",
//   "Status",
//   "OTHours",
// ];

// const EditTemplateModal = ({ onClose, templateData }) => {
//   const [selectedFields, setSelectedFields] = useState([]);
//   const [downloadType, setDownloadType] = useState("");

//   const handleFieldChange = (field) => {
//     setSelectedFields((prev) =>
//       prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
//     );
//   };

//   const handleDownload = () => {
//     if (!downloadType || selectedFields.length === 0) {
//       toast.warn("Please select at least one field and file type.");
//       return;
//     }

//     const filteredData = templateData.map((row) => {
//       const obj = {};
//       selectedFields.forEach((field) => {
//         obj[field] = row[field];
//       });
//       return obj;
//     });

//     if (downloadType === "excel") {
//       const ws = XLSX.utils.json_to_sheet(filteredData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
//       const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//       const blob = new Blob([excelBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });
//       saveAs(blob, "AttendanceReport.xlsx");
//       onClose();
//     }

//     if (downloadType === "pdf") {
//       const doc = new jsPDF();
//       const tableBody = filteredData.map((row) =>
//         selectedFields.map((field) => row[field])
//       );
//       autoTable(doc, {
//         head: [selectedFields],
//         body: tableBody,
//       });
//       doc.save("AttendanceReport.pdf");
//       onClose();
//     }
//   };

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
//         <button onClick={onClose} className="absolute top-2 right-2 text-xl">
//           <FiX />
//         </button>
//         <h2 className="text-lg font-semibold mb-4">Select Fields to Include</h2>

//         <div className="grid grid-cols-2 gap-3 mb-4">
//           {fieldOptions.map((field) => (
//             <label key={field} className="flex gap-2 items-center">
//               <input
//                 type="checkbox"
//                 checked={selectedFields.includes(field)}
//                 onChange={() => handleFieldChange(field)}
//               />
//               {field}
//             </label>
//           ))}
//         </div>

//         <div className="flex gap-4 mb-4">
//           <button
//             className={`px-4 py-2 border rounded ${
//               downloadType === "excel" ? "bg-secondary text-white" : ""
//             }`}
//             onClick={() => setDownloadType("excel")}
//           >
//             Excel
//           </button>
//           <button
//             className={`px-4 py-2 border rounded-md ${
//               downloadType === "pdf" ? "bg-secondary text-white" : ""
//             }`}
//             onClick={() => setDownloadType("pdf")}
//           >
//             PDF
//           </button>
//         </div>

//         <button
//           className="w-full bg-primary text-white py-2 rounded-md"
//           onClick={handleDownload}
//         >
//           Download Report
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EditTemplateModal;

import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import Select from "react-select";

const EditTemplateModal = ({
  onClose,
  templateData,
  fieldOptions,
  viewType,
}) => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [downloadType, setDownloadType] = useState("");
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);

  const handleFieldChange = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleDownload = () => {
    if (!downloadType || selectedFields.length === 0) {
      toast.warn("Please select at least one field and file type.");
      return;
    }

    const groupedFields = {
      Rate: ["basic", "DA", "HRA", "conveyance", "med", "ot", "total"],
      Earnings: [
        "basic",
        "DA",
        "HRA",
        "conveyance",
        "med",
        "ot",
        "total",
        "specialAllowance",
      ],
      Deductions: ["TDS", "PF", "ESIC", "Loan", "Advanced", "total"],
    };

    let finalFields = [];

    selectedFields.forEach((field) => {
      if (
        (viewType === "salary" || viewType === "allSalary") &&
        groupedFields[field]
      ) {
        finalFields.push(
          ...groupedFields[field].map((sub) => `${field}.${sub}`)
        );
      } else {
        finalFields.push(field);
      }
    });

    // ⏬ STEP 1: Inject date columns if viewType is monthly
    if (viewType === "monthly") {
      const dateFields = Array.from({ length: 31 }, (_, i) =>
        String(i + 1).padStart(2, "0")
      );
      finalFields = [...finalFields, ...dateFields];
    }

    // ⏬ STEP 2: Filter data accordingly
    const getValue = (row, path) => {
      const keys = path.split(".");
      return keys.reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""),
        row
      );
    };

    const filteredData =
      viewType === "salary"
        ? [templateData[selectedEmployeeIndex]].map((row) => {
            const obj = {};
            finalFields.forEach((field) => {
              obj[field] = getValue(row, field);
            });
            return obj;
          })
        : templateData.map((row) => {
            const obj = {};
            finalFields.forEach((field) => {
              obj[field] = getValue(row, field);
            });
            return obj;
          });

    // ⏬ STEP 3: Excel Export
    if (downloadType === "excel") {
      // Prepare rows: [header, ...dataRows]
      const headerRow = finalFields.map((field) => {
        if (field.includes(".")) {
          const [group, sub] = field.split(".");
          return `${sub} (${group})`; // e.g. "basic (Earnings)"
        }
        return field;
      });
      const dataRows = filteredData.map((row) =>
        finalFields.map((field) => row[field] || "")
      );
      const sheetData = [headerRow, ...dataRows];

      const ws = XLSX.utils.aoa_to_sheet(sheetData); // 🔄 use aoa_to_sheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      if (viewType === "daily" || viewType === "monthly") {
        saveAs(blob, "AttendanceReport.xlsx");
      } else {
        saveAs(blob, "SalaryReport.xlsx");
      }
      onClose();
    }

    // ⏬ STEP 4: PDF Export
    if (downloadType === "pdf") {
      const doc = new jsPDF("landscape", "pt", "a4");
      const tableBody = filteredData.map((row) =>
        finalFields.map((field) => row[field] || "")
      );
      autoTable(doc, {
        head: [finalFields],
        body: tableBody,
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255,
        },
        startY: 20,
        theme: "grid",
        margin: { top: 30, left: 10, right: 10 },
        tableWidth: "auto",
        pageBreak: "auto",
      });
      doc.save("AttendanceReport.pdf");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
        >
          <FiX />
        </button>

        {viewType !== "salary" ? (
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
            Select Fields to Include
          </h2>
        ) : null}

        {viewType === "salary" && (
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              Select Employee
            </label>
            <Select
              options={templateData.map((emp, idx) => ({
                value: idx,
                label: `${emp.EmployeeName} (${emp.EmpCode})`,
              }))}
              value={{
                value: selectedEmployeeIndex,
                label: `${templateData[selectedEmployeeIndex]?.EmployeeName} (${templateData[selectedEmployeeIndex]?.EmpCode})`,
              }}
              onChange={(selectedOption) =>
                setSelectedEmployeeIndex(selectedOption.value)
              }
              className="w-full"
            />
          </div>
        )}

        <button
          onClick={() => {
            if (selectedFields.length === fieldOptions.length) {
              setSelectedFields([]); // Deselect all
            } else {
              setSelectedFields([...fieldOptions]); // Select all
            }
          }}
          className="mb-4 px-2 py-0.5 rounded-sm border border-primary hover:bg-primary hover:text-white  text-primary "
        >
          {selectedFields.length === fieldOptions.length
            ? "Deselect All"
            : "Select All"}
        </button>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-6">
          {fieldOptions.map((field) => (
            <label key={field} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-primary"
                checked={selectedFields.includes(field)}
                onChange={() => {
                  setSelectedFields((prev) =>
                    prev.includes(field)
                      ? prev.filter((f) => f !== field)
                      : [...prev, field]
                  );
                }}
              />
              {field}
            </label>
          ))}
        </div>

        <div className="flex gap-4 mb-6 justify-center">
          <button
            className={`px-5 py-2 rounded-lg border border-gray-300 transition-all duration-200 ${
              downloadType === "excel"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setDownloadType("excel")}
          >
            Excel
          </button>

          {viewType !== "salary" && viewType !== "allSalary" ? (
            <button
              className={`px-5 py-2 rounded-lg border border-gray-300 transition-all duration-200 ${
                downloadType === "pdf"
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setDownloadType("pdf")}
            >
              PDF
            </button>
          ) : null}
        </div>
        <button
          className="w-full py-2 border border-primary hover:bg-primary hover:text-white  text-primary font-semibold rounded-lg  transition-all"
          onClick={handleDownload}
        >
          Download Report
        </button>
      </div>
    </div>
  );
};

export default EditTemplateModal;