import React, { useEffect, useState } from "react";
import SummaryCards from "./SummaryCards.jsx";
import DashboardCard from "./DashboardCard.jsx";
import TimesheetCalendar from "./TimesheetCalendar.jsx";
import UpcomingHolidays from "./UpcomingHolidays.jsx";

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7 space-y-5">
          <DashboardCard title="Employee Dashboard">
            <SummaryCards />
          </DashboardCard>

          <DashboardCard title="Upcoming Holidays">
            <UpcomingHolidays />
          </DashboardCard>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <DashboardCard title="Attendance Timesheet">
            <TimesheetCalendar />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;