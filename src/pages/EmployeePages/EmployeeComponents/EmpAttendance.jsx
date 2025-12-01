import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const attendanceColors = {
  Present: "bg-green-500",
  Absent: "bg-red-500",
  Leave: "bg-yellow-400",
  "Half Day": "bg-blue-400",
  Weekend: "bg-gray-300",
  Holiday: "bg-purple-400",
  Unknown: "bg-gray-100",
};

const statusOptions = ["All", ...Object.keys(attendanceColors)].map((item) => ({
  label: item,
  value: item,
}));

const EmpAttendance = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState({
    label: "All",
    value: "All",
  });
  const [attendanceData, setAttendanceData] = useState({}); // yyyy-MM-dd -> perDayDetails
  const [loading, setLoading] = useState(true);

  const firstDayOfMonth = startOfMonth(selectedDate);
  const lastDayOfMonth = endOfMonth(selectedDate);

  // Convert decimal hours to hh:mm
  const formatHours = (totalHours) => {
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch calculation data
        const calcRes = await axiosInstance.get(
          "/AttendanceCalculationResult/all"
        );
        let calcData = calcRes.data.response || [];
        if (user?.userId) {
          calcData = calcData.filter((item) => item.employeeId === user.userId);
        }

        // 2️⃣ Fetch punch data
        const punchRes = await axiosInstance.get("/Attendance/all");
        let punchData = punchRes.data || [];
        if (user?.userId) {
          punchData = punchData.filter(
            (item) => item.employeeId === user.userId
          );
        }

        const mapped = {};

        // Map calculation data
        calcData.forEach((item) => {
          item.perDayDetails.forEach((d) => {
            const key = format(new Date(d.date), "yyyy-MM-dd");
            mapped[key] = {
              inTime: d.inTime || null,
              outTime: d.outTime || null,
              totalHoursWorked: d.totalHoursWorked || 0,
              lateMinutes: d.lateMinutes || 0,
              earlyLeaveMinutes: d.earlyLeaveMinutes || 0,
              otMinutes: d.otMinutes || 0,
              status: item.isAbsent
                ? "Absent"
                : item.isHalfDay
                ? "Half Day"
                : "Present",
            };
          });
        });

        // Merge punch data if calculation missing or add IN/OUT
        punchData.forEach((item) => {
          const key = format(new Date(item.attendanceDate), "yyyy-MM-dd");

          if (!mapped[key]) {
            mapped[key] = {
              inTime: item.punchType === "IN" ? item.inTime : null,
              outTime: item.punchType === "OUT" ? item.outTime : null,
              totalHoursWorked: 0, // Will calculate below
              lateMinutes: 0,
              earlyLeaveMinutes: 0,
              otMinutes: 0,
              status: item.status || "Unknown",
            };
          } else {
            if (item.punchType === "IN" && !mapped[key].inTime)
              mapped[key].inTime = item.inTime;
            if (item.punchType === "OUT" && !mapped[key].outTime)
              mapped[key].outTime = item.outTime;
          }

          // Calculate total hours from IN/OUT
          const inTime = mapped[key].inTime
            ? new Date(mapped[key].inTime)
            : null;
          const outTime = mapped[key].outTime
            ? new Date(mapped[key].outTime)
            : null;
          if (inTime && outTime) {
            const diffHours = (outTime - inTime) / (1000 * 60 * 60); // difference in hours
            mapped[key].totalHoursWorked = diffHours;
          }
        });

        setAttendanceData(mapped);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

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
    return attendanceData[key]?.status || "Unknown";
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

      {loading ? (
        <p className="text-center text-gray-500">Loading attendance...</p>
      ) : (
        <>
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
                  <div key={`blank-${index}`} className="h-16 bg-transparent" />
                );

              const key = format(day, "yyyy-MM-dd");
              const dayData = attendanceData[key] || {};
              const status = dayData.status || "Unknown";
              const color = attendanceColors[status] || "bg-gray-100";
              const textColor =
                status === "Unknown" ? "text-gray-400" : "text-white";

              return (
                <Tippy
                  key={key}
                  content={
                    dayData.inTime || dayData.outTime ? (
                      <div className="text-xs text-white space-y-1">
                        <div>
                          <strong>In:</strong>{" "}
                          {dayData.inTime
                            ? format(new Date(dayData.inTime), "HH:mm")
                            : "-"}
                        </div>
                        <div>
                          <strong>Out:</strong>{" "}
                          {dayData.outTime
                            ? format(new Date(dayData.outTime), "HH:mm")
                            : "-"}
                        </div>
                        <div>
                          <strong>Total Hours:</strong>{" "}
                          {dayData.totalHoursWorked
                            ? formatHours(dayData.totalHoursWorked)
                            : "00:00"}
                        </div>
                        <div>
                          <strong>Late:</strong> {dayData.lateMinutes || 0} min
                        </div>
                        <div>
                          <strong>Early Leave:</strong>{" "}
                          {dayData.earlyLeaveMinutes || 0} min
                        </div>
                        <div>
                          <strong>OT:</strong> {dayData.otMinutes || 0} min
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
                    className={`rounded-md px-1 py-1 cursor-pointer text-center flex flex-col justify-center items-center h-16 ${color} ${textColor}`}
                  >
                    <div className="font-bold text-sm">{format(day, "d")}</div>
                    <div className="text-[9px] mt-0.5">{status}</div>
                  </div>
                </Tippy>
              );
            })}
          </div>
        </>
      )}

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
