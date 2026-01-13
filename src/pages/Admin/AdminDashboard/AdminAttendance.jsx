import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { format, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import Pagination from "../../../components/Pagination";

const statusColors = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-yellow-100 text-yellow-800",
  Absent: "bg-red-100 text-red-700",
  active: "bg-blue-100 text-blue-700",
};

// 🔥 Cache must be outside component to survive re-renders
const locationCache = {};

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("Today");
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(true);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(3);
  const [pageGroup, setPageGroup] = useState(0);

  // Convert latitude & longitude to a readable location name
  const getLocationName = async (lat, lon) => {
    try {
      if (!lat || !lon) return "-";

      const key = `${lat}-${lon}`;

      // ✔ Use cache (avoids multiple API calls)
      if (locationCache[key]) return locationCache[key];

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": "MyAttendanceApp/1.0",
            "Accept-Language": "en",
          },
        }
      );

      const data = await res.json();
      const formatted = data?.display_name || "-";

      // ✔ Store in cache
      locationCache[key] = formatted;

      return formatted;
    } catch (err) {
      console.error("Location API error:", err);
      return "-";
    }
  };

  // const formatGoogleStyleAddress = (data) => {
  //   if (!data || !data.address) return data.display_name || "-";

  //   const a = data.address;

  //   const sector = a.suburb || a.neighbourhood || a.residential;
  //   const block = a.hamlet || a.quarter;
  //   const city = a.city || a.town || a.village;
  //   const district = a.county || a.state_district;
  //   const state = a.state;
  //   const country = a.country;

  //   return [sector, block, city, district, state, country]
  //     .filter(Boolean)
  //     .join(", ");
  // };

  //   const getLocationName = async (lat, lon) => {
  //     try {
  //       if (!lat || !lon) return "-";

  //       const key = `${lat}-${lon}`;

  //       // ✔ Use cache (unlimited and persistent)
  //       if (locationCache[key]) return locationCache[key];

  //       const res = await fetch(
  //         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
  //         {
  //           headers: {
  //             "User-Agent": "YourAppName/1.0 (your-email@example.com)",
  //             "Accept-Language": "en",
  //           },
  //         }
  //       );

  //       if (!res.ok) {
  //         console.warn("⚠ Error from Nominatim:", res.status);
  //         return "-";
  //       }

  //       const data = await res.json();
  //       const formatted = formatGoogleStyleAddress(data);

  //       locationCache[key] = formatted || "-";
  //       return formatted || "-";
  //     } catch (err) {
  //       console.error("Location API error:", err);
  //       return "-";
  //     }
  //   };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        /* ===========================
         1️⃣ FETCH ATTENDANCE DATA
      ============================ */
        const [recordsRes, basicRes] = await Promise.allSettled([
          axiosInstance.get("/AttendanceRecord/getAttendancerecord/all"),
          axiosInstance.get("/Attendance/all"),
        ]);

        const records =
          recordsRes.status === "fulfilled"
            ? recordsRes.value.data?.data || []
            : [];

        const basic =
          basicRes.status === "fulfilled" ? basicRes.value.data || [] : [];

        /* ===========================
         2️⃣ GROUP RAW PUNCHES
      ============================ */
        const groupedBasic = {};

        basic.forEach((b) => {
          const dateKey = new Date(b.attendanceDate).toDateString();
          const key = `${b.employeeId}-${dateKey}`;

          if (!groupedBasic[key]) {
            groupedBasic[key] = {
              attendanceId: b.attendanceId,
              employeeId: b.employeeId,
              attendanceDate: b.attendanceDate,
              inTime: null,
              outTime: null,
              latitude: b.latitude,
              longitude: b.longitude,
            };
          }

          if (b.punchType === "IN") {
            if (
              !groupedBasic[key].inTime ||
              new Date(b.inTime) < new Date(groupedBasic[key].inTime)
            ) {
              groupedBasic[key].inTime = b.inTime || b.attendanceDate;
            }
          }

          if (b.punchType === "OUT") {
            if (
              !groupedBasic[key].outTime ||
              new Date(b.outTime) > new Date(groupedBasic[key].outTime)
            ) {
              groupedBasic[key].outTime = b.outTime || b.attendanceDate;
            }
          }
        });

        /* ===========================
         3️⃣ MERGE PROCESSED + RAW
      ============================ */
        const mergedData = Object.values(groupedBasic).map((punch) => {
          const punchDate = new Date(
            punch.inTime || punch.outTime || punch.attendanceDate
          ).toDateString();

          const processed = records.find(
            (rec) =>
              rec.employeeId === punch.employeeId &&
              new Date(rec.attendanceDate).toDateString() === punchDate
          );

          return processed
            ? {
                attendanceId: processed.attendanceRecordId,
                employeeId: processed.employeeId,
                attendanceDate: processed.attendanceDate,
                inTime: processed.inTime,
                outTime: processed.outTime,
                totalHours: processed.totalHoursWorked,
                status: processed.isAbsent ? "Absent" : "Present",
                latitude: punch.latitude,
                longitude: punch.longitude,
              }
            : {
                attendanceId: punch.attendanceId,
                employeeId: punch.employeeId,
                attendanceDate: punch.attendanceDate,
                inTime: punch.inTime,
                outTime: punch.outTime,
                totalHours:
                  punch.inTime && punch.outTime
                    ? (new Date(punch.outTime) - new Date(punch.inTime)) /
                      3600000
                    : null,
                status: punch.inTime || punch.outTime ? "Present" : "Absent",
                latitude: punch.latitude,
                longitude: punch.longitude,
              };
        });

        /* ===========================
         4️⃣ RESOLVE LOCATIONS (SAFE)
      ============================ */
        const locationResults = await Promise.allSettled(
          mergedData.map((item) =>
            item.latitude && item.longitude
              ? getLocationName(item.latitude, item.longitude)
              : Promise.resolve("-")
          )
        );

        const updatedData = mergedData.map((item, i) => ({
          ...item,
          location:
            locationResults[i].status === "fulfilled"
              ? locationResults[i].value
              : "-",
        }));

        setAttendanceData(updatedData);

        /* ===========================
         5️⃣ FETCH EMPLOYEES (SAFE)
      ============================ */
        const employeeIds = [...new Set(updatedData.map((a) => a.employeeId))];

        const employeeResults = await Promise.allSettled(
          employeeIds.map((id) => axiosInstance.get(`/Employee/${id}`))
        );

        const empMap = {};
        employeeResults.forEach((res) => {
          if (res.status === "fulfilled") {
            const emp = res.value.data?.data;
            if (emp) empMap[emp.id] = emp.fullName;
          }
        });

        setEmployeeMap(empMap);
      } catch (err) {
        console.error("Attendance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);
  

  const formatTime = (time) => {
    if (!time) return "-";
    return format(new Date(time), "hh:mma");
  };

  // 🔹 Filter attendance by active tab
  const filterByTab = (data) => {
    const today = new Date();

    return data.filter((att) => {
      const date = new Date(att.attendanceDate);

      if (activeTab === "Today") {
        return isSameDay(date, today);
      }
      if (activeTab === "Week") {
        return isSameWeek(date, today, { weekStartsOn: 1 });
      }
      if (activeTab === "Month") {
        return isSameMonth(date, today);
      }

      return true;
    });
  };

  const filteredData = filterByTab(attendanceData);

  // 🔹 Pagination
  const totalDataLength = filteredData.length;
  const totalPages = Math.ceil(totalDataLength / perPageData);
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
          <p className="text-sm text-gray-500">
            Showing {totalDataLength} records
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg">
          {["Today", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1.5 cursor-pointer text-sm rounded-md transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1); // reset pagination
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-500 py-4">Loading...</p>
        ) : (
          <>
            <table className="w-full text-sm border-collapse text-center">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-3 font-medium">E.Name</th>
                  <th className="font-medium">Date</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium">In Time</th>
                  <th className="font-medium">Out Time</th>
                  <th className="font-medium">T. Hours</th>
                  <th className="font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((att) => (
                    <tr
                      key={`${att.employeeId}-${att.attendanceDate}`}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 text-gray-800">
                        {employeeMap[att.employeeId] || `ID: ${att.employeeId}`}
                      </td>
                      <td className="py-3 text-gray-800">
                        {new Date(att.attendanceDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[att.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="text-gray-700">
                        {formatTime(att.inTime)}
                      </td>
                      <td className="text-gray-700">
                        {formatTime(att.outTime)}
                      </td>
                      <td className="text-gray-700">
                        {att.totalHours !== null
                          ? att.totalHours.toFixed(2)
                          : "-"}
                      </td>
                      <td
                        className="text-gray-600 text-xs max-w-[100px] truncate cursor-help"
                        title={att.location}
                      >
                        {att.location || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              pageGroup={pageGroup}
              setPageGroup={setPageGroup}
              perPageData={perPageData}
              setPerPageData={setPerPageData}
              filteredData={filteredData}
              totalDataLength={totalDataLength}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
