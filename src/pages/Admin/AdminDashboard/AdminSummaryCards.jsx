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
  },
  {
    label: "Pending Payrolls",
    value: 4,
    diff: "2 due this week",
    icon: <FaMoneyCheckAlt />,
  },
  {
    label: "Processed Payrolls",
    value: 42,
    diff: "+5 this month",
    icon: <FaCheckCircle />,
  },
  {
    label: "Payroll Expense",
    value: "₹12.5L",
    diff: "↑ ₹1.2L from last month",
    icon: <FaWallet />,
  },
];

const AdminSummaryCards = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <div className="text-2xl font-semibold">{card.value}</div>
            <div className="text-gray-400 text-xl">{card.icon}</div>
          </div>
          <div className="text-sm text-gray-500">{card.label}</div>
          <div className="text-xs text-primary">{card.diff}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminSummaryCards;
