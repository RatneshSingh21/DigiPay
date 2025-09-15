import React from "react";

const items = [
  { label: "Present", color: "bg-green-500" },
  { label: "Absent", color: "bg-red-500" },
  { label: "Leave", color: "bg-orange-400" },
  { label: "Holiday", color: "bg-blue-600" },
  { label: "Week Off", color: "bg-gray-300" },
  { label: "Remote", color: "bg-pink-300" },
  { label: "HalfDay", color: "bg-purple-400" },
];

const Legend = () => (
  <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
    {items.map((item) => (
      <div key={item.label} className="flex items-center space-x-1">
        <span className={`w-3 h-3 rounded-full ${item.color}`} />
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

export default Legend;
