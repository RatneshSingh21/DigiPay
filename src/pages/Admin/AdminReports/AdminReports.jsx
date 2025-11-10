// AdminReports.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import {
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";

/*
Features added:
- Add Row (creates a local temp row with negative id)
- Delete Row (marks row as deleted locally)
- Edited cell/row highlighting (via cellClassName & getRowClassName)
- Undo / Redo implemented as snapshot stacks (rows, editedRows, deletedIds, nextTempId)
- Change Tracker panel listing inserts / updates / deletes
- Save All -> builds { reportType, inserts, updates, deletes } -> POST /api/Reports/sync
Note: Uses mock data loader. Replace axios URL if required.
*/

const makeDummy = (reportType) => {
  switch (reportType) {
    case "attendance":
      return [
        {
          id: 1,
          employeeName: "John Doe",
          date: "2025-11-01",
          status: "Present",
        },
        {
          id: 2,
          employeeName: "Jane Smith",
          date: "2025-11-01",
          status: "Absent",
        },
      ];
    case "salaryWithOT":
      return [
        {
          id: 1,
          employeeName: "John Doe",
          salary: 50000,
          otHours: 5,
          netSalary: 52500,
        },
        {
          id: 2,
          employeeName: "Jane Smith",
          salary: 45000,
          otHours: 3,
          netSalary: 46200,
        },
      ];
    case "bonus":
      return [
        { id: 1, employeeName: "John Doe", bonusAmount: 5000 },
        { id: 2, employeeName: "Jane Smith", bonusAmount: 3000 },
      ];
    default:
      return [];
  }
};

