import React from "react";
import SummaryCards from "./SummaryCards.jsx";
import DashboardCard from "./DashboardCard.jsx";
import TimesheetCalendar from "./TimesheetCalendar.jsx";
import UpcomingHolidays from "./UpcomingHolidays.jsx";

const EmployeeDashboard = () => {
  const records = {
    "2025-07-22": { hours: "8.10", status: "Office" },
    "2025-07-23": { hours: "9.15", status: "Office" },
    "2025-07-24": { hours: "8.20", status: "Office" },
    "2025-07-25": { hours: "9.20", status: "Office" },
    "2025-07-28": { hours: "0.0", status: "Absent" },
    "2025-07-29": { hours: "8.55", status: "Office" },
    "2025-07-30": { hours: "8.40", status: "Office" },
    "2025-07-31": { hours: "0.0", status: "Leave" },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Summary */}
      {/* <div className="mb-6">
        <SummaryCards />
      </div> */}

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7 space-y-5">
          <DashboardCard title="Employee Dashboard">
            <SummaryCards />
            {/* <AttendanceCalendar /> */}
            {/* <TimesheetCalendar records={records} /> */}
          </DashboardCard>

          <DashboardCard title="Upcoming Holidays">
            <UpcomingHolidays />
          </DashboardCard>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <DashboardCard title="Attendance Timesheet">
            {/* <RecentShiftLogs /> */}
            <TimesheetCalendar records={records} />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
