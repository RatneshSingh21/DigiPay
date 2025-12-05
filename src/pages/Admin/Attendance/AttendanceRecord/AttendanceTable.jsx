import React, { useState } from "react";

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

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");
  const formatTime = (t) =>
    t
      ? new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const groups = groupByDate(records);

  return (
    <div className="mt-6 mx-4 bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-gray-700">
          <thead className="bg-gray-200 sticky top-0 shadow text-gray-700">
            <tr>
              <th className="py-2 px-4">S.No</th>
              <th className="py-2 px-4">Employee</th>
              <th className="py-2 px-4 whitespace-nowrap">Date</th>
              <th className="py-2 px-4">In</th>
              <th className="py-2 px-4">Out</th>
              <th className="py-2 px-4">OT (min)</th>
              <th className="py-2 px-4 whitespace-nowrap">Early (min)</th>
              <th className="py-2 px-4">Remarks</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-gray-500 text-center">
                  No Records Found
                </td>
              </tr>
            ) : (
              Object.entries(groups).map(([date, items]) => (
                <React.Fragment key={date}>
                  {/* Group Row */}
                  <tr
                    className="bg-blue-50 cursor-pointer border-y hover:bg-blue-100 transition"
                    onClick={() => setOpenDate(openDate === date ? null : date)}
                  >
                    <td
                      colSpan="8"
                      className="p-3 font-semibold text-blue-700 tracking-wide"
                    >
                      {openDate === date ? "▼" : "▶"} {formatDate(date)}
                    </td>
                  </tr>

                  {/* Child Rows */}
                  {openDate === date &&
                    items.map((rec, i) => (
                      <tr
                        key={rec.attendanceRecordId}
                        className="hover:bg-gray-50 text-center transition border-b"
                      >
                        <td className="py-2 px-4">{i + 1}</td>
                        <td className="py-2 px-4">
                          {employeeCache[rec.employeeId] || "Loading..."}
                        </td>
                        <td className="py-2 px-4">
                          {formatDate(rec.attendanceDate)}
                        </td>
                        <td className="py-2 px-4">{formatTime(rec.inTime)}</td>
                        <td className="py-2 px-4">{formatTime(rec.outTime)}</td>
                        <td className="py-2 px-4">
                          {rec.shiftSegments?.[0]?.otMinutes || 0}
                        </td>
                        <td className="py-2 px-4">
                          {rec.shiftSegments?.[0]?.earlyLeaveMinutes || 0}
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
