import {
  FaUserFriends,
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaWallet,
} from "react-icons/fa";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { useEffect, useState } from "react";

const cards = [
  // {
  //   label: "Total Employees",
  //   value: 46,
  //   diff: "+10 this month",
  //   icon: <FaUserFriends />,
  //   color: "from-blue-500 to-blue-600",
  // },
  {
    label: "Pending Payrolls",
    value: 4,
    diff: "2 due this week",
    icon: <FaMoneyCheckAlt />,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    label: "Processed Payrolls",
    value: 42,
    diff: "+5 this month",
    icon: <FaCheckCircle />,
    color: "from-green-500 to-green-600",
  },
  {
    label: "Payroll Expense",
    value: "₹12.5L",
    diff: "↑ ₹1.2L from last month",
    icon: <FaWallet />,
    color: "from-purple-500 to-purple-600",
  },
];

const AdminSummaryCards = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch employee data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Employee");
      setEmployees(response.data?.data || response.data || []);
      console.log("Fetched employees:", response.data);
      
    } catch (error) {
      console.error("Error fetching employee data:", error);

      if (error.response?.status === 403) {
        toast.error("You don't have permission to view employees.");
      } else {
        toast.error(
          error?.response?.data?.message || "Error fetching employee data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const employeeCard = {
  label: "Total Employees",
  value: employees.length,
  diff: `+${employees.filter(emp => {
    if (!emp.dateOfJoining) return false;
    const doj = new Date(emp.dateOfJoining);
    const now = new Date();
    return doj.getMonth() === now.getMonth() && doj.getFullYear() === now.getFullYear();
  }).length} Joined this month`,
  icon: <FaUserFriends />,
  color: "from-blue-500 to-blue-600",
};

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
          className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold text-gray-800">{employeeCard.value}</div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${employeeCard.color} text-white text-lg`}
            >
              {employeeCard.icon}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-500">{employeeCard.label}</div>
          <div className="text-xs font-semibold text-primary">{employeeCard.diff}</div>
        </div>
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold text-gray-800">{card.value}</div>
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
