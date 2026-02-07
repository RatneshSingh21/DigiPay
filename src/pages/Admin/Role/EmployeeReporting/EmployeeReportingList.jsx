import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FiEdit2, FiInbox } from "react-icons/fi";
import EmployeeReportingModal from "./EmployeeReportingModal";

/* Shared UI styles */
const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const EmployeeReportingList = () => {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Pagination */
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  /* Filters */
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* Modal */
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchHierarchy();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [list, search, fromDate, toDate]);

  /* Fetch */
  const fetchHierarchy = async () => {
    try {
      const res = await axiosInstance.get("/hierarchy/employee-reporting");
      if (res.data.success) {
        setList(res.data.data);
      }
      setLoading(false);
    } catch {
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  /* Filter */
  const applyFilter = () => {
    let data = [...list];

    if (search) {
      data = data.filter((x) =>
        x.employeeName.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (fromDate) {
      data = data.filter(
        (x) => new Date(x.effectiveFrom) >= new Date(fromDate),
      );
    }

    if (toDate) {
      data = data.filter((x) => new Date(x.effectiveTo) <= new Date(toDate));
    }

    setFiltered(data);
    setPage(1);
  };

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedData = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleEdit = (row) => {
    setEditData(row);
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-xl">Employee Reporting</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage reporting hierarchy and department mapping
          </p>
        </div>

        <button
          className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          + Add Reporting
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Search Employee
            </label>
            <input
              type="text"
              placeholder="Type employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} ${search ? "ring-2 ring-blue-200" : ""}`}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Rows Per Page
            </label>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className={inputClass}
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table / Empty State */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          /* EMPTY STATE */
          <div className="border border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center text-center">
            <FiInbox size={42} className="text-gray-400 mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">
              No reporting records found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Try adjusting your filters or add a new employee reporting
              hierarchy.
            </p>

            <button
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}
              className="mt-4 px-4 py-2 text-sm bg-primary cursor-pointer text-white rounded-md hover:bg-secondary"
            >
              + Add Reporting
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr className="text-center">
                  <th className="p-3">S.No</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Manager</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">From</th>
                  <th className="p-3">To</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-200 hover:bg-blue-50 transition text-center"
                  >
                    <td className="p-2 text-gray-600">
                      {(page - 1) * rowsPerPage + i + 1}.
                    </td>

                    <td className="p-2 font-medium text-gray-800">
                      {row.employeeName}
                    </td>

                    <td className="p-2">{row.reportsToEmployeeName}</td>

                    <td className="p-2">{row.departmentName}</td>

                    <td className="p-2 text-gray-600">
                      {new Date(row.effectiveFrom).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-2 text-gray-600">
                      {new Date(row.effectiveTo).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(row)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 cursor-pointer rounded-md text-xs flex items-center gap-1 mx-auto hover:bg-blue-200"
                      >
                        <FiEdit2 size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <span>
              Page <strong>{page}</strong> of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50"
              >
                Prev
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <EmployeeReportingModal
        key={editData?.id || "new"}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchHierarchy}
        editData={editData}
      />
    </div>
  );
};

export default EmployeeReportingList;
