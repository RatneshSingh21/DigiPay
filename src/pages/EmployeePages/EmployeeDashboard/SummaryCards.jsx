import React, { useEffect, useState } from "react";
import { CalendarDays, UserX, Clock, Briefcase } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const SummaryCards = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState({
    presentDays: 0,
    absentDays: 0,
    leavesTaken: 0,
    overtimeHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/AttendanceCalculationResult/all");
        let data = res.data.response || [];

        // Filter for current employee
        if (user?.userId) {
          data = data.filter((item) => item.employeeId === user.userId);
        }

        // Calculate summary values
        let presentDays = 0;
        let absentDays = 0;
        let leavesTaken = 0;
        let overtimeHours = 0;

        data.forEach((record) => {
          record.perDayDetails.forEach((day) => {
            if (record.isAbsent) absentDays += 1;
            else if (record.isHalfDay) leavesTaken += 1;
            else presentDays += 1;

            overtimeHours += day.otMinutes / 60 || 0;
          });
        });

        setSummary({
          presentDays,
          absentDays,
          leavesTaken,
          overtimeHours: parseFloat(overtimeHours.toFixed(1)),
        });
      } catch (err) {
        console.error("Error fetching attendance summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  const summaryData = [
    {
      label: "Present Days",
      value: summary.presentDays,
      icon: <CalendarDays className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Absent Days",
      value: summary.absentDays,
      icon: <UserX className="w-6 h-6 text-red-600" />,
      bg: "bg-red-50",
    },
    {
      label: "Leaves Taken",
      value: summary.leavesTaken,
      icon: <Briefcase className="w-6 h-6 text-yellow-600" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Overtime Hours",
      value: `${summary.overtimeHours} hrs`,
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
    },
  ];

  if (loading)
    return <p className="text-center text-gray-500">Loading summary...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {summaryData.map((item, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl shadow-sm ${item.bg} flex items-center gap-4`}
        >
          <div className="p-2 rounded-full bg-white shadow cursor-pointer">{item.icon}</div>
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
