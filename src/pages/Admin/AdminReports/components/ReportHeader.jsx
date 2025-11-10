import React from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";

export default function ReportHeader({
  title,
  onExportCSV,
  onExportPDF,
  children,
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        {children}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-3 py-1 rounded bg-green-600 text-white"
        >
          <FaFileCsv /> CSV
        </button>
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-3 py-1 rounded bg-red-600 text-white"
        >
          <FaFilePdf /> PDF
        </button>
      </div>
    </div>
  );
}
