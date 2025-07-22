// src/components/TimesheetCalendar.jsx
import React, { useState } from "react";
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

const TimesheetCalendar = ({ records }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayIndex = getDay(startOfMonth(currentMonth)); // Padding days

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full mx-auto">
      {/* Header with arrows and title */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-black" />
          </button>
          <h2 className="text-lg font-bold">
            {format(currentMonth, "MMM yyyy")}
          </h2>
          <button onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5 text-gray-700 hover:text-black" />
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
        {/* Padding for the first row */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`pad-${idx}`} />
        ))}

        {days.map((date) => (
          <DayCell
            key={date}
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
