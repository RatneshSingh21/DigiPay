import React from "react";
import {
  FaCalendarCheck,
  FaMoneyBill,
  FaUserShield,
  FaGift,
  FaPercentage,
} from "react-icons/fa";

export default function ReportSidebar({ selected, onSelect }) {
  const reports = [
    { key: "attendance", label: "Attendance", icon: <FaCalendarCheck /> },
    { key: "salary_ot", label: "Salary (With OT)", icon: <FaMoneyBill /> },
    { key: "salary_no_ot", label: "Salary (Without OT)", icon: <FaMoneyBill /> },
    { key: "pf", label: "PF", icon: <FaPercentage /> },
    { key: "esi", label: "ESI", icon: <FaUserShield /> },
    { key: "bonus", label: "Bonus", icon: <FaGift /> },
  ];

  return (
    <aside className="w-72 bg-white border-r min-h-screen p-4">
      <h3 className="text-lg font-semibold mb-4">Reports</h3>
      <div className="space-y-2">
        {reports.map((r) => (
          <div
            key={r.key}
            onClick={() => onSelect(r.key)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-shadow select-none
              ${
                selected === r.key
                  ? "bg-blue-600 text-white shadow"
                  : "hover:bg-gray-50"
              }`}
          >
            <div className="text-xl">{r.icon}</div>
            <div className="text-sm font-medium">{r.label}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
