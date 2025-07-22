import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Tooltip as ReactTooltip } from "react-tooltip";
import ApplyLeaveModal from "./ApplyLeaveModal";

import "react-tooltip/dist/react-tooltip.css";

const AttendanceCalendar = () => {
  const calendarRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleMonthChange = (e) => {
    const calendarApi = calendarRef.current.getApi();
    const newMonthIndex = parseInt(e.target.value);
    const newDate = new Date(calendarApi.getDate().getFullYear(), newMonthIndex, 1);
    calendarApi.gotoDate(newDate);
    setCurrentMonth(newMonthIndex);
  };

  useEffect(() => {
    const current = new Date().getMonth();
    setCurrentMonth(current);
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const events = [
    {
      id: "1",
      title: "Present",
      date: "2025-07-01",
      backgroundColor: "#10b981",
      extendedProps: {
        inTime: "09:00 AM",
        outTime: "06:00 PM",
        overtime: "0 hrs",
        status: "Present",
      },
    },
    {
      id: "2",
      title: "Absent",
      date: "2025-07-02",
      backgroundColor: "#ef4444",
      extendedProps: {
        inTime: "-",
        outTime: "-",
        overtime: "-",
        status: "Absent",
      },
    },
    {
      id: "3",
      title: "Half Day",
      date: "2025-07-03",
      backgroundColor: "#f59e0b",
      extendedProps: {
        inTime: "10:00 AM",
        outTime: "02:00 PM",
        overtime: "0 hrs",
        status: "Half Day",
      },
    },
    {
      id: "4",
      title: "Overtime",
      date: "2025-07-04",
      backgroundColor: "#3b82f6",
      extendedProps: {
        inTime: "09:00 AM",
        outTime: "07:00 PM",
        overtime: "2 hrs",
        status: "Present + OT",
      },
    },
  ];

  const renderEventContent = (eventInfo) => {
    const { inTime, outTime, overtime, status } = eventInfo.event.extendedProps;

    return (
      <>
        <div
          data-tooltip-id={`tooltip-${eventInfo.event.id}`}
          className="text-[10px] px-1 py-0.5 rounded text-white cursor-pointer"
        >
          {eventInfo.event.title}
        </div>
        <ReactTooltip id={`tooltip-${eventInfo.event.id}`} place="top" effect="solid">
          <div className="text-left text-xs leading-snug">
            <div><strong>Status:</strong> {status}</div>
            <div><strong>In Time:</strong> {inTime}</div>
            <div><strong>Out Time:</strong> {outTime}</div>
            <div><strong>Overtime:</strong> {overtime}</div>
          </div>
        </ReactTooltip>
      </>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Attendance Calendar</h2>

        <select
          value={currentMonth}
          onChange={handleMonthChange}
          className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-white"
        >
          {months.map((month, idx) => (
            <option key={idx} value={idx}>{month}</option>
          ))}
        </select>
      </div>

      <div className="text-[12px]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventContent={renderEventContent}
          headerToolbar={false}
          height="auto"
          fixedWeekCount={false}
          dayMaxEventRows={2}
          eventDisplay="block"
          dayCellClassNames={({ date }) => {
            const today = new Date();
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            return isToday ? "bg-blue-100 dark:bg-blue-800" : "";
          }}
        />
      </div>

      {/* Leave Modal */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default AttendanceCalendar;
