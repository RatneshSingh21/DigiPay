// Common utilities shared across reports

export const fetchDummyData = (reportKey, filters) => {
  const EMPLOYEES = Array.from({ length: 20 }).map((_, i) => ({
    id: 1000 + i,
    name: `Employee ${i + 1}`,
    department: ["HR", "Sales", "Payroll", "Delivery"][i % 4],
  }));

  switch (reportKey) {
    case "attendance":
      return {
        columns: ["Emp ID", "Name", "Department", "Present Days", "Absent Days"],
        rows: EMPLOYEES.map((e, i) => [e.id, e.name, e.department, 22 - (i % 3), i % 3]),
      };
    case "salary_ot":
    case "salary_no_ot":
      const withOT = reportKey === "salary_ot";
      const columns = ["Emp ID", "Name", "Basic", "HRA", "Conveyance", ...(withOT ? ["OT"] : []), "Net Pay"];
      const rows = EMPLOYEES.map((e, i) => {
        const basic = 20000 + (i % 5) * 1000;
        const hra = basic * 0.2;
        const conv = 1600;
        const ot = withOT ? (i % 2 === 0 ? 1000 : 0) : 0;
        const net = basic + hra + conv + ot;
        return [e.id, e.name, basic, hra, conv, ...(withOT ? [ot] : []), net];
      });
      return { columns, rows };
    default:
      return { columns: [], rows: [] };
  }
};

export const toCSV = (columns, rows) => {
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const header = columns.map(escape).join(",");
  const data = rows.map((r) => r.map(escape).join(",")).join("\n");
  return `${header}\n${data}`;
};

export const downloadFile = (filename, content, mime) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
