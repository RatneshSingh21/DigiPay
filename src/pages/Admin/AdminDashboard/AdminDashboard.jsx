import AdminAttendance from "./AdminAttendance";
import AdminSchedule from "./AdminSchedule";
import AdminSummaryCards from "./AdminSummaryCards";
import PayrollExpenseTrend from "./PayrollExpenseTrend";

const AdminDashboard = () => {
  return (
    <div className="p-4 space-y-6">
      <AdminSummaryCards />

      {/* FIXED GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6 lg:col-span-2">
          <AdminAttendance />
          <PayrollExpenseTrend />
        </div>

        <AdminSchedule />
      </div>
    </div>
  );
};

export default AdminDashboard;
