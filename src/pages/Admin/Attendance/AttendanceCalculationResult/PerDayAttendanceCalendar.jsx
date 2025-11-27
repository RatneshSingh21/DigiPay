import React from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const PerDayAttendanceCalendar = ({ perDayDetails = [] }) => {
  if (!perDayDetails.length)
    return (
      <p className="text-gray-500 text-center mt-4">
        No per-day data available.
      </p>
    );

  // Sort days
  const sortedDays = [...perDayDetails].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const firstDate = new Date(sortedDays[0].date);
  const year = firstDate.getFullYear();
  const month = firstDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendar = [];
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  for (let i = 0; i < firstDayOfWeek; i++) calendar.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = sortedDays.find((d) => new Date(d.date).getDate() === day);
    calendar.push(dayData || { date: new Date(year, month, day) });
  }

  const getStatusColor = (day) => {
    if (!day || (!day.inTime && !day.outTime)) return "bg-white";
    if (day.isAbsent) return "bg-red-100 text-red-800";
    if (day.isHalfDay) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800"; // Present
  };

  const getStatusDotColor = (day) => {
    if (!day || (!day.inTime && !day.outTime)) return "";
    if (day.isAbsent) return "bg-red-500";
    if (day.isHalfDay) return "bg-yellow-500";
    return "bg-green-500";
  };

  const isWeekend = (date) => {
    const d = new Date(date);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-2">
      <h4 className="font-semibold text-gray-700 mb-4 text-center text-lg">
        Daily Attendance (Monthly Calendar)
      </h4>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((day, idx) => {
          if (!day) return <div key={idx} className="p-3"></div>;

          const hasData = day.inTime || day.outTime;

          return (
            <Tippy
              key={idx}
              content={
                hasData ? (
                  <div className="text-xs text-white space-y-1">
                    <div>
                      <strong>In:</strong>{" "}
                      {day.inTime
                        ? new Date(day.inTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </div>
                    <div>
                      <strong>Out:</strong>{" "}
                      {day.outTime
                        ? new Date(day.outTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </div>
                    <div>
                      <strong>Total Hours:</strong>{" "}
                      {day.totalHoursWorked.toFixed(4) || 0}
                    </div>
                    <div>
                      <strong>Late:</strong> {day.lateMinutes || 0} min
                    </div>
                    <div>
                      <strong>Early Leave:</strong> {day.earlyLeaveMinutes || 0}{" "}
                      min
                    </div>
                  </div>
                ) : (
                  "No data"
                )
              }
              placement="top"
              animation="scale"
            >
              <div
                className={`relative cursor-pointer flex flex-col items-center justify-center p-2 rounded-lg shadow-sm border transition-all
                ${isWeekend(day.date) ? "bg-gray-50" : getStatusColor(day)}
                hover:shadow-md`}
              >
                {hasData && (
                  <span
                    className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusDotColor(
                      day
                    )}`}
                  />
                )}

                {/* Day Number */}
                <div className="text-sm font-semibold">
                  {new Date(day.date).getDate()}
                </div>

                {/* Hours */}
                {day.totalHoursWorked && (
                  <div className="text-xs text-gray-700 mt-1">
                    {day.totalHoursWorked.toFixed(4)} hrs
                  </div>
                )}

                {/* Late/Early label */}
                {(day.lateMinutes || day.earlyLeaveMinutes) && (
                  <div className="mt-1 flex space-x-1">
                    {day.lateMinutes > 0 && (
                      <span className="text-xs text-orange-600 font-medium">
                        L:{day.lateMinutes}
                      </span>
                    )}
                    {day.earlyLeaveMinutes > 0 && (
                      <span className="text-xs text-red-600 font-medium">
                        E:{day.earlyLeaveMinutes}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Tippy>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span>Present</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span>Half Day</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
};

export default PerDayAttendanceCalendar;
