import React, { useEffect, useState } from "react";
import {
  getAllESITransactions,
  getAllEmployees,
  exportESITransactions,
} from "../../../../../services/esiService";
import Spinner from "../../../../../components/Spinner";
import { format } from "date-fns";
import AddESITransactionsForm from "./ESITransactionsForm";
import { Plus } from "lucide-react";

const ESITransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleExport = async () => {
    try {
      const response = await exportESITransactions(month, year);
      const blob = new Blob([response.data], {
        type:
          response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const contentDisposition =
        response.headers?.["content-disposition"] || "";
      let filename = `ESI_Statement_${month}_${year}.xlsx`;
      const match =
        contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/) ||
        contentDisposition.match(/filename=([^;\n]+)/);
      if (match && match[1]) {
        try {
          filename = decodeURIComponent(match[1].replace(/\"/g, "").trim());
        } catch (_) {
          filename = match[1].replace(/\"/g, "").trim();
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export ESI transactions:", error);
    }
  };

  // Fetch Transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getAllESITransactions();
      if (response.data.status) {
        setTransactions(response.data.data);
      } else {
        console.error("Failed to fetch transactions:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployees();
      if (response.status === 200) {
        setEmployees(response.data);

        // Create map {id: fullName}
        const map = {};
        response.data.forEach((emp) => {
          map[emp.id] = `${emp.fullName} (${emp.employeeCode})`;
        });
        setEmployeeMap(map);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [showAll]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">ESI Transactions</h2>
        <div className="flex gap-2 items-center">
          <select
            className="shadow border rounded px-2 py-1 text-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="border rounded px-2 py-1 w-24 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <button
            onClick={handleExport}
            className="bg-green-600 text-white text-sm cursor-pointer px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition"
          >
            Generate ESi File
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2" size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto shadow rounded-lg px-3">
        <table className="min-w-full divide-y text-xs divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 text-center">
            <tr>
              <th className="px-2 py-2">S.No</th>
              <th className="px-2 py-2">Employee</th>
              <th className="px-2 py-2">Rule ID</th>
              <th className="px-2 py-2">Month</th>
              <th className="px-2 py-2">Year</th>
              <th className="px-2 py-2">ESI No.</th>
              <th className="px-2 py-2">Dept.</th>
              <th className="px-2 py-2">Pay Days</th>
              <th className="px-2 py-2">ESI Wages</th>
              <th className="px-2 py-2">Employee Contri.</th>
              <th className="px-2 py-2">Employer Contri.</th>
              <th className="px-2 py-2">Total Contri.</th>
              {/* <th className="px-2 py-2">Created At</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {transactions.length > 0 ? (
              transactions.map((txn,index) => (
                <tr key={txn.contributionId} className="hover:bg-gray-50">
                  <td className="px-2 py-2">{index+1}</td>
                  <td className="px-2 py-2">
                    {employeeMap[txn.employeeId] || `ID: ${txn.employeeId}`}
                  </td>
                  <td className="px-2 py-2">{txn.ruleId}</td>
                  <td className="px-2 py-2">{txn.month}</td>
                  <td className="px-2 py-2">{txn.year}</td>
                  <td className="px-2 py-2">
                    {txn.esiNumber ? txn.esiNumber : "-"}
                  </td>
                  <td className="px-2 py-2">
                    {txn.department ? txn.department : "-"}
                  </td>
                  <td className="px-2 py-2">{txn.payDays}</td>
                  <td className="px-2 py-2">{txn.esiWages}</td>
                  <td className="px-2 py-2">{txn.employeeContribution}</td>
                  <td className="px-2 py-2">{txn.employerContribution}</td>
                  <td className="px-2 py-2">{txn.totalContribution}</td>
                  {/* <td className="px-2 py-2">
                    {txn.createdAt ? format(new Date(txn.createdAt), "dd/MM/yyyy") : "-"}
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="12"
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      <AddESITransactionsForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </>
  );
};

export default ESITransactions;
