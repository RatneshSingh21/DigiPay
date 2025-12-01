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

        console.log(data);

        // Filter for current employee
        if (user?.userId) {
          data = data.filter((item) => item.employeeId === user.userId);
        }

        // Variables
        let presentDays = 0;
        let absentDays = 0;
        let leavesTaken = 0;
        let overtimeHours = 0;

        // Filter current month data
        const currentMonth = new Date().getMonth(); // 0-11
        const currentYear = new Date().getFullYear();

        data.forEach((record) => {
          // Build a set of explicit leave dates for this record (ISO yyyy-mm-dd)
          const leaveDates = new Set();

          // 1) If the record has leaveAdjustments (month-level), expand them
          if (
            Array.isArray(record.leaveAdjustments) &&
            record.leaveAdjustments.length
          ) {
            record.leaveAdjustments.forEach((adj) => {
              // adj might have fromDate/toDate or a single date — handle both defensively
              const from = adj.fromDate || adj.date;
              const to = adj.toDate || adj.date;

              if (from) {
                const start = new Date(from);
                const end = to ? new Date(to) : start;

                // iterate each day in range (inclusive)
                for (
                  let d = new Date(start);
                  d <= end;
                  d.setDate(d.getDate() + 1)
                ) {
                  leaveDates.add(d.toISOString().split("T")[0]);
                }
              }
            });
          }

          // 2) Also gather perDayDetails that explicitly mark leave (if API provides flags)
          record.perDayDetails.forEach((day) => {
            // If API provides a leave flag or leaveType inside day, consider it explicit leave
            if (
              day.isLeave ||
              day.leaveType ||
              (day.isAbsent === true && day.leaveType)
            ) {
              const key = new Date(day.date).toISOString().split("T")[0];
              leaveDates.add(key);
            }
          });

          // Now process only current-month days
          record.perDayDetails
            .filter((day) => {
              const d = new Date(day.date);
              return (
                d.getMonth() === currentMonth && d.getFullYear() === currentYear
              );
            })
            .forEach((day) => {
              const dayKey = new Date(day.date).toISOString().split("T")[0];
              const hours = day.totalHoursWorked || 0;

              // If this date is explicitly a leave date -> count as leave (full/partial)
              if (leaveDates.has(dayKey)) {
                // If employee worked some hours on a leave day it's a partial leave — still counted as leave
                leavesTaken += 1;
              } else {
                // No explicit leave recorded for this date
                if (hours > 0) {
                  // Employee came to office (even if < 8) -> count as present
                  presentDays += 1;
                } else {
                  // No hours and no leave record -> absent
                  absentDays += 1;
                }
              }

              // Overtime (always sum if provided)
              overtimeHours += (day.otMinutes || 0) / 60;
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
          <div className="p-2 rounded-full bg-white shadow cursor-pointer">
            {item.icon}
          </div>
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
