import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiInbox, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { ChevronDown, ChevronUp } from "lucide-react";

const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

const ShiftMapping = () => {
  const [shiftMappings, setShiftMappings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    employeeId: "",
    shiftIds: [],
    effectiveFrom: "",
    effectiveTo: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [m, e, s] = await Promise.all([
        axiosInstance.get("/ShiftMapping/all"),
        axiosInstance.get("/Employee"),
        axiosInstance.get("/shift"),
      ]);

      setShiftMappings(m.data?.data || []);
      setEmployees(Array.isArray(e.data) ? e.data : []);
      setShifts(Array.isArray(s.data) ? s.data : []);
    } finally {
      setLoading(false);
    }
  };

  // GROUP BY EMPLOYEE
  useEffect(() => {
    if (!shiftMappings.length) return;

    const map = {};
    shiftMappings.forEach((m) => {
      if (!map[m.employeeId]) map[m.employeeId] = [];
      map[m.employeeId].push(m);
    });

    const result = Object.entries(map).map(([empId, rows]) => {
      const emp = employees.find((e) => e.id === Number(empId));

      return {
        employeeId: Number(empId),
        employeeName: emp
          ? `${emp.fullName} (${emp.employeeCode})`
          : `Emp#${empId}`,
        rows: rows.map((r) => ({
          ...r,
          shiftName:
            shifts.find((s) => s.id === r.shiftId)?.shiftName ||
            `Shift#${r.shiftId}`,
        })),
        total: rows.length,
      };
    });

    setGrouped(result);
  }, [shiftMappings, employees, shifts]);

  const handleAssign = async (e) => {
    e.preventDefault();

    const { employeeId, shiftIds, effectiveFrom, effectiveTo } = form;
    if (!employeeId || !shiftIds.length || !effectiveFrom || !effectiveTo) {
      toast.warn("Fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post("/ShiftMapping/assign-multiple", {
        employeeId: Number(employeeId),
        shiftIds,
        effectiveFrom,
        effectiveTo,
      });

      toast.success("Shift(s) assigned");
      setShowModal(false);
      setForm({
        employeeId: "",
        shiftIds: [],
        effectiveFrom: "",
        effectiveTo: "",
      });
      fetchAll();
    } catch {
      toast.error("Failed to assign shifts");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = grouped.filter((g) =>
    g.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Shift Mapping</h2>

        <div className="flex gap-2 items-center">
          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm h-9"
          />

          <button
            onClick={fetchAll}
            className="h-9 px-4 flex items-center gap-2 text-sm cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="h-9 px-4 flex items-center gap-2 text-sm bg-primary hover:bg-secondary cursor-pointer text-white rounded-lg"
          >
            <FiPlus size={16} />
            Assign Shift
          </button>
        </div>
      </div>

      {/* GROUPED LIST */}
      <div className="p-4 space-y-4">
        {loading && (
          <p className="text-center text-gray-500 py-10">Loading...</p>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FiInbox size={42} className="mb-3 text-gray-400" />

            <p className="text-sm font-semibold">No shift mappings found</p>

            <p className="text-xs text-gray-400 mt-1 text-center max-w-sm">
              Assign shifts to employees to manage their working schedules.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-secondary transition cursor-pointer"
            >
              Assign First Shift
            </button>
          </div>
        )}

        {!loading &&
          filtered.map((group) => (
            <div
              key={group.employeeId}
              className="bg-white rounded-xl shadow-sm"
            >
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpandedId(
                    expandedId === group.employeeId ? null : group.employeeId
                  )
                }
              >
                <h3 className="font-medium">{group.employeeName}</h3>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-600">
                    Total Shifts: {group.total}
                  </span>
                  {expandedId === group.employeeId ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all ${
                  expandedId === group.employeeId ? "max-h-[400px]" : "max-h-0"
                }`}
              >
                <div className="p-4 border-t bg-gray-50">
                  <table className="min-w-full text-xs text-center">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2">Shift</th>
                        <th className="px-3 py-2">From</th>
                        <th className="px-3 py-2">To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((r) => (
                        <tr key={r.employeeShiftMappingId}>
                          <td className="px-3 py-2 font-medium">
                            {r.shiftName}
                          </td>
                          <td className="px-3 py-2">
                            {new Date(r.effectiveFrom).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {new Date(r.effectiveTo).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-4">Assign Shift(s)</h3>

            <form onSubmit={handleAssign} className="space-y-3">
              <Select
                options={employees.map((e) => ({
                  value: e.id,
                  label: `${e.fullName} (${e.employeeCode})`,
                }))}
                onChange={(o) =>
                  setForm((p) => ({ ...p, employeeId: o?.value }))
                }
                placeholder="Select Employee"
              />

              <Select
                isMulti
                options={shifts.map((s) => ({
                  value: s.id,
                  label: s.shiftName,
                }))}
                onChange={(opts) =>
                  setForm((p) => ({
                    ...p,
                    shiftIds: opts.map((o) => o.value),
                  }))
                }
                placeholder="Select Shift(s)"
              />

              <input
                type="date"
                className="border p-2 w-full rounded-lg"
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    effectiveFrom: e.target.value,
                  }))
                }
              />

              <input
                type="date"
                className="border p-2 w-full rounded-lg"
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    effectiveTo: e.target.value,
                  }))
                }
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-5 text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-6 text-sm bg-primary hover:bg-secondary cursor-pointer text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Spinner /> : "Assign Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ShiftMapping;
