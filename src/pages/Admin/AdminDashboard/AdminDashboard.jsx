import AdminAttendance from "./AdminAttendance";
import AdminSchedule from "./AdminSchedule";
import AdminSummaryCards from "./AdminSummaryCards";
import PayrollExpenseTrend from "./PayrollExpenseTrend";
import AdminAttendanceChart from "./AdminAttendanceChart";


const AdminDashboard = () => {
  return (
    <div className="p-4 space-y-6">
      {/* TOP SUMMARY */}
      <AdminSummaryCards />

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          <AdminAttendance />
          <PayrollExpenseTrend />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          <AdminAttendanceChart />
          <AdminSchedule />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
