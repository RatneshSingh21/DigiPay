import React, { useEffect, useState } from "react";

const LeaveBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dummy fetch instead of API
    setTimeout(() => {
      setBalances([
        { id: 1, employeeName: "Nitish Yadav", CL: 3, SL: 2, EL: 7 },
        { id: 2, employeeName: "Rahul Sharma", CL: 5, SL: 1, EL: 6 },
        { id: 3, employeeName: "Anjali Verma", CL: 2, SL: 3, EL: 8 },
      ]);
      setLoading(false);
    }, 500);

    // API Example (to be used later)
    // axiosInstance.get("/api/admin/leave-balance")
    //   .then(res => setBalances(res.data))
    //   .catch(() => toast.error("Failed to fetch leave balances"))
    //   .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Leave Balance</h2>

      <div className="bg-white shadow rounded overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">CL</th>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">EL</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{emp.employeeName}</td>
                  <td className="px-4 py-3">{emp.CL}</td>
                  <td className="px-4 py-3">{emp.SL}</td>
                  <td className="px-4 py-3">{emp.EL}</td>
                </tr>
              ))}
              {balances.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">
                    No leave balances found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaveBalance;
