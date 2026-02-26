import React, { useEffect, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
} from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmpAttendance = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);

  const firstDayOfMonth = startOfMonth(selectedDate);
  const lastDayOfMonth = endOfMonth(selectedDate);

  // 🔹 Format decimal hours → 1hr 30m
  const formatHours = (decimalHours) => {
    if (!decimalHours) return "0hr 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}hr ${minutes}m`;
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/Attendance/GetByEmployeeId/${user.userId}`,
        );
        const grouped = {};
        res.data.forEach((item) => {
          const dateObj = new Date(item.attendanceDate);
          if (!isSameMonth(dateObj, selectedDate)) return;

          const dateKey = format(dateObj, "yyyy-MM-dd");
          if (!grouped[dateKey])
            grouped[dateKey] = { inTime: null, outTime: null, totalHours: 0 };

          if (item.punchType === "IN") grouped[dateKey].inTime = item.inTime;
          if (item.punchType === "OUT") grouped[dateKey].outTime = item.outTime;
          grouped[dateKey].totalHours = item.totalHours;
        });
        setAttendanceData(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.userId) fetchAttendance();
  }, [user, selectedDate]);

  const daysInMonth = useMemo(() => {
    const days = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });
    const padding = Array.from({ length: getDay(firstDayOfMonth) }, () => null);
    return [...padding, ...days];
  }, [selectedDate]);

  // Monthly totals
  const monthlyTotal = Object.values(attendanceData).reduce(
    (sum, day) => sum + (day.totalHours || 0),
    0,
  );
  const absentDays = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  }).filter(
    (d) => !attendanceData[format(d, "yyyy-MM-dd")] && getDay(d) !== 0,
  ).length;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-lg transition-all duration-500">
      {/* Header */}
      <div className="mb-2 bg-white rounded-2xl shadow-md p-5 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {format(selectedDate, "MMMM yyyy")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Employee Monthly Attendance Overview
            </p>
          </div>
          <div>
            <input
              type="month"
              value={format(selectedDate, "yyyy-MM")}
              onChange={(e) => {
                const [year, month] = e.target.value.split("-");
                setSelectedDate(new Date(year, month - 1));
              }}
              className="border border-gray-300 px-4 py-1.5 rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium">Total Hours</p>
            <h3 className="text-xl font-bold text-indigo-700 mt-1">
              {formatHours(monthlyTotal)}
            </h3>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-xs text-green-600 font-medium">Present Days</p>
            <h3 className="text-xl font-bold text-green-700 mt-1">
              {Object.keys(attendanceData).length}
            </h3>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
            <p className="text-xs text-yellow-600 font-medium">
              Working Days (Month)
            </p>
            <h3 className="text-xl font-bold text-yellow-700 mt-1">
              {
                eachDayOfInterval({
                  start: firstDayOfMonth,
                  end: lastDayOfMonth,
                }).filter((d) => getDay(d) !== 0).length
              }
            </h3>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-xs text-red-600 font-medium">Absent Days</p>
            <h3 className="text-xl font-bold text-red-700 mt-1">
              {absentDays}
            </h3>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mb-4 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-full bg-green-400 border border-green-500"></span>{" "}
          Present
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-full bg-yellow-300 border border-yellow-400"></span>{" "}
          Missing Punch
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-full bg-indigo-300 border border-indigo-400"></span>{" "}
          Today
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></span>{" "}
          No Record
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-full bg-red-300 border border-red-400"></span>{" "}
          Overtime (&gt;9hr)
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-xs font-semibold text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day, index) => {
          if (!day) return <div key={index} className="h-20"></div>;

          const key = format(day, "yyyy-MM-dd");
          const dayData = attendanceData[key];
          const missingPunch = dayData && (!dayData.inTime || !dayData.outTime);
          const overtime = dayData && dayData.totalHours > 9;
          const isWeekend = getDay(day) === 0 || getDay(day) === 6;

          return (
            <div
              key={key}
              className={`h-20 rounded-xl p-2 flex flex-col justify-between border text-xs transition-all duration-300
                ${isToday(day) ? "border-indigo-400 bg-indigo-100" : ""}
                ${dayData ? "border-green-200 bg-green-50" : ""}
                ${missingPunch ? "border-yellow-400 bg-yellow-50" : ""}
                ${overtime ? "border-red-400 bg-red-50" : ""}
                ${!dayData && !isToday(day) ? "border-gray-200 bg-white" : ""}
                ${isWeekend ? "bg-gray-100" : ""}
              `}
              title={
                dayData
                  ? `IN: ${dayData.inTime ? format(new Date(dayData.inTime), "HH:mm") : "--"} | OUT: ${dayData.outTime ? format(new Date(dayData.outTime), "HH:mm") : "--"} | Worked: ${formatHours(dayData.totalHours)}`
                  : "No Record"
              }
            >
              <div className="flex justify-between">
                <span
                  className={`font-bold ${isWeekend ? "text-gray-600" : "text-gray-700"}`}
                >
                  {format(day, "d")}
                </span>
                {dayData && (
                  <span className="text-[10px] font-semibold text-indigo-600">
                    {formatHours(dayData.totalHours)}
                  </span>
                )}
              </div>
              {dayData ? (
                <div className="space-y-0.5 text-[10px] font-bold">
                  <div className="text-green-600">
                    IN:{" "}
                    {dayData.inTime
                      ? format(new Date(dayData.inTime), "HH:mm")
                      : "--"}
                  </div>
                  <div className="text-red-500">
                    OUT:{" "}
                    {dayData.outTime
                      ? format(new Date(dayData.outTime), "HH:mm")
                      : "--"}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-[10px]">—</div>
              )}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center mt-4 text-xs text-gray-500">
          Loading attendance...
        </div>
      )}
    </div>
  );
};

export default EmpAttendance;
