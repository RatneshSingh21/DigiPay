import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
} from "recharts";

const data = [
  { month: "Jan", incentive: 500 },
  { month: "Feb", incentive: 750 },
  { month: "Mar", incentive: 600 },
  { month: "Apr", incentive: 800 },
  { month: "May", incentive: 650 },
  { month: "Jun", incentive: 900 },
  { month: "Jul", incentive: 720 },
];

const IncentiveChart = () => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6">
        Incentives Chart (Monthly Overview)
      </h3>
      <div className="h-56 sm:h-64 md:h-72 ">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }}>
              <Label value="Month" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis tick={{ fontSize: 12 }}>
              <Label
                value="Incentive (₹)"
                angle={-90}
                position="insideLeft"
                offset={10}
              />
            </YAxis>
            <Tooltip
              contentStyle={{ backgroundColor: "#ffffff", borderRadius: "6px" }}
              labelStyle={{ fontSize: "12px" }}
              itemStyle={{ fontSize: "12px" }}
            />
            <Bar
              dataKey="incentive"
              fill="#4f46e5"
              radius={[6, 6, 0, 0]}
              className="dark:fill-indigo-400"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncentiveChart;
