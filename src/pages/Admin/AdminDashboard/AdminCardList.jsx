import React from "react";

const insights = {
  thisWeek: {
    workingDays: 5,
    absences: 3,
    overtimeHours: 12,
  },
  nextPayroll: {
    date: "30 Sep 2025",
    pendingEmployees: 4,
    estimatedExpense: "₹13.2L",
  },
};

const AdminCardList = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Payroll & Attendance Insights</h3>
        <button className="text-sm text-gray-400">Summary</button>
      </div>

      {/* This Week Section */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">This Week</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-700">
              {insights.thisWeek.workingDays}
            </p>
            <p className="text-xs text-gray-500">Working Days</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-lg font-bold text-red-700">
              {insights.thisWeek.absences}
            </p>
            <p className="text-xs text-gray-500">Absences</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-700">
              {insights.thisWeek.overtimeHours}
            </p>
            <p className="text-xs text-gray-500">Overtime Hours</p>
          </div>
        </div>
      </div>

      {/* Next Payroll Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Next Payroll</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-lg font-bold text-purple-700">
              {insights.nextPayroll.date}
            </p>
            <p className="text-xs text-gray-500">Date</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-lg font-bold text-yellow-700">
              {insights.nextPayroll.pendingEmployees}
            </p>
            <p className="text-xs text-gray-500">Pending Employees</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="text-lg font-bold text-indigo-700">
              {insights.nextPayroll.estimatedExpense}
            </p>
            <p className="text-xs text-gray-500">Estimated Expense</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCardList;
