import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FiEdit2, FiInbox } from "react-icons/fi";
import DepartmentAuthorityModal from "./DepartmentAuthorityModal";

/* Shared UI styles */
const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const DepartmentAuthorityList = () => {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Pagination */
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  /* Filter */
  const [search, setSearch] = useState("");

  /* Modal */
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [list, search]);

  /* Fetch */
  const fetchList = async () => {
    try {
      const res = await axiosInstance.get("/hierarchy/department-authority");

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

    setFiltered(data);
    setPage(1);
  };

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / rows);
  const data = filtered.slice((page - 1) * rows, page * rows);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-xl">Department Authority</h2>
          <p className="text-xs text-gray-500 mt-1">
            Define department-wise authority and roles
          </p>
        </div>

        <button
          className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          + Add Authority
        </button>
      </div>

      <div className="p-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
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
              Rows Per Page
            </label>
            <select
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className={inputClass}
            >
              <option value={5}>5</option>
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
              No department authority records found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Add authority mapping to define roles and responsibilities.
            </p>

            <button
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}
              className="mt-4 px-4 py-2 text-sm bg-primary text-white rounded-md hover:opacity-90 cursor-pointer"
            >
              + Add Authority
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr className="text-center">
                  <th className="p-3">S.No</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Primary</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-200 hover:bg-blue-50 transition text-center"
                  >
                    <td className="p-2 text-gray-600">
                      {(page - 1) * rows + i + 1}.
                    </td>

                    <td className="p-2 font-medium text-gray-800">
                      {row.departmentName}
                    </td>

                    <td className="p-2">{row.employeeName}</td>

                    <td className="p-2">{row.roleName}</td>

                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          row.isPrimary
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.isPrimary ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="p-2">
                      <button
                        onClick={() => {
                          setEditData(row);
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-xs flex items-center gap-1 mx-auto hover:bg-blue-200 cursor-pointer"
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
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Prev
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <DepartmentAuthorityModal
        key={editData?.id || "new"}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchList}
        editData={editData}
      />
    </div>
  );
};

export default DepartmentAuthorityList;
