import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Pagination from "../../../../components/Pagination";
import Select from "react-select";
import { format } from "date-fns";
import { UserX, Inbox, Loader2 } from "lucide-react";

const filterOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const AttendanceRejectedPunches = () => {
  const [filter, setFilter] = useState("month");
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(5);

  // 🔹 Fetch Employees
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Fetch Rejected
  const fetchRejected = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/Attendance/rejected?filter=${filter}`,
      );
      setData(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchRejected();
    setCurrentPage(1);
  }, [filter]);

  // 🔹 Employee Map
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] =
        `${emp.fullName || "Unknown"}(${emp.employeeCode || "N/A"})`;
    });
    return map;
  }, [employees]);

  // 🔹 Dropdown
  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      value: emp.id,
      label: `${emp.fullName} (${emp.employeeCode})`,
    }));
  }, [employees]);

  // 🔹 Filtered Data
  const filteredData = useMemo(() => {
    if (!selectedEmployee) return [];

    let filtered = data.filter((d) => d.employeeId === selectedEmployee.value);

    if (filter !== "today") {
      if (fromDate) {
        filtered = filtered.filter(
          (d) => new Date(d.eventDateTime) >= new Date(fromDate),
        );
      }
      if (toDate) {
        filtered = filtered.filter(
          (d) => new Date(d.eventDateTime) <= new Date(toDate),
        );
      }
    }

    return filtered;
  }, [data, selectedEmployee, fromDate, toDate, filter]);

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredData.length / perPageData);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPageData;
    return filteredData.slice(start, start + perPageData);
  }, [filteredData, currentPage, perPageData]);

  const paginate = (page) => setCurrentPage(page);

  // 🔹 Source Chip UI
  const getSourceChip = (source) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1";

    let label = source || "-";

    switch (source?.toLowerCase()) {
      case "essl":
        return {
          className: `${base} bg-indigo-100 text-indigo-700`,
          label: "Device",
        };

      case "mobile":
        return {
          className: `${base} bg-emerald-100 text-emerald-700`,
          label: "Mobile",
        };

      case "web":
        return {
          className: `${base} bg-blue-100 text-blue-700`,
          label: "Web",
        };

      default:
        return {
          className: `${base} bg-gray-100 text-gray-600`,
          label,
        };
    }
  };

  return (
    <div className="bg-white">
      {/* 🔥 HEADER */}
      <div className="border border-gray-200 p-3 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Rejected Punches
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Analyze rejected attendance entries
          </p>
        </div>

        <div className="text-sm text-white bg-primary px-3 py-1 rounded-lg border border-gray-200">
          Total: <span className="font-semibold">{filteredData.length}</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* 🔥 FILTER BAR */}
        <div className="grid md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          {/* Filter */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Filter</label>
            <Select
              options={filterOptions}
              defaultValue={filterOptions[2]}
              onChange={(e) => {
                setFilter(e.value);
                setFromDate("");
                setToDate("");
              }}
            />
          </div>

          {/* Employee */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Employee *
            </label>
            <Select
              placeholder="Select employee..."
              options={employeeOptions}
              value={selectedEmployee}
              onChange={(val) => {
                setSelectedEmployee(val);
                setCurrentPage(1);
              }}
              isClearable
            />
          </div>

          {/* From */}
          {filter !== "today" && (
            <>
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
                <label className="text-xs text-gray-500 mb-1 block">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>

        {/* 🚫 No Employee */}
        {!selectedEmployee && (
          <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 border border-dashed rounded-2xl">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <UserX className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-sm font-semibold text-gray-700">
              No Employee Selected
            </h3>

            <p className="text-xs text-gray-500 mt-1 text-center max-w-xs">
              Please select an employee from the dropdown above to view rejected
              attendance punches.
            </p>
          </div>
        )}

        {/* ⏳ Loading */}
        {selectedEmployee && loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-3" />
            <p className="text-sm text-gray-500">
              Fetching rejected punches...
            </p>
          </div>
        )}
        {/* 📭 No Data */}
        {selectedEmployee && !loading && filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 border border-dashed rounded-2xl">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-sm font-semibold text-gray-700">
              No Rejected Punches Found
            </h3>

            <p className="text-xs text-gray-500 mt-1 text-center max-w-xs">
              There are no rejected entries for the selected filters. Try
              adjusting the date range or filter.
            </p>
          </div>
        )}

        {/* 📊 TABLE */}
        {selectedEmployee && !loading && filteredData.length > 0 && (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600 text-center">
                  <tr>
                    <th className="p-4">S.No</th>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Direction</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr
                      key={item.rejectedId}
                      className="border-t border-gray-200 text-center hover:bg-gray-50 transition"
                    >
                      <td className="p-4">{index + 1}.</td>
                      <td className="p-4 font-medium text-gray-800">
                        {employeeMap[item.employeeId] || "Unknown"}
                      </td>

                      <td className="p-4">
                        {format(new Date(item.eventDateTime), "dd MMM yyyy")}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.rawDirection === "IN"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.rawDirection}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {(() => {
                          const chip = getSourceChip(item.source);
                          return (
                            <span className={chip.className}>{chip.label}</span>
                          );
                        })()}
                      </td>

                      <td className="p-4 text-red-500 text-xs">
                        {item.rejectionReason || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              perPageData={perPageData}
              setPerPageData={setPerPageData}
              filteredData={filteredData}
              totalDataLength={filteredData.length}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceRejectedPunches;
