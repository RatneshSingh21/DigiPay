import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Pagination from "../../../components/Pagination";

const inputClass =
  "w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const ShiftDashboard = () => {
  const [todayData, setTodayData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [shiftSummary, setShiftSummary] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(3);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get("/shift-pattern/dashboard");
        setTodayData(res.data?.today || []);
        setWeeklyData(res.data?.weekly || []);
        setShiftSummary(res.data?.shiftSummary || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* Reset page when tab or search changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  /* ================= SEARCH ================= */

  const filteredToday = useMemo(() => {
    return todayData.filter((emp) => {
      const value = search.toLowerCase();
      return (
        emp.fullName?.toLowerCase().includes(value) ||
        emp.employeeCode?.toLowerCase().includes(value)
      );
    });
  }, [search, todayData]);

  const filteredWeekly = useMemo(() => {
    return weeklyData.filter((emp) => {
      const value = search.toLowerCase();
      return (
        emp.fullName?.toLowerCase().includes(value) ||
        emp.employeeCode?.toLowerCase().includes(value)
      );
    });
  }, [search, weeklyData]);

  /* ================= PAGINATION LOGIC ================= */

  const activeData = activeTab === "today" ? filteredToday : filteredWeekly;

  const totalPages = Math.ceil(activeData.length / perPageData);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPageData;
    return activeData.slice(start, start + perPageData);
  }, [activeData, currentPage, perPageData]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Shift Dashboard...</div>;
  }

  return (
    <div className="p-4 bg-white space-y-4 rounded-2xl">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Shift Timings & Assignments
          </h2>
          <p className="text-xs text-gray-500 font-bold">
            {activeData.length} total records
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {["today", "weekly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-medium cursor-pointer rounded-lg transition ${
                activeTab === tab
                  ? "bg-white text-primary shadow"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tab === "today" ? "Today" : "Weekly"}
            </button>
          ))}
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div>
        <input
          type="text"
          placeholder="Search by employee name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* ================= TODAY ================= */}
      {activeTab === "today" && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {shiftSummary.map((shift, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow transition"
              >
                <p className="text-xs text-gray-500">{shift.shiftName}</p>
                <h2 className="text-xl font-semibold text-primary mt-1">
                  {shift.employeeCount}
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Employees Today
                </p>
              </div>
            ))}
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs text-center">
              <thead className="bg-gray-50">
                <tr className="text-gray-600 uppercase text-xs">
                  <th className="px-3 py-2">S.No</th>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Shift</th>
                  <th className="px-3 py-2">Timing</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((emp, index) => (
                  <tr
                    key={emp.employeeCode}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-3 py-2">
                      {(currentPage - 1) * perPageData + index + 1}.
                    </td>

                    <td className="px-3 py-2">
                      {emp.fullName}({emp.employeeCode})
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded-full bg-primary text-white text-xs">
                        {emp.shiftName}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {emp.startTime} - {emp.endTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedData.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No employees found.
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= WEEKLY ================= */}
      {activeTab === "weekly" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Weekly Shift Assignments
          </h3>

          <div className="space-y-6">
            {paginatedData.map((emp) => (
              <div key={emp.employeeCode}>
                <p className="font-medium text-gray-700 mb-1 text-sm">
                  {emp.fullName} ({emp.employeeCode})
                </p>

                <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                  {emp.days?.map((day, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-lg p-3 text-xs text-center hover:bg-gray-200 transition"
                    >
                      <p className="text-gray-600">
                        {new Date(day.date).toLocaleDateString("en-Gb")}
                      </p>
                      <p className="text-primary font-semibold mt-1">
                        {day.shiftName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {paginatedData.length === 0 && (
              <div className="text-center text-gray-500">
                No employees found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={setCurrentPage}
        perPageData={perPageData}
        setPerPageData={setPerPageData}
        filteredData={activeData}
        totalDataLength={activeData.length}
      />
    </div>
  );
};

export default ShiftDashboard;
