import React, { useEffect, useMemo, useState, useRef } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { format } from "date-fns";
import Pagination from "../../../components/Pagination";
import { MapPin, Clock, LogIn, LogOut } from "lucide-react";

const statusColors = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-yellow-100 text-yellow-800",
  Absent: "bg-red-100 text-red-700",
};

const sourceColors = {
  MobileApp: "bg-blue-100 text-blue-700",
  ESSL: "bg-purple-100 text-purple-700",
  EXCEL: "bg-emerald-100 text-emerald-700", // New
  ADMIN_PANEL: "bg-orange-100 text-orange-700",
};

const sourceLabels = {
  ESSL: "Device",
  ADMIN_PANEL: "Admin Panel",
  EXCEL: "Excel",
  MobileApp: "Mobile App",
};

const FILTER_MAP = {
  Today: "today",
  Week: "week",
  Month: "month",
};

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("Today");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeCache, setEmployeeCache] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(5);
  const tooltipTimeout = useRef(null);

  /* ================= FETCH EMPLOYEE ================= */
  useEffect(() => {
    const fetchEmployees = async () => {
      const ids = [...new Set(attendanceData.map((a) => a.employeeId))].filter(
        (id) => !employeeCache[id],
      );

      if (ids.length === 0) return;

      const updates = {};

      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await axiosInstance.get(`/Employee/${id}`);
            updates[id] = res.data?.data;
          } catch {
            updates[id] = null;
          }
        }),
      );

      setEmployeeCache((prev) => ({ ...prev, ...updates }));
    };

    fetchEmployees();
  }, [attendanceData]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          "/Attendance/attendancewithlocation",
          { params: { filter: FILTER_MAP[activeTab] } },
        );

        const rawData = res.data;

        // Extract array safely (VERY IMPORTANT)
        const data = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

        // Safety check (prevents crash completely)
        if (!Array.isArray(data)) {
          console.error("Invalid attendance response:", rawData);
          setAttendanceData([]);
          return;
        }

        // Now sorting is safe
        data.sort(
          (a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate),
        );

        const merged = Object.values(
          data.reduce((acc, curr) => {
            const dateKey = format(new Date(curr.attendanceDate), "yyyy-MM-dd");
            const key = `${curr.employeeId}-${dateKey}`;

            if (!acc[key]) {
              acc[key] = {
                ...curr,
                inTime: null,
                outTime: null,
                inLocation: null,
                outLocation: null,
              };
            }

            // 🟢 IN punch
            if (curr.inTime) {
              if (
                !acc[key].inTime ||
                new Date(curr.inTime) < new Date(acc[key].inTime)
              ) {
                acc[key].inTime = curr.inTime;
              }

              if (curr.locationId) {
                acc[key].inLocation = {
                  address: curr.address,
                  city: curr.city,
                  state: curr.state,
                  country: curr.country,
                  latitude: curr.latitude,
                  longitude: curr.longitude,
                };
              }
            }

            // 🔴 OUT punch
            if (curr.outTime) {
              if (
                !acc[key].outTime ||
                new Date(curr.outTime) > new Date(acc[key].outTime)
              ) {
                acc[key].outTime = curr.outTime;
              }

              if (curr.locationId) {
                acc[key].outLocation = {
                  address: curr.address,
                  city: curr.city,
                  state: curr.state,
                  country: curr.country,
                  latitude: curr.latitude,
                  longitude: curr.longitude,
                };
              }
            }

            return acc;
          }, {}),
        );

        setAttendanceData(merged);
        setCurrentPage(1);
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [activeTab]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(attendanceData.length / perPageData);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPageData;
    return attendanceData.slice(start, start + perPageData);
  }, [attendanceData, currentPage, perPageData]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Attendance Overview
          </h2>
          <p className="text-xs text-gray-500">
            {attendanceData.length} total records
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {["Today", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                activeTab === tab
                  ? "bg-white text-primary shadow"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto overflow-visible rounded-xl border border-gray-200">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-gray-600 uppercase text-xs text-center">
              <th className="px-4 py-3">S.No</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">In_Time</th>
              <th className="px-4 py-3">Out_Time</th>
              <th className="px-4 py-3">Source</th>
              {/* <th className="px-4 py-3">Location</th> */}
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-500">
                  Loading attendance data...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-400">
                  No attendance records found
                </td>
              </tr>
            ) : (
              paginatedData.map((att, index) => (
                <tr
                  key={att.attendanceId}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-center"
                >
                  {/* S.No */}
                  <td className="px-4 py-3">
                    {(currentPage - 1) * perPageData + index + 1}.
                  </td>
                  {/* Employee */}
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {employeeCache[att.employeeId]
                      ? `${employeeCache[att.employeeId].fullName}(${employeeCache[att.employeeId].employeeCode})`
                      : `#${att.employeeId}`}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    {format(new Date(att.attendanceDate), "dd MMM yyyy")}
                  </td>

                  {/* In Time */}
                  <td className="px-4 py-3 text-center">
                    {att.inTime ? (
                      <span
                        className={`flex items-center justify-center gap-2 font-medium ${
                          att.inLocation
                            ? "cursor-pointer text-green-600"
                            : "text-green-400"
                        }`}
                        onMouseEnter={(e) => {
                          if (!att.inLocation) return;

                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            x: rect.right - 260,
                            y: rect.top - 10,
                            data: att.inLocation,
                            label: "IN Location",
                          });
                        }}
                        onMouseLeave={() => {
                          tooltipTimeout.current = setTimeout(() => {
                            setTooltip(null);
                          }, 150);
                        }}
                      >
                        <LogIn size={14} />
                        {format(new Date(att.inTime), "hh:mm a")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Out Time */}
                  <td className="px-4 py-3 text-center">
                    {att.outTime ? (
                      <span
                        className={`flex items-center justify-center gap-2 font-medium ${
                          att.outLocation
                            ? "cursor-pointer text-red-600"
                            : "text-red-400"
                        }`}
                        onMouseEnter={(e) => {
                          if (!att.outLocation) return;

                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            x: rect.right - 260,
                            y: rect.top - 10,
                            data: att.outLocation,
                            label: "OUT Location",
                          });
                        }}
                        onMouseLeave={() => {
                          tooltipTimeout.current = setTimeout(() => {
                            setTooltip(null);
                          }, 150);
                        }}
                      >
                        <LogOut size={14} />
                        {format(new Date(att.outTime), "hh:mm a")}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not Marked</span>
                    )}
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sourceColors[att.source] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {sourceLabels[att.source] || att.source}
                    </span>
                  </td>

                  {/* Location with Advanced Tooltip */}
                  {/* <td className="px-4 py-3">
                    {att.city || att.address ? (
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onMouseEnter={(e) => {
                          if (tooltipTimeout.current) {
                            clearTimeout(tooltipTimeout.current);
                          }

                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            x: rect.right - 260,
                            y: rect.top - 10,
                            data: att,
                          });
                        }}
                        onMouseLeave={() => {
                          tooltipTimeout.current = setTimeout(() => {
                            setTooltip(null);
                          }, 150);
                        }}
                      >
                        <MapPin size={14} className="text-primary" />
                        <span className="text-gray-700 text-xs truncate max-w-[80px]">
                          {att.city || "Location"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No Location</span>
                    )}
                  </td> */}

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[att.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* GLOBAL LOCATION TOOLTIP */}
        {tooltip && (
          <div
            className="fixed z-[99999] w-64 bg-white border border-gray-200 rounded-lg shadow-2xl p-3 text-xs text-gray-700"
            style={{ top: tooltip.y, left: tooltip.x }}
            onMouseEnter={() => {
              if (tooltipTimeout.current) {
                clearTimeout(tooltipTimeout.current);
              }
            }}
            onMouseLeave={() => {
              tooltipTimeout.current = setTimeout(() => {
                setTooltip(null);
              }, 150);
            }}
          >
            <div className="font-semibold text-gray-800 mb-2">
              Location Details
            </div>

            <div className="space-y-1">
              <div>
                <strong>Address:</strong> {tooltip.data.address || "N/A"}
              </div>
              <div>
                <strong>City:</strong> {tooltip.data.city || "N/A"}
              </div>
              <div>
                <strong>State:</strong> {tooltip.data.state || "N/A"}
              </div>
              <div>
                <strong>Country:</strong> {tooltip.data.country || "N/A"}
              </div>
            </div>

            {tooltip.data.latitude && tooltip.data.longitude && (
              <a
                href={`https://www.google.com/maps?q=${tooltip.data.latitude},${tooltip.data.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="block mt-2 text-blue-600 hover:underline font-medium"
              >
                View on Maps
              </a>
            )}
          </div>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={setCurrentPage}
        perPageData={perPageData}
        setPerPageData={setPerPageData}
        filteredData={attendanceData}
        totalDataLength={attendanceData.length}
      />
    </div>
  );
};

export default AdminAttendance;
