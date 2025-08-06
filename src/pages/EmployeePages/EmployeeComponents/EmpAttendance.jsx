import React, { useState, useMemo } from "react";
import Select from "react-select"; // 👈 React Select import
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";

const mockAttendanceData = {
  "2025-08-01": "Present",
  "2025-08-02": "Absent",
  "2025-08-03": "Leave",
  "2025-08-04": "Half-Day",
  "2025-08-05": "Present",
  "2025-08-06": "Absent",
  "2025-08-07": "Present",
  "2025-08-08": "Leave",
  "2025-08-09": "Weekend",
  "2025-08-10": "Weekend",
};

const attendanceColors = {
  Present: "bg-green-500",
  Absent: "bg-red-500",
  Leave: "bg-yellow-400",
  "Half-Day": "bg-blue-400",
  Weekend: "bg-gray-300",
  Holiday: "bg-purple-400",
  Unknown: "bg-gray-100",
};

const statusOptions = ["All", ...Object.keys(attendanceColors)].map((item) => ({
  label: item,
  value: item,
}));

const EmpAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState({ label: "All", value: "All" });

  const firstDayOfMonth = startOfMonth(selectedDate);
  const lastDayOfMonth = endOfMonth(selectedDate);

  const daysInMonth = useMemo(() => {
    const days = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });

    const startWeekday = getDay(firstDayOfMonth);
    const padding = Array.from({ length: startWeekday }, () => null);

    return [...padding, ...days];
  }, [selectedDate]);

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setSelectedDate(new Date(year, month - 1));
  };

  const getStatus = (date) => {
    if (!date) return "Unknown";
    const key = format(date, "yyyy-MM-dd");
    return mockAttendanceData[key] || "Unknown";
  };

  const filteredDays = daysInMonth.filter((day) => {
    const status = getStatus(day);
    return statusFilter.value === "All" || status === statusFilter.value;
  });

  return (
    <div className="p-5 bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Attendance Calendar
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="month"
            value={format(selectedDate, "yyyy-MM")}
            onChange={handleMonthChange}
            className="border px-3 py-1 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="min-w-[160px]">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(selected) => setStatusFilter(selected)}
              className="text-sm"
              classNamePrefix="react-select"
              isSearchable
            />
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 text-xs font-semibold text-gray-600 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {filteredDays.map((day, index) => {
          if (!day)
            return (
              <div
                key={`blank-${index}`}
                className="h-14 sm:h-16 bg-transparent"
              />
            );

          const status = getStatus(day);
          const color = attendanceColors[status] || "bg-gray-100";

          return (
            <div
              key={day}
              className={`rounded-md sm:rounded-lg px-1 py-1 sm:p-2 text-center text-[10px] sm:text-xs text-white flex flex-col justify-center items-center h-14 sm:h-16 ${color}`}
            >
              <div className="font-bold text-xs sm:text-sm">
                {format(day, "d")}
              </div>
              <div className="text-[9px] mt-0.5 sm:mt-1">{status}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold mb-2">Legend</h3>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          {Object.entries(attendanceColors).map(([label, color]) => (
            <div key={label} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${color}`}></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmpAttendance;
