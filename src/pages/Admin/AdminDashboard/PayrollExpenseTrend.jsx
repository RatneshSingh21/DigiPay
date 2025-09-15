import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Dummy data (replace with API later)
const data = [
  { month: "Apr", expense: 0 },
  { month: "May", expense: 0 },
  { month: "Jun", expense: 0 },
  { month: "Jul", expense: 2 },
  { month: "Aug", expense: 12.4 },
  { month: "Sep", expense: 13.6 },
];

const PayrollExpenseTrend = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Payroll Expense Trend</h3>
        <button className="text-sm text-gray-400">Last 6 Months</button>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#888888" fontSize={12} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip
              formatter={(value) => [`₹${value} Lakhs`, "Expense"]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayrollExpenseTrend;
