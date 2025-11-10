import React from "react";

export default function ReportTable({ columns, rows, page, perPage, onPageChange }) {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const pagedRows = rows.slice(start, start + perPage);

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="w-full text-sm table-auto">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c, idx) => (
              <th key={idx} className="text-left p-3 border-b">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {r.map((cell, j) => (
                <td key={j} className="p-3 border-b">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between p-3">
        <div className="text-xs text-gray-600">
          Showing {start + 1} - {Math.min(start + perPage, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(1)} disabled={page === 1} className="px-2 py-1 border rounded">First</button>
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded">Prev</button>
          <span className="px-2">{page} / {pageCount}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page === pageCount} className="px-2 py-1 border rounded">Next</button>
          <button onClick={() => onPageChange(pageCount)} disabled={page === pageCount} className="px-2 py-1 border rounded">Last</button>
        </div>
      </div>
    </div>
  );
}
