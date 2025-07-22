import React, { useState, useMemo, useEffect } from "react";

const shiftLogs = [
  {
    date: "2025-07-18",
    checkIn: "09:05 AM",
    checkOut: "06:15 PM",
    hoursWorked: "9h 10m",
    status: "On Time",
  },
  {
    date: "2025-10-17",
    checkIn: "09:25 AM",
    checkOut: "06:10 PM",
    hoursWorked: "8h 45m",
    status: "Late",
  },
  {
    date: "2025-06-16",
    checkIn: "08:50 AM",
    checkOut: "06:30 PM",
    hoursWorked: "9h 40m",
    status: "Overtime",
  },
  {
    date: "2025-05-10",
    checkIn: "09:10 AM",
    checkOut: "05:55 PM",
    hoursWorked: "8h 45m",
    status: "On Time",
  },
];

const statusStyles = {
  "On Time": "text-green-600 bg-green-100",
  Late: "text-yellow-600 bg-yellow-100",
  Overtime: "text-blue-600 bg-blue-100",
};

const RecentShiftLogs = () => {
  // Get current month key
  const currentDate = new Date();
  const currentMonthKey = `${currentDate.toLocaleString("default", {
    month: "long",
  }).toLowerCase()} ${currentDate.getFullYear()}`;

  // Full calendar order
  const calendarMonths = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];

  // Extract available months in calendar order
  const availableMonths = useMemo(() => {
    const monthMap = new Map();

    shiftLogs.forEach((log) => {
      const date = new Date(log.date);
      const month = date.toLocaleString("default", { month: "long" }).toLowerCase();
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      const display = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
      monthMap.set(key, { key, display, month, year });
    });

    // Filter in calendar order
    return calendarMonths.flatMap((monthName) =>
      Array.from(monthMap.values()).filter((m) => m.month === monthName)
    );
  }, []);

  // Default selection
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    if (availableMonths.some((m) => m.key === currentMonthKey)) {
      setSelectedMonth(currentMonthKey);
    }
  }, [availableMonths]);

  const filteredLogs =
    selectedMonth === "all"
      ? shiftLogs
      : shiftLogs.filter((log) => {
          const date = new Date(log.date);
          const logMonth = date.toLocaleString("default", { month: "long" }).toLowerCase();
          const logYear = date.getFullYear();
          return `${logMonth} ${logYear}` === selectedMonth;
        });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Recent Shift Logs
        </h3>
        <select
          className="bg-gray-100 dark:bg-gray-700 text-sm p-2 rounded-md outline-none"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="all">Show All</option>
          {availableMonths.map((m) => (
            <option key={m.key} value={m.key}>
              {m.display}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b dark:border-gray-700">
              <th className="p-2">Date</th>
              <th className="p-2">Check-In</th>
              <th className="p-2">Check-Out</th>
              <th className="p-2">Hours Worked</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="p-2">{log.date}</td>
                <td className="p-2">{log.checkIn}</td>
                <td className="p-2">{log.checkOut}</td>
                <td className="p-2">{log.hoursWorked}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[log.status]}`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="5" className="p-2 text-center text-gray-400">
                  No shift logs for selected month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentShiftLogs;
