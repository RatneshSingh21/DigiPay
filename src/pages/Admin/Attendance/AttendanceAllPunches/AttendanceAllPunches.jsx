import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AttendanceToolbar from "./AttendanceToolbar";
import DailyAttendanceTable from "./DailyAttendanceTable";

const AttendanceAllPunches = () => {
  const [selectedDate, setSelectedDate] = useState("2026-01-01");

  const handleSync = async () => {
    try {
      await axiosInstance.post(
        `/DailyAttendanceStatus/generate?date=${selectedDate}`,
      );
      toast.success("Attendance generated successfully");
    } catch (err) {
      console.error("Attendance generation error:", err);
      toast.error("Attendance generation failed");
    }
  };

  return (
    <div className="min-h-screen space-y-2">
      <AttendanceToolbar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onSync={handleSync}
      />

      <DailyAttendanceTable date={selectedDate} />
    </div>
  );
};

export default AttendanceAllPunches;
