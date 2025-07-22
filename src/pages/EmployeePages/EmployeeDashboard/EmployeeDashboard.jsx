import React from "react";
import AttendanceCalendar from "./AttendanceCalendar.jsx";
import IncentiveChart from "./IncentiveChart.jsx";
import SummaryCards from "./SummaryCards.jsx";
import RecentShiftLogs from "./RecentShiftLogs.jsx";
import DashboardCard from "./DashboardCard.jsx";
import TimesheetCalendar from "./TimesheetCalendar.jsx";

const EmployeeDashboard = () => {
  const records = {
    "2025-07-02": { hours: "8.10", status: "Office" },
    "2025-07-03": { hours: "9.15", status: "Office" },
    "2025-07-04": { hours: "8.20", status: "Office" },
    "2025-07-05": { hours: "9.20", status: "Office" },
    "2025-07-06": { hours: "0.0", status: "Absent" },
    "2025-07-09": { hours: "8.55", status: "Office" },
    "2025-07-10": { hours: "8.40", status: "Office" },
    "2025-07-11": { hours: "0.0", status: "Leave" },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111827] p-4 lg:p-6">
      {/* Summary */}
      {/* <div className="mb-6">
        <SummaryCards />
      </div> */}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DashboardCard title="Employee Dashboard">
            <SummaryCards />
            {/* <AttendanceCalendar /> */}
            {/* <TimesheetCalendar records={records} /> */}
          </DashboardCard>

          <DashboardCard title="Incentive Overview">
            <IncentiveChart />
          </DashboardCard>
        </div>

        <DashboardCard title="Attendance Timesheet">
          {/* <RecentShiftLogs /> */}
          <TimesheetCalendar records={records} />
        </DashboardCard>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
