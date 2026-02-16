import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";

import ExportDailyAttendancePdfModel from "./ExportAttendancePdf/ExportDailyAttendancePdfModel";
import ExportMonthlyAttendancePdfModal from "./ExportAttendancePdf/ExportMonthlyAttendancePdf";
import assets from "../../../../assets/assets";

const dummyTemplates = [
  // {
  //   id: 1,
  //   name: "Daily Attendance Template",
  //   description: "Download Excel template to upload daily attendance.",
  //   imageUrl: assets.SampleAttendance,
  //   type: "template",
  // },
  {
    id: 2,
    name: "Employee Monthly Attendance PDF",
    description: "Download month-wise attendance PDF for a single employee.",
    imageUrl: "https://placehold.co/400x200?text=Employee+PDF",
    type: "employee-pdf",
  },
  {
    id: 3,
    name: "Company Monthly Attendance PDF",
    description: "Download month-wise attendance PDF for all employees.",
    imageUrl: "https://placehold.co/400x200?text=Company+PDF",
    type: "company-pdf",
  },
];

const AttendanceReport = () => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEmployeePdfModal, setShowEmployeePdfModal] = useState(false);
  const [showCompanyPdfModal, setShowCompanyPdfModal] = useState(false);

  const handleAction = (template) => {
    switch (template.type) {
      case "template":
        setShowTemplateModal(true);
        break;

      case "employee-pdf":
        setShowEmployeePdfModal(true);
        break;

      case "company-pdf":
        setShowCompanyPdfModal(true);
        break;

      default:
        break;
    }
  };

  const triggerDownload = (fileUrl, filename) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="p-4 shadow mb-5 sticky top-14 bg-white z-10">
        <h2 className="font-semibold text-xl">
          Payroll Reports For Attendance
        </h2>
      </div>

      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {dummyTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-4 shadow rounded-xl border border-gray-100 flex flex-col justify-between"
          >
            <img
              src={template.imageUrl}
              alt="Template Preview"
              className="rounded-md mb-3 w-full h-40 object-cover"
            />

            <div>
              <h3 className="text-lg font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>

            <button
              onClick={() => handleAction(template)}
              className="mt-4 flex items-center gap-2 text-primary justify-center cursor-pointer font-medium border border-primary hover:bg-primary hover:text-white transition px-3 py-2 rounded-md"
            >
              <FiDownload />
              {template.type === "template"
                ? "Download Template"
                : "Generate PDF"}
            </button>
          </div>
        ))}
      </div>

      {/* ===== Modals ===== */}

      {showEmployeePdfModal && (
        <ExportDailyAttendancePdfModel
          isOpen={showEmployeePdfModal}
          onClose={() => setShowEmployeePdfModal(false)}
        />
      )}

      {showCompanyPdfModal && (
        <ExportMonthlyAttendancePdfModal
          isOpen={showCompanyPdfModal}
          onClose={() => setShowCompanyPdfModal(false)}
        />
      )}
    </>
  );
};

export default AttendanceReport;
