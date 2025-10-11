import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const PayrollExpenseTrend = () => {
  const [data, setData] = useState([]);

  // 🔹 Get last 6 months (name + month number)
  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        num: d.getMonth() + 1, // month number for API
      });
    }
    return months;
  };

  const fetchPayrollTrend = async () => {
    try {
      const months = getLast6Months();
      const promises = months.map((m) =>
        axiosInstance.get(`/Salary/month/${m.num}`)
      );

      // Fetch all months in parallel
      const responses = await Promise.allSettled(promises);

      const chartData = responses.map((res, idx) => {
        if (res.status === "fulfilled") {
          const salaries = res.value.data?.data || [];
          const totalNetSalary = salaries.reduce(
            (sum, s) => sum + (s.netSalary || 0),
            0
          );
          // Convert to Lakhs for chart
          return {
            month: months[idx].name,
            expense: totalNetSalary / 100000,
          };
        } else {
          return {
            month: months[idx].name,
            expense: 0,
          };
        }
      });

      setData(chartData);
    } catch (error) {
      console.error("Error fetching payroll trend:", error);
      toast.error("Failed to load payroll expense trend");
    }
  };

  useEffect(() => {
    fetchPayrollTrend();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Payroll Expense Trend</h3>
        <button className="text-sm cursor-pointer text-gray-400">
          Last 6 Months
        </button>
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
              formatter={(value) => [`₹${value.toFixed(2)} Lakhs`, "Expense"]}
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
