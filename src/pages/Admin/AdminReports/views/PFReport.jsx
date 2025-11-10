import React, { useEffect, useState } from "react";
import ReportHeader from "../components/ReportHeader";
import ReportTable from "../components/ReportTable";
import { fetchDummyData, toCSV, downloadFile } from "../utils";

export default function PFReport({ filters }) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const data = fetchDummyData("pf", filters);
    setColumns(data.columns);
    setRows(data.rows);
    setPage(1);
  }, [filters]);

  return (
    <div>
      <ReportHeader
        title={`PF - ${filters.month}`}
        onExportCSV={() =>
          downloadFile("pf.csv", toCSV(columns, rows), "text/csv")
        }
        onExportPDF={() => alert("Add jsPDF for PDF export")}
      />
      <ReportTable columns={columns} rows={rows} page={page} perPage={perPage} onPageChange={setPage} />
    </div>
  );
}
