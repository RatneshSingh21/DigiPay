import React, { useEffect, useState } from "react";
import { Plus, Edit, FileDown, Inbox } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import PFTransactionForm from "./PFTransactionForm";

const PFTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    payrollMonth: "",
    wageConsidered: "",
    employeeContribution: "",
    employerContribution: "",
    formulaUsed: "",
    transactionStatusId: "",
    processedAt: "",
  });

  const [selectedMonth, setSelectedMonth] = useState("");

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await axiosInstance.get("/PFTransaction/all");
      const data = res.data.data || [];
      setTransactions(data);

      data.forEach((t) => fetchEmployeeName(t.employeeId));
    } catch (err) {
      console.log(err);
      toast.error("Failed to load PF Transactions");
    }
  };

  // Fetch Employee by Id and cache
  const fetchEmployeeName = async (id) => {
    if (employeeMap[id]) return;
    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res.data.data;
      setEmployeeMap((prev) => ({
        ...prev,
        [id]: `${emp.fullName} (${emp.employeeCode})` || `Emp-${id}`,
      }));
    } catch (err) {
      console.log("Failed to fetch employee", err);
      setEmployeeMap((prev) => ({
        ...prev,
        [id]: `Emp-${id}`,
      }));
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle Submit (Create/Update)
  const handleSubmit = async (data) => {
    try {
      if (editId) {
        await axiosInstance.put(`/PFTransaction/update`, {
          ...data,
          pfTransactionId: editId,
        });
        toast.success("PF Transaction updated successfully!");
      } else {
        await axiosInstance.post(`/PFTransaction/create`, {
          employeeId: data.employeeId,
          payrollMonth: data.payrollMonth,
        });
        toast.success("PF Transaction created successfully!");
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Error saving transaction");
    }
  };

  // Generate PF File
  const handleGenerateFile = async () => {
    if (!selectedMonth) {
      toast.warning("Please select a payroll month first.");
      return;
    }

    try {
      // Convert "YYYY-MM" from input type="month" to "YYYY-MM-01"
      const formattedMonth = `${selectedMonth}-01`;

      const response = await axiosInstance.get(
        `/PFTransaction/generate-file?payrollMonth=${formattedMonth}`,
        {
          responseType: "blob",
        }
      );

      // Check for empty/error response
      if (response.data.type.includes("application/json")) {
        const text = await response.data.text();
        const result = JSON.parse(text);
        toast.error(result.message || "No PF transactions found.");
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PF_Transactions_${formattedMonth}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("PF file generated successfully!");
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message ||
          "No PF transactions found for the selected month."
      );
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-xl font-bold">PF Transactions</h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Payroll Month Selector */}
          <div className="relative">
            {!selectedMonth && (
              <span className="absolute left-3 top-[10px] text-gray-400 font-bold pointer-events-none text-sm">
                Select Month
              </span>
            )}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-2 py-1 text-sm rounded-md h-[38px] w-full relative"
            />
          </div>

          {/* Generate File Button */}
          <button
            onClick={handleGenerateFile}
            className="bg-green-600 text-white text-sm cursor-pointer px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition"
          >
            <FileDown size={16} /> Generate PF File
          </button>

          {/* Add New Transaction */}
          <button
            onClick={() => {
              setEditId(null);
              setFormData({
                employeeId: "",
                payrollMonth: "",
                wageConsidered: "",
                employeeContribution: "",
                employerContribution: "",
                formulaUsed: "",
                transactionStatusId: "",
                processedAt: "",
              });
              setIsModalOpen(true);
            }}
            className="bg-primary text-white text-sm cursor-pointer px-3 py-2 rounded flex items-center gap-2 hover:bg-secondary transition"
          >
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg px-3">
        <table className="min-w-full divide-y text-xs divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 text-center">
            <tr>
              <th className="p-2">Trans. ID</th>
              <th className="p-2">Employee</th>
              <th className="p-2">Payroll Month</th>
              <th className="p-2">Wage Considered</th>
              <th className="p-2">Employee Contr.</th>
              <th className="p-2">Employer Contr.</th>
              <th className="p-2">Total</th>
              <th className="p-2">Formula</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <React.Fragment key={t.pfTransactionId}>
                  {/* Main Transaction Row */}
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">{t.pfTransactionId}</td>
                    <td className="p-2">
                      {employeeMap[t.employeeId] || "Loading..."}
                    </td>
                    <td className="p-2">
                      {new Date(t.payrollMonth).toLocaleDateString("en-Gb")}
                    </td>
                    <td className="p-2">{t.wageConsidered}</td>
                    <td className="p-2">{t.employeeContribution}</td>
                    <td className="p-2">{t.employerContribution}</td>
                    <td className="p-2">{t.totalContribution}</td>
                    <td className="p-2">{t.formulaUsed}</td>
                    <td className="p-2">
                      <button
                        className="text-blue-600 cursor-pointer flex items-center mx-auto"
                        onClick={() => {
                          setFormData({
                            employeeId: t.employeeId,
                            payrollMonth: t.payrollMonth?.split("T")[0],
                            wageConsidered: t.wageConsidered,
                            employeeContribution: t.employeeContribution,
                            employerContribution: t.employerContribution,
                            formulaUsed: t.formulaUsed,
                            transactionStatusId: t.transactionStatusId,
                            processedAt: t.processedAt,
                          });
                          setEditId(t.pfTransactionId);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit size={16} className="mr-1" /> Edit
                      </button>
                    </td>
                  </tr>

                  {/* ContributionsByAccount Row */}
                  {t.contributionsByAccount?.length > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan="9" className="p-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 shadow-sm">
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                            Contributions by Account
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {t.contributionsByAccount.map((c, i) => (
                              <div
                                key={i}
                                className="bg-white border rounded-md p-2 flex flex-col items-center justify-center shadow-sm min-w-[120px]"
                              >
                                <span className="font-medium text-gray-800 mb-1 text-sm">
                                  Account Type : {c.accountCode}
                                </span>
                                <div className="flex justify-between gap-2 w-full text-xs text-gray-600">
                                  <span>
                                    Employee Share: ₹
                                    {c.employeeShare.toFixed(2)}
                                  </span>
                                  ||
                                  <span>
                                    Employer Share: ₹
                                    {c.employerShare.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="9">
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <Inbox size={44} className="text-gray-400" />
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      No PF Transactions Found
                    </p>

                    <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
                      No PF transactions are available yet. Select a payroll
                      month or add a new transaction to get started.
                    </p>

                    {/* Optional CTA */}
                    <button
                      onClick={() => {
                        setEditId(null);
                        setFormData({
                          employeeId: "",
                          payrollMonth: "",
                          wageConsidered: "",
                          employeeContribution: "",
                          employerContribution: "",
                          formulaUsed: "",
                          transactionStatusId: "",
                          processedAt: "",
                        });
                        setIsModalOpen(true);
                      }}
                      className="mt-4 flex items-center cursor-pointer gap-1 bg-primary hover:bg-secondary text-white px-4 py-2 rounded text-xs"
                    >
                      <Plus size={14} /> Add Transaction
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <PFTransactionForm
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          editId={editId}
        />
      )}
    </>
  );
};

export default PFTransaction;
