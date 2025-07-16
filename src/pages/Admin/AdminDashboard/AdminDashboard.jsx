import AdminAttendance from "./AdminAttendance";
import AdminCardList from "./AdminCardList";
import AdminSchedule from "./AdminSchedule";
import AdminSummaryCards from "./AdminSummaryCards";

const AdminDashboard = () => {
  return (
    <div className="p-4 space-y-6">
      <AdminSummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminAttendance />
          <AdminCardList />
        </div>
        <AdminSchedule />
      </div>
    </div>
  );
};

export default AdminDashboard;
