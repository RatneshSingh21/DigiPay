import React, { useEffect, useState } from "react";
import ReportHeader from "../components/ReportHeader";
import ReportTable from "../components/ReportTable";
import { fetchDummyData, toCSV, downloadFile } from "../utils";

export default function SalaryReport({ filters, withOT }) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const data = fetchDummyData(withOT ? "salary_ot" : "salary_no_ot", filters);
    setColumns(data.columns);
    setRows(data.rows);
    setPage(1);
  }, [filters, withOT]);

  return (
    <div>
      <ReportHeader
        title={`Salary Report ${withOT ? "(With OT)" : "(Without OT)"}`}
        onExportCSV={() =>
          downloadFile(`salary_${withOT ? "with_ot" : "no_ot"}.csv`, toCSV(columns, rows), "text/csv")
        }
        onExportPDF={() => alert("Add jsPDF for PDF export")}
      />
      <ReportTable columns={columns} rows={rows} page={page} perPage={perPage} onPageChange={setPage} />
    </div>
  );
}
