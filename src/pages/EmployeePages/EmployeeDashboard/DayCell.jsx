import React from "react";
import { format, isToday } from "date-fns";

const statusColors = {
  Leave: "bg-orange-400",
  Holiday: "bg-blue-600",
  Remote: "bg-pink-300",
  Present: "bg-green-500",
  Absent: "bg-red-500",
  HalfDay: "bg-purple-400",
  "Week Off": "bg-gray-300",
};

const DayCell = ({ date, data }) => {
  const formatted = format(date, "d");
  const isCurrentDay = isToday(date); // Check if today

  // check if hours exist and are less than 8
  const isLowHours = data?.hours && parseFloat(data.hours) < 8;

  return (
    <div
      className={`border rounded-md p-1 min-h-[60px] flex flex-col justify-between items-center
        ${isCurrentDay ? "bg-green-100 border-green-300" : ""}
      `}
    >
      <div className="font-medium">{formatted}</div>
      {/* Hours with conditional red text */}
      <div
        className={`text-[11px] font-semibold ${
          isLowHours ? "text-red-500" : "text-gray-700"
        }`}
      >
        {data?.hours ?? "0.0"}
      </div>

      {data?.status && (
        <div
          className={`w-2 h-2 mt-1 rounded-full ${
            statusColors[data.status] || "bg-gray-400"
          }`}
          title={data.status}
        />
      )}
    </div>
  );
};

export default DayCell;
