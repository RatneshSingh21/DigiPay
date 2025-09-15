import React from "react";
import { format, isToday } from "date-fns";

const statusColors = {
  Office: "bg-green-500",
  Leave: "bg-orange-400",
  Holiday: "bg-green-200",
  Remote: "bg-pink-300",
  Absent: "bg-red-500",
  HalfDay: "bg-purple-400",
  "HalfDay-Unpaid": "bg-cyan-500",
  ML: "bg-blue-600",
  "Week Off": "bg-gray-300",
};

const DayCell = ({ date, data }) => {
  const formatted = format(date, "d");
  const isCurrentDay = isToday(date); // Check if today

  return (
    <div
      className={`border rounded-md p-1 min-h-[60px] flex flex-col justify-between items-center
        ${isCurrentDay ? "bg-green-100 border-green-300" : ""}
      `}
    >
      <div className="font-medium">{formatted}</div>
      <div className="text-[11px] text-gray-700">{data?.hours ?? "0.0"}</div>
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
