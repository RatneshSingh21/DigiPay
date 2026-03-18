import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import DayCell from "./DayCell";
import Legend from "./Legend";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const TimesheetCalendar = () => {
  const { user } = useAuthStore();

  // Convert decimal hours → "Xhr Ym"
  const formatHours = (decimalHours) => {
    if (!decimalHours) return "0hr 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}hr ${minutes}m`;
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();

  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          `/AttendanceRecord/employee-month-record-nopage`,
          {
            params: {
              employeeId: user.userId,
              month,
              year,
            },
          }
        );

        const apiData = res.data?.data || [];
        const apiSummary = res.data?.summary || null;

        setSummary(apiSummary);

        const mapped = {};

        apiData.forEach((item) => {
          if (!item.attendanceDate) return;

          const dateObj = new Date(item.attendanceDate);
          if (isNaN(dateObj)) return;

          const key = format(dateObj, "yyyy-MM-dd");

          let status = "Absent";

          // ✅ Priority-based logic (same as SQL thinking)

          if (item.isHoliday || item.dayStatus === 3) {
            status = "Holiday";
          }
          else if (item.isWeekend) {
            // Weekend-based overrides
            if (item.dayStatus === 7) {
              status = "Sandwich Leave";
            }
            else if (item.dayStatus === 8) {
              status = "Extra Day";
            }
            else {
              status = "Week Off";
            }
          }
          else {
            // Normal working days
            switch (item.dayStatus) {
              case 1:
                status = "Present";
                break;
              case 2:
                status = "Absent";
                break;
              case 5:
                status = "Leave";
                break;
              case 6:
                status = "Half Day";
                break;
              default:
                status = "Absent";
            }
          }
          mapped[key] = {
            inTime: item.inTime,
            outTime: item.outTime,
            hours: item.totalHoursWorked || 0,
            status,
            isWeekend: item.isWeekend,
            isHoliday: item.isHoliday,
            remarks: item.remarks,
          };
        });

        setRecords(mapped);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchAttendance();
    }
  }, [user, month, year]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayIndex = getDay(startOfMonth(currentMonth));



  if (loading)
    return <p className="text-center text-gray-500">Loading attendance...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-black cursor-pointer" />
          </button>

          <h2 className="text-lg font-bold">
            {format(currentMonth, "MMM yyyy")}
          </h2>

          <button onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5 text-gray-700 hover:text-black cursor-pointer" />
          </button>
        </div>

        <span className="text-sm text-gray-500">Time Format: hh:mm</span>
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex justify-between text-sm mb-4 bg-gray-50 p-3 rounded-lg">
          <div>
            Total Hours:{" "}
            <span className="font-semibold text-green-600">
              {formatHours(summary?.totalHoursWorked)}            </span>
          </div>
          <div>
            OT Minutes:{" "}
            <span className="font-semibold text-blue-600">
              {summary.totalOTMinutes}
            </span>
          </div>
        </div>
      )}

      {/* Days Header */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-center gap-2 mt-2 text-xs">
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`pad-${idx}`} />
        ))}

        {days.map((date) => (
          <DayCell
            key={format(date, "yyyy-MM-dd")}
            date={date}
            data={records[format(date, "yyyy-MM-dd")]}
          />
        ))}
      </div>

      <Legend />
    </div>
  );
};

export default TimesheetCalendar;
