import React, { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AttendanceToolbar from "./AttendanceToolbar";
import DailyAttendanceTable from "./DailyAttendanceTable";

const AttendanceAllPunches = () => {
  const isFirstRender = useRef(true);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const handleSync = useCallback(async () => {
    try {
      await axiosInstance.post(
        `/DailyAttendanceStatus/generate?date=${selectedDate}`,
      );
      toast.success("Attendance generated successfully");
    } catch (err) {
      console.error("Attendance generation error:", err);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    handleSync();
  }, [selectedDate]);

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