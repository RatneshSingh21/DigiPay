import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  File,
  IndianRupee,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";


const ExpenseDocuments = () => {
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm";

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axiosInstance("/ExpenseDetails/all");
        const data = res.data.data || [];

        // Group by createdBy (employee)
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.createdBy]) acc[item.createdBy] = [];
          acc[item.createdBy].push(item);
          return acc;
        }, {});

        const uniqueIds = Object.keys(grouped);

        // Fetch employee info (name + code)
        const employeePromises = uniqueIds.map(async (id) => {
          try {
            const empRes = await axiosInstance(`/Employee/${id}`);
            return {
              id,
              name: empRes.data.fullName || "Unknown",
              employeeCode: empRes.data.employeeCode || "",
            };
          } catch {
            return { id, name: "Unknown", employeeCode: "" };
          }
        });

        const employeeData = await Promise.all(employeePromises);
        const employeeMap = employeeData.reduce((acc, emp) => {
          acc[emp.id] = emp;
          return acc;
        }, {});

        // Prepare grouped data
        const result = Object.entries(grouped).map(([empId, expenses]) => {
          const emp = employeeMap[empId] || {};
          return {
            empId,
            employeeName: emp.name,
            employeeCode: emp.employeeCode,
            totalAmount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
            expenses,
          };
        });

        setGroupedExpenses(result);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filtered = groupedExpenses.filter(
    (e) =>
      e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.expenses.some((ex) =>
        ex.expenseDetailsName?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const toggleExpand = (empId) => {
    setExpandedId((prev) => (prev === empId ? null : empId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-4 py-2 shadow-sm sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-800">
          Employee Expenses
        </h2>
        <p className="text-xs text-gray-500">
          Total Employees:{" "}
          <span className="font-medium text-gray-700">{filtered.length}</span>
        </p>
      </div>

      <div className="p-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="mt-4 sm:mt-0 flex items-center gap-2 w-full sm:w-80">
            <input
              type="text"
              placeholder="🔎 Search by employee, code, or expense head..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* No Data */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-sm">
            No expense records found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((group) => (
              <div
                key={group.empId}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Employee Summary Row */}
                <div
                  className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all"
                  onClick={() => toggleExpand(group.empId)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm capitalize">
                      {group.employeeName}
                    </span>
                    {group.employeeCode && (
                      <span className="text-gray-500 text-xs">
                        ({group.employeeCode})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-blue-600 font-medium flex items-center gap-1 text-sm">
                      <IndianRupee size={14} />
                      {group.totalAmount.toLocaleString("en-IN")}
                    </p>
                    {expandedId === group.empId ? (
                      <ChevronUp className="text-gray-500" size={18} />
                    ) : (
                      <ChevronDown className="text-gray-500" size={18} />
                    )}
                  </div>
                </div>

                {/* Expandable Details */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    expandedId === group.empId
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 border-t border-gray-100 bg-gray-50/40">
                    <div className="overflow-x-auto max-h-[30vh] overflow-y-scroll">
                      <table className="min-w-full text-xs text-center border-t border-gray-100">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700">
                            <th className="py-2 px-3">S.No</th>
                            <th className="py-2 px-3">Expense Head</th>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Amount</th>
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3">Attachment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.expenses.map((item, idx) => (
                            <tr
                              key={item.expenseDetailsId}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-2 px-3 text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 font-medium text-gray-800 capitalize">
                                {item.expenseDetailsName}
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                {new Date(item.expenseDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </td>
                              <td className="py-2 px-3 text-gray-700">
                                ₹{item.amount.toLocaleString("en-IN")}
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                {item.description || "—"}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {item.filePath ? (
                                  <div className="flex items-center justify-center gap-3">
                                    <a
                                      href={item.filePath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800"
                                    >
                                      <File size={14} /> View
                                    </a>

                                    <button
                                      onClick={async () => {
                                        try {
                                          const response =
                                            await axiosInstance.get(
                                              item.filePath,
                                              {
                                                responseType: "blob",
                                              }
                                            );
                                          const blob = new Blob([
                                            response.data,
                                          ]);
                                          const url =
                                            window.URL.createObjectURL(blob);
                                          const link =
                                            document.createElement("a");
                                          link.href = url;
                                          link.download = item.filePath
                                            .split("/")
                                            .pop();
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          window.URL.revokeObjectURL(url);
                                        } catch (error) {
                                          console.error(
                                            "Download failed:",
                                            error
                                          );
                                          alert("⚠️ Failed to download file.");
                                        }
                                      }}
                                      className="inline-flex cursor-pointer items-center justify-center gap-1 text-green-600 hover:text-green-800"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                        />
                                      </svg>
                                      Download
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-xs flex justify-center">
                                    No file
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDocuments;
