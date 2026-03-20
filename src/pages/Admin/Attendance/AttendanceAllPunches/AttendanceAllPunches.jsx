import React, { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AttendanceToolbar from "./AttendanceToolbar";
import DailyAttendanceTable from "./DailyAttendanceTable";
import EmployeeWiseAttendancePunches from "./EmployeeWiseData/EmployeeWiseAttendancePunches";

const AttendanceAllPunches = () => {
  const isFirstRender = useRef(true);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState("DATE"); // DATE | EMPLOYEE

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
      viewMode={viewMode}
      setViewMode={setViewMode}
    />

    {viewMode === "DATE" ? (
      <DailyAttendanceTable date={selectedDate} />
    ) : (
      <EmployeeWiseAttendancePunches />
    )}
  </div>
);
};

export default AttendanceAllPunches;