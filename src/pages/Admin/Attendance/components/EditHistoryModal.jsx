import { X, Search } from "lucide-react";
import { useMemo, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const EditHistoryModal = ({
  isOpen,
  onClose,
  historyData,
  users,
  companyEmployees,
  loading,
  page,
  pageSize,
  setPage,
  setPageSize,
}) => {
  if (!isOpen) return null;
  const [search, setSearch] = useState("");

  const getEmployee = (id) => companyEmployees.find((e) => e.id === id);

  const getUser = (id) => users.find((u) => u.userId === id);

  /* 🔍 Filtered data */
  const filteredHistory = useMemo(() => {
    if (!search.trim()) return historyData;

    const q = search.toLowerCase();

    return historyData.filter((h) => {
      const employee = getEmployee(h.employeeId);
      const editor = getUser(h.editedByUserId);

      return (
        employee?.fullName?.toLowerCase().includes(q) ||
        employee?.employeeCode?.toLowerCase().includes(q) ||
        editor?.name?.toLowerCase().includes(q) ||
        h.editReason?.toLowerCase().includes(q) ||
        h.source?.toLowerCase().includes(q)
      );
    });
  }, [search, historyData]);

  const paginated = filteredHistory.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const totalPages = Math.ceil(filteredHistory.length / pageSize);

  /* ✨ Highlight helper */
  const highlightText = (text) => {
    if (!search || !text) return text;

    const regex = new RegExp(`(${search})`, "ig");

    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} className="rounded bg-yellow-200 px-1 text-gray-900">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm text-sm">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Attendance Edit History
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-red-100 cursor-pointer hover:text-red-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search employee, editor, reason, source…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading history…
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No matching history found
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map((h) => {
                const employee = getEmployee(h.employeeId);
                const editor = getUser(h.editedByUserId);

                return (
                  <div
                    key={h.editId}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                  >
                    {/* Top Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {highlightText(
                            employee?.fullName || "Unknown Employee",
                          )}
                          {employee?.employeeCode && (
                            <span className="ml-1 font-normal text-gray-400">
                              ({highlightText(employee.employeeCode)})
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          Attendance Date:{" "}
                          {new Date(
                            h.editedInTime ||
                              h.editedOutTime ||
                              h.originalInTime ||
                              h.originalOutTime,
                          ).toLocaleDateString("en-Gb")}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {highlightText(editor?.name || "System")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {h.editedByRole}
                        </div>
                      </div>
                    </div>

                    {/* Changes */}
                    <div className="mt-4 flex flex-wrap gap-5 text-sm">
                      {h.originalInTime !== h.editedInTime && (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                            IN
                          </span>
                          <span className="text-red-600">
                            {h.originalInTime
                              ? new Date(h.originalInTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "-"}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold text-green-600">
                            {h.editedInTime
                              ? new Date(h.editedInTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "-"}
                          </span>
                        </div>
                      )}

                      {h.originalOutTime !== h.editedOutTime && (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-700">
                            OUT
                          </span>
                          <span className="text-red-600">
                            {h.originalOutTime
                              ? new Date(h.originalOutTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "-"}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold text-green-600">
                            {h.editedOutTime
                              ? new Date(h.editedOutTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "-"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Reason */}
                    <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                      <span className="font-medium text-gray-600">Reason:</span>{" "}
                      <span className="text-gray-700">
                        {highlightText(h.editReason || "-")}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-700">
                        {highlightText(h.source)}
                      </span>
                      <span>
                        Edited on{" "}
                        {new Date(h.editedAt).toLocaleDateString("en-Gb")}{" "}
                        {new Date(h.editedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-gray-600">entries</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-md border px-3 py-1 cursor-pointer hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-gray-600">
              Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-md border px-3 py-1 cursor-pointer hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHistoryModal;
