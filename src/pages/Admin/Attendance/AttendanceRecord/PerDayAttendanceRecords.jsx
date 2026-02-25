import React from "react";

const PerDayAttendanceRecords = ({
  perDayDetails = [],
  selectedMonth,
  selectedYear,
}) => {
  const sortedDays = [...perDayDetails].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  const year = selectedYear;
  const month = selectedMonth;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendar = [];
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  for (let i = 0; i < firstDayOfWeek; i++) calendar.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = sortedDays.find((d) => new Date(d.date).getDate() === day);

    calendar.push(dayData || { date: new Date(year, month, day) });
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

    // Present (In/Out available)
    if (day.inTime || day.outTime) return "bg-green-50 border-green-200";

    return "bg-gray-100 border-gray-200";
  };

  const formatMinutes = (minutes) => {
    if (!minutes || minutes <= 0) return "0h";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div className="max-h-[75vh] overflow-y-auto px-3 py-2">
      {/* Month Header */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          {new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Monthly Attendance Records
        </p>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-600 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-xs">
        {calendar.map((day, idx) => {
          if (!day) return <div key={idx} className="h-24" />;

          const hasData = day.inTime || day.outTime;

          return (
            <div
              key={idx}
              className={`
                min-h-[110px] max-h-32 p-2 rounded-xl border shadow-sm transition-all flex flex-col
               ${getStatusColor(day)} ${isWeekend(day.date) ? "opacity-90" : ""}
                hover:shadow-md
              `}
            >
              {/* Date */}
              <div className="text-sm font-semibold text-gray-800">
                {new Date(day.date).getDate()}
              </div>

              {/* Attendance Info */}
              {hasData ? (
                <div className="mt-2 space-y-1 text-[10px]">
                  {/* In / Out */}
                  <div className="flex justify-between">
                    <span className="text-gray-500">In</span>
                    <span className="font-medium text-gray-800">
                      {day.inTime
                        ? new Date(day.inTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Out</span>
                    <span className="font-medium text-gray-800">
                      {day.outTime
                        ? new Date(day.outTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>

                  {/* Hours */}
                  <div className="flex justify-between border-t border-gray-300 pt-1 mt-1">
                    <span className="text-gray-500">Hrs</span>
                    <span className="font-semibold text-indigo-600">
                      {day.totalHoursWorked
                        ? day.totalHoursWorked.toFixed(2)
                        : "0.00"}
                    </span>
                  </div>

                  {/* OT */}
                  <div className="flex justify-between">
                    <span className="text-gray-500">OT</span>
                    <span className="text-green-600 font-medium">
                      {formatMinutes(day.otMinutes)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    {/* Late */}
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Late : </span>
                      <span className="text-yellow-600 font-medium">
                        {formatMinutes(day.lateMinutes)}
                      </span>
                    </div>

                    {/* Early */}
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Early</span>
                      <span className="text-red-600 font-medium">
                        {formatMinutes(day.earlyLeaveMinutes)}
                      </span>
                    </div>
                  </div>
                  {/* Remarks */}
                  {/* {day.remarks && (
                    <div className="border-t mt-1 pt-1 text-gray-500 truncate">
                      {day.remarks}
                    </div>
                  )} */}
                </div>
              ) : (
                <div className="mt-3 text-center text-gray-400 text-[11px]">
                  No Record
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-400 rounded-full" />
          <span>Present</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-400 rounded-full" />
          <span>Half Day</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-400 rounded-full" />
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
};

export default PerDayAttendanceRecords;
