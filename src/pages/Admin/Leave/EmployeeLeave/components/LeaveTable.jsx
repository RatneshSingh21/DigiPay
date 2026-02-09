import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import assets from "../../../../../assets/assets";
import ApprovalHistoryCell from "../../../../../components/ApprovalHistoryCell";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const getFinalApproval = (leave) => {
  if (!leave.approvalHistory || leave.approvalHistory.length === 0) {
    return {
      status: "Pending",
      approverName: null,
      approverType: null,
      actionDate: null,
    };
  }

  // last approval = latest decision
  return leave.approvalHistory[leave.approvalHistory.length - 1];
};

const ApprovalBadge = ({ status }) => {
  const styles = {
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

const LeaveTable = ({ leaves }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.ceil(leaves.length / pageSize);

  useEffect(() => {
    setPage(1); // Reset page when data changes
  }, [leaves, pageSize]);

  const paginatedLeaves = useMemo(() => {
    const start = (page - 1) * pageSize;
    return leaves.slice(start, start + pageSize);
  }, [leaves, page, pageSize]);

  const getStatusBadge = (leave) => {
    const statusText = (leave.statusDisplay ?? leave.status)?.toLowerCase();
    let badgeClass = "bg-gray-100 text-gray-800";

    if (statusText === "approved") badgeClass = "bg-green-100 text-green-800";
    else if (statusText === "pending")
      badgeClass = "bg-yellow-100 text-yellow-800";
    else if (statusText === "rejected") badgeClass = "bg-red-100 text-red-800";

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
        {leave.statusDisplay || leave.status}
      </span>
    );
  };

  // ================= IMPROVED EMPTY STATE =================
  if (!leaves.length)
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-10 text-gray-500 space-y-4">
        <img src={assets.NoData} className="w-52 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">
          No leave records found
        </h3>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          There are no leaves to display. You can apply for a leave or adjust
          your filters to see more results.
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-50 text-xs">
          <tr className="uppercase text-gray-500 text-center">
            <th className="px-4 py-3">S.No</th>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Leave</th>
            <th className="px-4 py-3">From</th>
            <th className="px-4 py-3">To</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Applied_On</th>
          </tr>
        </thead>

        <tbody className="text-xs">
          {paginatedLeaves.map((leave, index) => (
            <tr
              key={leave.applyLeaveId}
              className="hover:bg-gray-50 border-t border-gray-200 transition text-center"
            >
              <td className="px-4 py-3">
                {(page - 1) * pageSize + index + 1}.
              </td>
              <td className="px-4 py-3 font-medium">{leave.employeeDisplay}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{leave.leaveName}</div>
                <div className="text-xs text-gray-500">{leave.leaveCode}</div>
              </td>
              <td className="px-4 py-3">
                {format(new Date(leave.fromDate), "dd MMM yyyy")}
              </td>
              <td className="px-4 py-3">
                {format(new Date(leave.toDate), "dd MMM yyyy")}
              </td>
              <td className="px-4 py-3 max-w-xs truncate">
                {leave.reason || "-"}
              </td>
              {/* <td className="px-4 py-3">{getStatusBadge(leave)}</td> */}
              <td className="px-4 py-3">
                <ApprovalHistoryCell approvalHistory={leave.approvalHistory} />
              </td>
              <td className="px-4 py-3">
                {format(new Date(leave.createdOn), "dd MMM yyyy")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-200 rounded px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border border-gray-200 rounded cursor-pointer disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border border-gray-200 rounded cursor-pointer disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveTable;