export default function AdminReports() {
  const [reportType, setReportType] = useState("salaryWithOT");

  // core table state
  const [rows, setRows] = useState([]);
  const [editedRows, setEditedRows] = useState({}); // map id -> partial changes
  const [deletedIds, setDeletedIds] = useState(new Set()); // set of ids removed
  const [nextTempId, setNextTempId] = useState(-1); // negative ids for new rows

  // undo/redo stacks store snapshots: { rows, editedRows, deletedIds, nextTempId }
  const undoRef = useRef([]);
  const redoRef = useRef([]);

  const [loading, setLoading] = useState(false);

  // load mock data whenever report changes
  useEffect(() => {
    resetAll(makeDummy(reportType));
  }, [reportType]);

  const resetAll = (initialRows) => {
    // push nothing on initial load
    setRows(initialRows);
    setEditedRows({});
    setDeletedIds(new Set());
    setNextTempId(-1);
    undoRef.current = [];
    redoRef.current = [];
  };

  // Helper: snapshot push
  const pushSnapshot = () => {
    // shallow-clone sets/objects
    const snapshot = {
      rows: JSON.parse(JSON.stringify(rows)),
      editedRows: JSON.parse(JSON.stringify(editedRows)),
      deletedIds: Array.from(deletedIds),
      nextTempId,
    };
    undoRef.current.push(snapshot);
    // on new change clear redo
    redoRef.current = [];
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (undoRef.current.length === 0) return;
    const last = undoRef.current.pop();
    // push current to redo
    redoRef.current.push({
      rows: JSON.parse(JSON.stringify(rows)),
      editedRows: JSON.parse(JSON.stringify(editedRows)),
      deletedIds: Array.from(deletedIds),
      nextTempId,
    });
    // restore last
    setRows(last.rows);
    setEditedRows(last.editedRows);
    setDeletedIds(new Set(last.deletedIds));
    setNextTempId(last.nextTempId);
  };

  const handleRedo = () => {
    if (redoRef.current.length === 0) return;
    const last = redoRef.current.pop();
    undoRef.current.push({
      rows: JSON.parse(JSON.stringify(rows)),
      editedRows: JSON.parse(JSON.stringify(editedRows)),
      deletedIds: Array.from(deletedIds),
      nextTempId,
    });
    setRows(last.rows);
    setEditedRows(last.editedRows);
    setDeletedIds(new Set(last.deletedIds));
    setNextTempId(last.nextTempId);
  };

  // columns (editable)
  const getColumns = () => {
    const base = [
      { field: "id", headerName: "ID", width: 90, editable: false },
    ];

    switch (reportType) {
      case "attendance":
        return [
          ...base,
          {
            field: "employeeName",
            headerName: "Employee",
            flex: 1,
            editable: true,
            cellClassName: (params) =>
              isCellEdited(params) ? "edited-cell" : "",
          },
          {
            field: "date",
            headerName: "Date",
            flex: 1,
            editable: true,
            cellClassName: (params) =>
              isCellEdited(params) ? "edited-cell" : "",
          },
          {
            field: "status",
            headerName: "Status",
            flex: 1,
            editable: true,
          },
        ];
      case "salaryWithOT":
        return [
          ...base,
          {
            field: "employeeName",
            headerName: "Employee",
            flex: 1,
            editable: true,
            cellClassName: (params) =>
              isCellEdited(params) ? "edited-cell" : "",
          },
          {
            field: "salary",
            headerName: "Salary",
            flex: 1,
            editable: true,
            type: "number",
            cellClassName: (params) =>
              isCellEdited(params) ? "edited-cell" : "",
          },
          {
            field: "otHours",
            headerName: "OT Hours",
            flex: 1,
            editable: true,
            type: "number",
            cellClassName: (params) =>
              isCellEdited(params) ? "edited-cell" : "",
          },
          {
            field: "netSalary",
            headerName: "Net Salary",
            flex: 1,
            editable: true,
            type: "number",
            cellClassName: (params) =>
              isCellEdited(params) ? "edited-cell" : "",
          },
          {
            field: "__actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
              <button
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                onClick={() => handleDeleteRow(params.id)}
              >
                Delete
              </button>
            ),
          },
        ];
      case "bonus":
        return [
          ...base,
          {
            field: "employeeName",
            headerName: "Employee",
            flex: 1,
            editable: true,
            cellClassName: (p) => (isCellEdited(p) ? "edited-cell" : ""),
          },
          {
            field: "bonusAmount",
            headerName: "Bonus Amount",
            flex: 1,
            editable: true,
            type: "number",
            cellClassName: (p) => (isCellEdited(p) ? "edited-cell" : ""),
          },
          {
            field: "__actions",
            headerName: "Actions",
            width: 120,
            renderCell: (params) => (
              <button
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                onClick={() => handleDeleteRow(params.id)}
              >
                Delete
              </button>
            ),
          },
        ];
      default:
        return base;
    }
  };

  // Determine if a particular cell is edited (for highlighting)
  const isCellEdited = (params) => {
    const id = params.id;
    const field = params.field;
    if (!editedRows) return false;
    const entry = editedRows[id];
    return entry && Object.prototype.hasOwnProperty.call(entry, field);
  };

  // row class name (if whole row edited)
  const getRowClassName = (params) => {
    return editedRows[params.id] ? "edited-row" : "";
  };

  // DataGrid processRowUpdate callback when user edits a row
  const processRowUpdate = (newRow, oldRow) => {
    // newRow contains full row after edit
    // compute changed fields (diff)
    const diff = {};
    Object.keys(newRow).forEach((k) => {
      if (k === "id") return;
      const oldVal = oldRow[k];
      const newVal = newRow[k];
      // loose equality check
      if (String(oldVal) !== String(newVal)) diff[k] = newVal;
    });

    if (Object.keys(diff).length === 0) return newRow; // nothing changed

    pushSnapshot();

    // Save partial changes in editedRows map
    setEditedRows((prev) => {
      const existing = prev[newRow.id] ? { ...prev[newRow.id] } : {};
      const merged = { ...existing, ...diff };
      return { ...prev, [newRow.id]: merged };
    });

    // Also update rows state (so grid shows updated value)
    setRows((prev) =>
      prev.map((r) => (r.id === newRow.id ? { ...r, ...diff } : r))
    );

    return newRow;
  };

  const handleRowEditError = (err) => {
    console.error("Row edit error:", err);
  };

  // Add Row
  const handleAddRow = () => {
    pushSnapshot();
    const tempId = nextTempId;
    setNextTempId((n) => n - 1);
    const template = getColumns()
      .filter((c) => !c.field.startsWith("__") && c.field !== "id")
      .reduce((acc, c) => ({ ...acc, [c.field]: "" }), {});
    const newRow = { id: tempId, ...template };
    setRows((prev) => [newRow, ...prev]);
    // mark inserted rows in editedRows as full object (so change tracker can show)
    setEditedRows((prev) => ({ ...prev, [tempId]: { ...newRow } }));
  };

  // Delete Row (local)
  const handleDeleteRow = (id) => {
    pushSnapshot();
    // if it's a new temp row, simply remove from rows and remove any edited entry
    if (id < 0) {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setEditedRows((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }
    // for persisted row, mark as deleted (and remove from displayed rows)
    setDeletedIds((prev) => {
      const copy = new Set(Array.from(prev));
      copy.add(id);
      return copy;
    });
    setRows((prev) => prev.filter((r) => r.id !== id));
    // keep editedRows (so if user undeletes we can reuse)
  };

  // Save All Changes -> builds sync request
  const handleSaveAll = async () => {
    // Build inserts (editedRows entries with id < 0)
    const inserts = [];
    const updates = [];
    const deletes = Array.from(deletedIds);

    for (const [idStr, changes] of Object.entries(editedRows)) {
      const id = Number(idStr);
      if (id < 0) {
        // new insert: we may want the current row values (rows list has it)
        const fullRow = rows.find((r) => r.id === id) || changes;
        const copy = { ...fullRow };
        delete copy.id; // server will assign id
        inserts.push(copy);
      } else {
        // update: only send changed fields plus id
        updates.push({ id, ...changes });
      }
    }

    const payload = {
      reportType,
      inserts,
      updates,
      deletes,
    };

    try {
      setLoading(true);
      // example endpoint: POST /api/Reports/sync
      // NOTE: currently this app is mock-only. Comment axios call if you do not have backend yet.
      await axios.post("/api/Reports/sync", payload);
      alert("Saved successfully (server responded).");

      // On success: clear trackers and ideally reload from server.
      // For mock, we integrate inserts by converting temp ids to fake positive ids (demo)
      // We'll assign new positive ids locally (simulate server response)
      if (inserts.length > 0) {
        // simulate server assigned ids
        const maxId = rows.reduce((m, r) => (r.id > m ? r.id : m), 0);
        let nextId = Math.max(1, maxId) + 1;
        const insertedRows = inserts.map((ins) => ({ id: nextId++, ...ins }));
        // remove temp rows
        const remaining = rows.filter((r) => r.id >= 0);
        setRows([...insertedRows, ...remaining]);
      }
      // clear trackers
      setEditedRows({});
      setDeletedIds(new Set());
      redoRef.current = [];
      undoRef.current = [];
    } catch (err) {
      console.error(err);
      alert("Save failed: " + (err?.message || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  // Export helpers: CSV & PDF
  const handleExportCSV = () => {
    // CSV handled by react-csv (we use CSVLink in toolbar later), but here's a simple approach:
    // you can integrate CSVLink as in original code. left as-is.
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Report: ${reportType}`, 10, 10);
    autoTable(doc, {
      head: [
        getColumns()
          .filter((c) => !c.field.startsWith("__"))
          .map((col) => col.headerName),
      ],
      body: rows.map((row) =>
        getColumns()
          .filter((c) => !c.field.startsWith("__"))
          .map((col) => row[col.field] ?? "")
      ),
    });
    doc.save(`${reportType}-report.pdf`);
  };

  // Custom toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer
      sx={{ display: "flex", justifyContent: "space-between", gap: 2, p: 1 }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="contained" size="small" onClick={handleAddRow}>
          Add Row
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={handleSaveAll}
          disabled={
            loading ||
            (Object.keys(editedRows).length === 0 && deletedIds.size === 0)
          }
        >
          {loading ? "Saving..." : "Save All"}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            pushSnapshot();
            setRows(makeDummy(reportType));
            setEditedRows({});
            setDeletedIds(new Set());
          }}
        >
          Reset (mock)
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleUndo}
          disabled={undoRef.current.length === 0}
        >
          Undo
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleRedo}
          disabled={redoRef.current.length === 0}
        >
          Redo
        </Button>

        <Button variant="outlined" size="small" onClick={handleExportPDF}>
          Export PDF
        </Button>
        <CSVLink
          data={rows}
          filename={`${reportType}-report.csv`}
          className="MuiButton-root MuiButton-outlined MuiButton-sizeSmall"
          style={{
            textDecoration: "none",
            padding: "6px 10px",
            borderRadius: 4,
          }}
        >
          Export CSV
        </CSVLink>
      </div>

      <div>
        <GridToolbarExport />
      </div>
    </GridToolbarContainer>
  );

  // change tracker display: derived lists
  const insertsList = Object.entries(editedRows)
    .filter(([id]) => Number(id) < 0)
    .map(([id, obj]) => ({ id: Number(id), ...obj }));
  const updatesList = Object.entries(editedRows)
    .filter(([id]) => Number(id) >= 0)
    .map(([id, obj]) => ({ id: Number(id), ...obj }));
  const deletesList = Array.from(deletedIds);

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <FormControl size="small">
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            label="Report Type"
            onChange={(e) => setReportType(e.target.value)}
            sx={{ width: 220 }}
          >
            <MenuItem value="attendance">Attendance</MenuItem>
            <MenuItem value="salaryWithOT">Salary With OT</MenuItem>
            <MenuItem value="salaryWithoutOT">Salary Without OT</MenuItem>
            <MenuItem value="esi">ESI</MenuItem>
            <MenuItem value="pf">PF</MenuItem>
            <MenuItem value="bonus">Bonus</MenuItem>
          </Select>
        </FormControl>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ background: "#fff", padding: 8, borderRadius: 6 }}>
            Edited: <strong>{Object.keys(editedRows).length}</strong>
          </div>
          <div style={{ background: "#fff", padding: 8, borderRadius: 6 }}>
            Deleted: <strong>{deletedIds.size}</strong>
          </div>
        </div>
      </div>

      <div style={{ height: 520, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={getColumns()}
          pageSize={10}
          rowsPerPageOptions={[10]}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleRowEditError}
          components={{
            Toolbar: CustomToolbar,
          }}
          getRowClassName={getRowClassName}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </div>

      {/* Change Tracker */}
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <div
          style={{
            flex: 1,
            background: "#fafafa",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <h4>Inserted Rows (local)</h4>
          {insertsList.length === 0 ? (
            <div className="text-sm text-gray-500">— none —</div>
          ) : (
            insertsList.map((r) => (
              <div
                key={r.id}
                style={{ padding: 6, borderBottom: "1px solid #eee" }}
              >
                TempId: {r.id} • {JSON.stringify(r)}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            flex: 1,
            background: "#fafafa",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <h4>Updated Rows</h4>
          {updatesList.length === 0 ? (
            <div className="text-sm text-gray-500">— none —</div>
          ) : (
            updatesList.map((r) => (
              <div
                key={r.id}
                style={{ padding: 6, borderBottom: "1px solid #eee" }}
              >
                Id: {r.id} • {JSON.stringify(r)}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            width: 200,
            background: "#fff7f7",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <h4>Deleted IDs</h4>
          {deletesList.length === 0 ? (
            <div className="text-sm text-gray-500">— none —</div>
          ) : (
            deletesList.map((id) => (
              <div
                key={id}
                style={{ padding: 6, borderBottom: "1px solid #eee" }}
              >
                {id}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSS for edited highlighting */}
      <style>{`
        .edited-cell { background: linear-gradient(90deg,#fff8e1,#fff3c2) !important; }
        .edited-row .MuiDataGrid-cell { background: linear-gradient(90deg,#f0f9ff,#e6f2ff) !important; }
      `}</style>
    </div>
  );
}
