import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
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
  const [statusFilter, setStatusFilter] = useState({ label: "All", value: "All" });
  const [attendanceData, setAttendanceData] = useState({}); // yyyy-MM-dd -> perDayDetails object
  const [loading, setLoading] = useState(true);

  const firstDayOfMonth = startOfMonth(selectedDate);
  const lastDayOfMonth = endOfMonth(selectedDate);

  // Fetch attendance calculation results
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/AttendanceCalculationResult/all");
        let data = res.data.response || [];

        if (user?.userId) {
          data = data.filter((item) => item.employeeId === user.userId);
        }

        // Map date -> perDayDetails object
        const mapped = {};
        data.forEach((item) => {
          item.perDayDetails.forEach((d) => {
            const dateKey = format(new Date(d.date), "yyyy-MM-dd");
            mapped[dateKey] = {
              ...d,
              status: item.isAbsent
                ? "Absent"
                : item.isHalfDay
                ? "Half Day"
                : d.otMinutes > 0
                ? "Present"
                : "Present",
            };
          });
        });

        setAttendanceData(mapped);
      } catch (err) {
        console.error("Error fetching attendance calculation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const daysInMonth = useMemo(() => {
    const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Attendance Calendar</h2>
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
              <div key={day} className="text-center">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {filteredDays.map((day, index) => {
              if (!day)
                return <div key={`blank-${index}`} className="h-16 bg-transparent" />;

              const key = format(day, "yyyy-MM-dd");
              const dayData = attendanceData[key] || {};
              const status = dayData.status || "Unknown";
              const color = attendanceColors[status] || "bg-gray-100";
              const textColor = status === "Unknown" ? "text-gray-400" : "text-white";

              return (
                <Tippy
                  key={key}
                  content={
                    dayData.inTime || dayData.outTime ? (
                      <div className="text-xs text-white space-y-1">
                        <div><strong>In:</strong> {dayData.inTime ? format(new Date(dayData.inTime), "HH:mm") : "-"}</div>
                        <div><strong>Out:</strong> {dayData.outTime ? format(new Date(dayData.outTime), "HH:mm") : "-"}</div>
                        <div><strong>Total Hours:</strong> {dayData.totalHoursWorked || 0}</div>
                        <div><strong>Late:</strong> {dayData.lateMinutes || 0} min</div>
                        <div><strong>Early Leave:</strong> {dayData.earlyLeaveMinutes || 0} min</div>
                        <div><strong>OT:</strong> {dayData.otMinutes || 0} min</div>
                      </div>
                    ) : "No data"
                  }
                  placement="top"
                  animation="scale"
                >
                  <div className={`rounded-md px-1 py-1 cursor-pointer text-center flex flex-col justify-center items-center h-16 ${color} ${textColor}`}>
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
