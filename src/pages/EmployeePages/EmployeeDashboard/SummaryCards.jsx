import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  UserX,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  PartyPopper,
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const SummaryCards = () => {
  const { user } = useAuthStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [summary, setSummary] = useState({
    presentDays: 0,
    absentDays: 0,
    leavesTaken: 0,
    weekendDays: 0,
    holidayDays: 0,
    overtimeHours: 0,
  });

  const [loading, setLoading] = useState(true);

  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();

  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          `/AttendanceRecord/employee/${user.userId}/month`,
          { params: { month, year } },
        );

        const apiData = res.data?.data || [];
        const apiSummary = res.data?.summary || null;

        let presentDays = 0;
        let absentDays = 0;
        let leavesTaken = 0;
        let weekendDays = 0;
        let holidayDays = 0;

        apiData.forEach((item) => {
          switch (item.dayStatus) {
            case 1: // Present
              presentDays += 1;
              break;

            case 2: // Absent
              absentDays += 1;
              break;

            case 3: // Holiday
              holidayDays += 1;
              break;

            case 4: // Weekend
              weekendDays += 1;
              break;

            case 5: // Leave
              leavesTaken += 1;
              break;

            default:
              break;
          }
        });

        setSummary({
          presentDays,
          absentDays,
          leavesTaken,
          weekendDays,
          holidayDays,
          overtimeHours: apiSummary
            ? parseFloat((apiSummary.totalOTMinutes / 60).toFixed(1))
            : 0,
        });
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchSummary();
    }
  }, [user, month, year]);

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
      label: "Weekend Days",
      value: summary.weekendDays,
      icon: <CalendarCheck className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      label: "Holiday Days",
      value: summary.holidayDays,
      icon: <PartyPopper className="w-6 h-6 text-pink-600" />,
      bg: "bg-pink-50",
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
    <div className="bg-white rounded-xl shadow p-4">
      {/* Month Selector */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-black cursor-pointer" />
          </button>

          <h2 className="text-lg font-bold">
            {format(currentMonth, "MMM yyyy")}
          </h2>

          <button onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5 text-gray-700 hover:text-black cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
};

export default SummaryCards;
