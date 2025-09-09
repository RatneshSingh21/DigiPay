import {
  FaUserFriends,
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaWallet,
} from "react-icons/fa";

const cards = [
  {
    label: "Total Employees",
    value: 46,
    diff: "+10 this month",
    icon: <FaUserFriends />,
    color: "from-blue-500 to-blue-600",
  },
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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
