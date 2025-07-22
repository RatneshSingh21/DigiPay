import React from "react";
import { CalendarDays, UserX, Clock, Briefcase } from "lucide-react";

const summaryData = [
  {
    label: "Present Days",
    value: 22,
    icon: <CalendarDays className="w-6 h-6 text-green-600" />,
    bg: "bg-green-50",
  },
  {
    label: "Absent Days",
    value: 2,
    icon: <UserX className="w-6 h-6 text-red-600" />,
    bg: "bg-red-50",
  },
  {
    label: "Leaves Taken",
    value: 3,
    icon: <Briefcase className="w-6 h-6 text-yellow-600" />,
    bg: "bg-yellow-50",
  },
  {
    label: "Overtime Hours",
    value: "12 hrs",
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    bg: "bg-blue-50",
  },
];

const SummaryCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryData.map((item, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl shadow-sm ${item.bg} flex items-center gap-4`}
        >
          <div className="p-2 rounded-full bg-white shadow">{item.icon}</div>
          <div>
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="text-lg font-bold">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
