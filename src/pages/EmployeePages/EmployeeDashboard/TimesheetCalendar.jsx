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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState({}); // yyyy-MM-dd -> perDayDetails
  const [loading, setLoading] = useState(true);

  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));

  // Fetch attendance calculation results
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/AttendanceCalculationResult/all");
        let data = res.data.response || [];

        // Filter for current employee
        if (user?.userId) {
          data = data.filter((item) => item.employeeId === user.userId);
        }

        // Map perDayDetails to { "yyyy-MM-dd": details }
        const mapped = {};
        data.forEach((item) => {
          item.perDayDetails.forEach((d) => {
            const key = format(new Date(d.date), "yyyy-MM-dd");
            mapped[key] = {
              ...d,
              status: item.isAbsent
                ? "Absent"
                : item.isHalfDay
                ? "Half Day"
                : "Present",
            };
          });
        });

        setRecords(mapped);
      } catch (err) {
        console.error("Error fetching attendance calculation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const firstDayIndex = getDay(startOfMonth(currentMonth)); // Padding days

  if (loading) return <p className="text-center text-gray-500">Loading attendance...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full mx-auto">
      {/* Header with arrows */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-black cursor-pointer" />
          </button>
          <h2 className="text-lg font-bold">{format(currentMonth, "MMM yyyy")}</h2>
          <button onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5 text-gray-700 hover:text-black cursor-pointer" />
          </button>
        </div>
        <span className="text-sm text-gray-500">Time Format: hh:mm</span>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center gap-2 mt-2 text-xs">
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`pad-${idx}`} />
        ))}

        {days.map((date) => (
          <DayCell key={date} date={date} data={records[format(date, "yyyy-MM-dd")]} />
        ))}
      </div>

      <Legend />
    </div>
  );
};

export default TimesheetCalendar;
