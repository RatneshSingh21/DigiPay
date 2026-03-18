import React from "react";
import { format, isToday } from "date-fns";

const statusStyles = {
  Holiday: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    dot: "bg-blue-600",
  },
  Present: {
    bg: "bg-green-50",
    border: "border-green-300",
    dot: "bg-green-500",
  },
  Absent: {
    bg: "bg-red-50",
    border: "border-red-300",
    dot: "bg-red-500",
  },
  "Week Off": {
    bg: "bg-gray-100",
    border: "border-gray-300",
    dot: "bg-gray-400",
  },
  Leave: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    dot: "bg-orange-500",
  },
  "Half Day": {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    dot: "bg-yellow-500",
  },
  "Sandwich Leave": {
    bg: "bg-purple-50",
    border: "border-purple-300",
    dot: "bg-purple-500",
  },
  "Extra Day": {
    bg: "bg-teal-50",
    border: "border-teal-300",
    dot: "bg-teal-500",
  },
};

const DayCell = ({ date, data }) => {
  const formattedDate = format(date, "d");
  const isCurrentDay = isToday(date);

  const status = data?.status || "Absent";
  const totalHours = data?.hours ?? 0;

  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  let formattedTime = "--:--";

  if (
    status === "Present" ||
    status === "Half Day" ||
    status === "Extra Day"
  ) {
    formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
  }

  let hoursColor = "text-gray-400";

  if (
    status === "Present" ||
    status === "Half Day" ||
    status === "Extra Day"
  ) {
    hoursColor =
      totalHours >= 8
        ? "text-green-600 font-semibold"
        : "text-red-600 font-semibold";
  }

  const style = statusStyles[status] || statusStyles["Absent"];

  return (
    <div
      className={`rounded-md p-1 min-h-[75px] flex flex-col justify-between items-center transition hover:shadow-md border
        ${style.bg} ${style.border}
        ${isCurrentDay ? "ring-2 ring-green-500" : ""}`}
    >
      <div className="font-medium text-sm">{formattedDate}</div>

      <div className={`text-[11px] ${hoursColor}`}>
        {formattedTime}
      </div>

      <div
        className={`w-2 h-2 mt-1 rounded-full ${style.dot}`}
        title={status}
      />
    </div>
  );
};

export default DayCell;