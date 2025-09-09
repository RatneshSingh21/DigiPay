import { useState } from "react";
import { FaClock } from "react-icons/fa";

const attendanceData = [
  {
    name: "Omar Elnosh",
    email: "marion@gmail.com",
    status: "Late",
    timeIn: "09:45AM",
    timeOut: "-",
  },
  {
    name: "Albert Flores",
    email: "albert@gmail.com",
    status: "On time",
    timeIn: "09:00AM",
    timeOut: "-",
  },
  {
    name: "Jacob Jones",
    email: "jacob@gmail.com",
    status: "On time",
    timeIn: "09:00AM",
    timeOut: "-",
  },
];

const statusColors = {
  "On time": "bg-green-100 text-green-700",
  Late: "bg-yellow-100 text-yellow-800",
  Absent: "bg-red-100 text-red-700",
};

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("Day");

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
            <p className="text-sm text-gray-500">
              92 on time · 12 late · 4 absent
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg">
          {["Day", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-3 font-medium">Employee</th>
              <th className="font-medium">Status</th>
              <th className="font-medium">Time In</th>
              <th className="font-medium">Time Out</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((emp, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3">
                  <div>
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </div>
                </td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[emp.status]}`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="text-gray-700">{emp.timeIn}</td>
                <td className="text-gray-700">{emp.timeOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendance;
