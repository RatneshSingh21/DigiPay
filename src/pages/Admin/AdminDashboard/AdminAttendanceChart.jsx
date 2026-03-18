import React, { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  Present: "#16a34a",
  Absent: "#dc2626",
  "Missing IN": "#f97316",
  "Missing OUT": "#eab308",
};

const AdminAttendanceChart = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        "/DailyAttendanceStatus/date",
        {
          params: { date },
        }
      );

      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = useCallback(async () => {
    try {
      await axiosInstance.post(`/DailyAttendanceStatus/generate?date=${date}`);
      // optional toast
      // toast.success("Attendance generated successfully");
    } catch (err) {
      console.error("Attendance generation error:", err);
    }
  }, [date]);

  useEffect(() => {
    if (!date) return;

    const timeout = setTimeout(async () => {
      await handleSync();
      await fetchAttendance();
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [date, handleSync]);

  const chartData = useMemo(() => {
    if (!data.length) {
      return [
        { name: "Present", value: 0 },
        { name: "Absent", value: 0 },
        { name: "Missing IN", value: 0 },
        { name: "Missing OUT", value: 0 },
      ];
    }

    let present = 0;
    let absent = 0;
    let missingIn = 0;
    let missingOut = 0;

    data.forEach((r) => {
      if (r.isHoliday || r.isWeekend || r.isOnLeave) return;

      if (r.isAbsent) {
        absent++;
      }
      else if (r.hasInPunch && r.hasOutPunch) {
        present++;
      }
      else if (!r.hasInPunch && r.hasOutPunch) {
        missingIn++;
      }
      else if (r.hasInPunch && !r.hasOutPunch) {
        missingOut++;
      }
      else {
        absent++;
      }
    });

    return [
      { name: "Present", value: present },
      { name: "Absent", value: absent },
      { name: "Missing IN", value: missingIn },
      { name: "Missing OUT", value: missingOut },
    ];
  }, [data]);

  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="bg-white rounded-lg shadow p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Daily Attendance Report</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded py-1 border border-gray-300 px-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : total === 0 ? (
        /* ===== EMPTY STATE ===== */
        <div className="h-72 flex flex-col items-center justify-center text-gray-500">
          <p className="text-sm font-medium">No attendance data found</p>
          <p className="text-xs mt-1">
            There are no records available for this date.
          </p>
        </div>
      ) : (
        <>
          {/* ===== DONUT CHART ===== */}
          <div className="relative h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  label={({ percent, value }) =>
                    `${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* ===== CENTER TOTAL ===== */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-gray-500">Employees</p>
            </div>
          </div>

          {/* ===== CHIP LEGEND ===== */}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {chartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${COLORS[item.name]}20`,
                  color: COLORS[item.name],
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[item.name] }}
                ></span>
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAttendanceChart;
