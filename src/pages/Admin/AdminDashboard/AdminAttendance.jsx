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

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("Day");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Attendance</h3>
          <p className="text-sm text-gray-400">92 on time · 12 late · 4 absent</p>
        </div>
        <div className="flex gap-2">
          {["Day", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 text-sm rounded-lg ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-gray-500 border border-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b">
            <th className="py-2">Employee</th>
            <th>Status</th>
            <th>Time In</th>
            <th>Time Out</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((emp, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.email}</p>
                </div>
              </td>
              <td>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    emp.status === "Late"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {emp.status}
                </span>
              </td>
              <td>{emp.timeIn}</td>
              <td>{emp.timeOut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAttendance;
