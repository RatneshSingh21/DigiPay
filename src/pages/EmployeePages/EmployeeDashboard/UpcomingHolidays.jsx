import React from "react";
import { format, parseISO } from "date-fns";

const holidays = [
  { date: "2025-08-15", occasion: "Independence Day" },
  { date: "2025-09-02", occasion: "Ganesh Chaturthi" },
  { date: "2025-10-02", occasion: "Gandhi Jayanti" },
  { date: "2025-10-31", occasion: "Diwali" },
  { date: "2025-12-25", occasion: "Christmas" },
];

const UpcomingHolidays = () => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 py-3">
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {holidays.map((holiday, index) => {
          const dateObj = parseISO(holiday.date);
          return (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-3 text-sm"
            >
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {holiday.occasion}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(dateObj, "EEEE")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {format(dateObj, "dd MMM yyyy")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingHolidays;
