const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const StatusPill = ({ status }) => {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusPill;