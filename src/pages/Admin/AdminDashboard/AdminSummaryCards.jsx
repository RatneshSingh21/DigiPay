import {
  FaUserFriends,
  FaMoneyCheckAlt,
  FaClock,
  FaHandHoldingUsd,
} from "react-icons/fa";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AdminSummaryCards = () => {
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    totalSalaryPaid: 0,
    otPaid: 0,
    pfPaid: 0,
    esiPaid: 0,
  });

  const currentMonth = new Date().getMonth() + 1; // e.g. 10 for October

  // 🧾 Fetch employees (to show count)
  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("/Employee");
      setEmployees(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // 💰 Fetch salary summary for current month
  const fetchSalarySummary = async () => {
    try {
      const response = await axiosInstance.get(`/Salary/month/${currentMonth}`);
      const salaries = response.data?.data || [];

      // 🔢 Calculate totals (OT calculated as rate × hours if amount missing)
      const totalSalaryPaid = salaries.reduce(
        (sum, s) => sum + (s.netSalary || 0),
        0
      );

      const otPaid = salaries.reduce(
        (sum, s) =>
          sum +
          (s.overtimeAmount && s.overtimeAmount > 0
            ? s.overtimeAmount
            : (s.overtimeRate || 0) * (s.overtimeHours || 0)),
        0
      );

      const pfPaid = salaries.reduce((sum, s) => sum + (s.pfEmployee || 0), 0);
      const esiPaid = salaries.reduce(
        (sum, s) => sum + (s.esicEmployee || 0),
        0
      );

      setSummary({
        totalSalaryPaid,
        otPaid,
        pfPaid,
        esiPaid,
      });
    } catch (error) {
      console.error("Error fetching salary summary:", error);
      toast.error("Failed to fetch salary summary");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSalarySummary();
  }, []);

  // 🧩 Card Data
  const cards = [
    {
      label: "Total Employees",
      value: employees.length,
      diff: `+${
        employees.filter((emp) => {
          if (!emp.dateOfJoining) return false;
          const doj = new Date(emp.dateOfJoining);
          const now = new Date();
          return (
            doj.getMonth() === now.getMonth() &&
            doj.getFullYear() === now.getFullYear()
          );
        }).length
      } Joined this month`,
      icon: <FaUserFriends />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Salary Paid",
      value: `₹${summary.totalSalaryPaid.toLocaleString()}`,
      diff: "This month",
      icon: <FaMoneyCheckAlt />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "OT Amount Paid",
      value: `₹${summary.otPaid.toLocaleString()}`,
      diff: "This month",
      icon: <FaClock />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "PF & ESI Contribution",
      customContent: (
        <div className="flex flex-col gap-1 text-gray-800 text-sm font-semibold">
          <div>PF: ₹{summary.pfPaid.toLocaleString()}</div>
          <div>ESI: ₹{summary.esiPaid.toLocaleString()}</div>
        </div>
      ),
      diff: "Employer + Employee",
      icon: <FaHandHoldingUsd />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            {card.customContent ? (
              <div>{card.customContent}</div>
            ) : (
              <div className="text-2xl font-bold text-gray-800">
                {card.value}
              </div>
            )}
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white text-lg`}
            >
              {card.icon}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-500">{card.label}</div>
          <div className="text-xs font-semibold text-primary">{card.diff}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminSummaryCards;
