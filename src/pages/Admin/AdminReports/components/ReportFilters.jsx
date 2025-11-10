import React from "react";

const EMPLOYEES = Array.from({ length: 10 }).map((_, i) => ({
  id: 1000 + i,
  name: `Employee ${i + 1}`,
}));

export default function ReportFilters({ filters, onChange }) {
  const months = ["2025-11", "2025-10", "2025-09"];

  return (
    <div className="bg-white p-4 rounded-lg mb-4 flex flex-wrap gap-3 items-center">
      <div>
        <label className="block text-xs">Month</label>
        <select
          value={filters.month}
          onChange={(e) => onChange({ ...filters, month: e.target.value })}
          className="border rounded px-2 py-1"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs">Department</label>
        <select
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Payroll">Payroll</option>
          <option value="Delivery">Delivery</option>
        </select>
      </div>

      <div>
        <label className="block text-xs">Employee</label>
        <select
          value={filters.employee}
          onChange={(e) => onChange({ ...filters, employee: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          {EMPLOYEES.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
