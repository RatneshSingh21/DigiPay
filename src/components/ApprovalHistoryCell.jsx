import { format } from "date-fns";

const ApprovalStatusBadge = ({ status }) => {
  const styles = {
    Approved: "bg-green-100 text-green-700 border-green-300",
    Rejected: "bg-red-100 text-red-700 border-red-300",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
        styles[status] || "bg-gray-100 text-gray-600 border-gray-300"
      }`}
    >
      {status}
    </span>
  );
};

const ApprovalHistoryCell = ({ approvalHistory = [] }) => {
  if (!approvalHistory.length) {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  return (
    <div className="flex flex-col gap-2">
      {approvalHistory.map((a, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded px-2 py-1"
        >
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-gray-800">
              {a.approverName || "System"}
            </span>
            <span className="text-[10px] text-gray-500">{a.approverType}</span>
          </div>
          <div className="flex flex-col items-end">
            <ApprovalStatusBadge status={a.status} />
            {a.actionDate && (
              <span className="text-[10px] text-gray-400">
                {format(new Date(a.actionDate), "dd MMM yyyy")}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalHistoryCell;
