import React, { useState, useMemo } from "react";

const PerDayAttendanceCalendar = ({ perDayDetails = [] }) => {
  const today = new Date();

  // Detect default month/year from API data if exists
  const defaultDate = perDayDetails.length
    ? new Date(perDayDetails[0].date)
    : today;

  const [selectedMonth, setSelectedMonth] = useState(defaultDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(defaultDate.getFullYear());

  // Map data for faster lookup
  const mappedData = useMemo(() => {
    const map = {};
    perDayDetails.forEach((d) => {
      const date = new Date(d.date);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      map[key] = d;
    });
    return map;
  }, [perDayDetails]);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const calendar = [];

  // Empty slots before month start
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendar.push(null);
  }

  // Fill month days
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${selectedYear}-${selectedMonth}-${day}`;
    const existingData = mappedData[key];

    calendar.push(
      existingData || {
        date: new Date(selectedYear, selectedMonth, day),
      },
    );
  }

  const isWeekend = (date) => {
    const d = new Date(date);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  const getStatusColor = (day) => {
    // No record
    if (!day.inTime && !day.outTime && !day.isAbsent && !day.isHalfDay)
      return "bg-gray-100 border-gray-200";

    // Absent
    if (day.isAbsent) return "bg-red-50 border-red-200";

    // Half Day
    if (day.isHalfDay) return "bg-yellow-50 border-yellow-200";

    // Present
    if (day.inTime || day.outTime) return "bg-green-50 border-green-200";

    return "bg-gray-100 border-gray-200";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const yearOptions = [];
  for (let y = selectedYear - 5; y <= selectedYear + 2; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto p-3 relative">
      {/* Month & Year Selector */}
      <div className="flex justify-center items-center gap-4 mb-4 absolute  right-4">
        {/* Month Selector */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="
              appearance-none
              bg-white
              border border-gray-300
              rounded-lg
              px-4 pr-10 py-2
              text-sm font-medium text-gray-700
              shadow-sm
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500
              transition
              cursor-pointer
            "
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index} value={index}>
                {new Date(0, index).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            ▼
          </div>
        </div>

        {/* Year Selector */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="
              appearance-none
              bg-white
              border border-gray-300
              rounded-lg
              px-4 pr-10 py-2
              text-sm font-medium text-gray-700
              shadow-sm
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500
              transition
              cursor-pointer
            "
                >
            {Array.from({ length: 5 }).map((_, index) => {
              const year = today.getFullYear() - 2 + index;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            ▼
          </div>
        </div>
      </div>

      <h4 className="text-center font-semibold text-gray-700 mb-3">
        Monthly Attendance Calculations
      </h4>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {calendar.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const hasData = day.inTime || day.outTime;

          return (
            <div
              key={idx}
              className={`
                relative
                min-h-[110px]
                p-2
                rounded-xl
                border
                shadow-sm
                transition-all
                flex
                flex-col
                ${getStatusColor(day)}
                ${isWeekend(day.date) ? "opacity-90" : ""}
                hover:shadow-md
              `}
            >
              {/* Date */}
              <div className="font-semibold text-sm mb-1">
                {new Date(day.date).getDate()}
              </div>

              {hasData ? (
                <div className="space-y-1 text-[10px]">
                  {/* In */}
                  <div className="flex justify-between">
                    <span className="text-gray-500">In</span>
                    <span>
                      {new Date(day.inTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Out */}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Out</span>
                    <span>
                      {new Date(day.outTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Hours */}
                  <div className="flex justify-between border-t border-gray-300 pt-1">
                    <span className="text-gray-500">Hrs</span>
                    <span className="font-semibold text-indigo-600">
                      {day.totalHoursWorked?.toFixed(2)}
                    </span>
                  </div>

                  {/* Late */}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Late</span>
                    <span className="text-yellow-600">
                      {day.lateMinutes || 0}m
                    </span>
                  </div>

                  <div className="flex justify-between gap-1">
                    {/* OT */}
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">OT</span>
                      <span className="text-green-600">
                        {day.otMinutes || 0}m
                      </span>
                    </div>

                    {/* Early Leave */}
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Early</span>
                      <span className="text-red-600">
                        {day.earlyLeaveMinutes || 0}m
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center mt-4">No Record</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          Present
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          Half Day
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          Absent
        </div>
      </div>
    </div>
  );
};

export default PerDayAttendanceCalendar;
