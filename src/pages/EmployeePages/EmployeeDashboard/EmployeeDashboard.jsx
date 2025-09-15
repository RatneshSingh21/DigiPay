import React, { useEffect, useState } from "react";
import SummaryCards from "./SummaryCards.jsx";
import DashboardCard from "./DashboardCard.jsx";
import TimesheetCalendar from "./TimesheetCalendar.jsx";
import UpcomingHolidays from "./UpcomingHolidays.jsx";
import useAuthStore from "../../../store/authStore.js";
import axiosInstance from "../../../axiosInstance/axiosInstance.js";
import { format } from "date-fns";

const EmployeeDashboard = () => {
  const [records, setRecords] = useState({});
  const { user } = useAuthStore();

  useEffect(() => {
    let intervalId;

    const fetchAttendance = async () => {
      try {
        const res = await axiosInstance.get("/Attendance/all");
        const attendanceData = res.data;

        // filter by logged-in employee
        const employeeRecords = attendanceData.filter(
          (a) => a.employeeId === user?.userId
        );

        // convert into calendar-friendly format
        const formatted = {};
        employeeRecords.forEach((a) => {
          const dateKey = format(new Date(a.attendanceDate), "yyyy-MM-dd");
          formatted[dateKey] = {
            hours: a.totalHours?.toFixed(2) ?? "0.0",
            status: a.status || "Absent",
          };
        });
        console.log("Formatted Records:", formatted);

        setRecords(formatted);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    if (user?.userId) {
      fetchAttendance();
      intervalId = setInterval(fetchAttendance, 2 * 60 * 1000); // refresh every 2 min
    }
    return () => clearInterval(intervalId);
  }, [user]);

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
            <TimesheetCalendar records={records} />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

// import React from "react";
// import SummaryCards from "./SummaryCards.jsx";
// import DashboardCard from "./DashboardCard.jsx";
// import TimesheetCalendar from "./TimesheetCalendar.jsx";
// import UpcomingHolidays from "./UpcomingHolidays.jsx";

// const EmployeeDashboard = () => {

//   const records = {
//     "2025-09-01": { hours: "8.10", status: "Office" },
//     "2025-09-02": { hours: "9.15", status: "Office" },
//     "2025-09-03": { hours: "8.20", status: "Office" },
//     "2025-09-04": { hours: "9.20", status: "Office" },
//     "2025-09-05": { hours: "0.0", status: "Absent" },
//     "2025-09-06": { hours: "8.55", status: "Office" },
//     "2025-09-07": { hours: "8.40", status: "Office" },
//     "2025-09-08": { hours: "8.50", status: "Office" },
//     "2025-09-09": { hours: "0.0", status: "Absent" },
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       {/* Summary */}
//       {/* <div className="mb-6">
//         <SummaryCards />
//       </div> */}

//       {/* Main Grid */}
//       <div className="grid grid-cols-12 gap-6">
//         <div className="col-span-12 xl:col-span-7 space-y-5">
//           <DashboardCard title="Employee Dashboard">
//             <SummaryCards />
//             {/* <AttendanceCalendar /> */}
//             {/* <TimesheetCalendar records={records} /> */}
//           </DashboardCard>

//           <DashboardCard title="Upcoming Holidays">
//             <UpcomingHolidays />
//           </DashboardCard>
//         </div>
//         <div className="col-span-12 xl:col-span-5">
//           <DashboardCard title="Attendance Timesheet">
//             {/* <RecentShiftLogs /> */}
//             <TimesheetCalendar records={records} />
//           </DashboardCard>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDashboard;
