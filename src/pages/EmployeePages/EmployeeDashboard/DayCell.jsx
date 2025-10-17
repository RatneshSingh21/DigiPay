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
  const isCurrentDay = isToday(date); // highlight today

  const totalHours = data?.totalHoursWorked ?? 0;
  const hoursColor =
    totalHours === 0
      ? "text-gray-400"
      : totalHours >= 8
      ? "text-green-600 font-semibold"
      : "text-red-600 font-semibold";

  return (
    <div
      className={`border cursor-pointer rounded-md p-1 min-h-[60px] flex flex-col justify-between items-center
        ${isCurrentDay ? "bg-green-100 border-green-300" : ""}`}
    >
      <div className="font-medium">{formatted}</div>

      {/* Total hours worked */}
      <div className={`text-[11px] ${hoursColor}`}>{totalHours.toFixed(1)}</div>

      {/* Status dot */}
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
