import React, { useState } from "react";
import assets from "../../../../assets/assets";

const AttendanceTable = ({ records, employeeCache }) => {
  const [openDate, setOpenDate] = useState(null);

  const groupByDate = (list) => {
    return list.reduce((acc, rec) => {
      const date = rec.attendanceDate.split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(rec);
      return acc;
    }, {});
  };
  const getEmployeeLabel = (id) => {
    const emp = employeeCache[id];
    if (!emp) return "Loading...";
    return `${emp.name} (${emp.code})`;
  };

  // Round total hours to nearest whole number
  const formatTotalHours = (hours) => {
    if (hours === null || hours === undefined) return "-";
    return `${Math.round(hours)}h`;
  };

  // Convert minutes → hours & minutes (e.g. 135 → 2h 15m)
  const formatMinutesToHours = (minutes) => {
    if (!minutes || minutes <= 0) return "0h";

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");
  const formatTime = (t) =>
    t
      ? new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const groups = groupByDate(records);

  const sortByEmployeeCode = (items) => {
    return [...items].sort((a, b) => {
      const empA = employeeCache[a.employeeId]?.code || "";
      const empB = employeeCache[b.employeeId]?.code || "";
      return empA.localeCompare(empB);
    });
  };

  return (
    <div className="mt-6 mx-4 bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-gray-700">
          <thead className="bg-gray-100 sticky top-0 text-gray-700 text-[11px] uppercase tracking-wide">
            <tr>
              <th className="py-2 px-4">S.No</th>
              <th className="py-2 px-4">Employee</th>
              <th className="py-2 px-4 whitespace-nowrap">Date</th>
              <th className="py-2 px-4">In</th>
              <th className="py-2 px-4">Out</th>
              <th className="py-2 px-4">Total Hrs.</th>
              <th className="py-2 px-4">OT</th>
              <th className="py-2 px-4">Late</th>
              <th className="py-2 px-4 whitespace-nowrap">Early</th>
              <th className="py-2 px-4">Remarks</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-gray-500 text-center">
                  <div className="flex items-center justify-center py-12 px-4">
                    <div className="flex flex-col items-center text-center bg-white border border-dashed border-gray-300 rounded-xl p-8 max-w-md shadow-sm">
                      <img
                        src={assets.NoData}
                        alt="No Attendance Data"
                        className="w-56 mb-4 opacity-80"
                      />

                      <h3 className="text-xl font-semibold text-gray-800">
                        No Attendance Record Found for the selected criteria
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        We couldn’t find any attendance records for the selected
                        criteria. Try adjusting the date range, employee, or
                        filters.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              Object.entries(groups).map(([date, items]) => (
                <React.Fragment key={date}>
                  {/* Group Row */}
                  <tr
                    className="cursor-pointer border-y border-gray-200 transition"
                    onClick={() => setOpenDate(openDate === date ? null : date)}
                  >
                    <td
                      colSpan="10"
                      className="p-3 font-semibold text-indigo-700 flex items-center gap-2 w-8"
                    >
                      <span className="text-sm">
                        {openDate === date ? "▼" : "▶"}
                      </span>
                      <span>{formatDate(date)}</span>
                      <span className="text-xs text-indigo-500 ml-auto">
                        {items.length}(Records)
                      </span>
                    </td>
                  </tr>

                  {/* Child Rows */}
                  {openDate === date &&
                    sortByEmployeeCode(items).map((rec, i) => (
                      <tr
                        key={rec.attendanceRecordId}
                        className="hover:bg-gray-50 text-center transition border-b border-gray-200"
                      >
                        <td className="py-2 px-4">{i + 1}.</td>
                        <td className="py-2 px-4 font-medium text-gray-800">
                          {getEmployeeLabel(rec.employeeId)}
                        </td>
                        <td className="py-2 px-4">
                          {formatDate(rec.attendanceDate)}
                        </td>
                        <td className="py-2 px-4">{formatTime(rec.inTime)}</td>
                        <td className="py-2 px-4">{formatTime(rec.outTime)}</td>
                        <td className="py-2 px-4">
                          {formatTotalHours(rec.totalHoursWorked)}
                        </td>
                        <td className="py-2 px-4">
                          {formatMinutesToHours(
                            rec.shiftSegments?.[0]?.otMinutes,
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {formatMinutesToHours(
                            rec.shiftSegments?.[0]?.lateMinutes,
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {formatMinutesToHours(
                            rec.shiftSegments?.[0]?.earlyLeaveMinutes,
                          )}
                        </td>
                        <td className="py-2 px-4">{rec.remarks || "-"}</td>
                      </tr>
                    ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
