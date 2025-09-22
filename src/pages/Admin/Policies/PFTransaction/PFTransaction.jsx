import React, { useEffect, useState } from "react";
import { Plus, Edit } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import PFTransactionForm from "./PFTransactionForm";

const PFTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({}); // cache employeeId -> name
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

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await axiosInstance.get("/PFTransaction/all");
      const data = res.data.data || [];
      setTransactions(data);

      // fetch employee names for each employeeId
      data.forEach((t) => fetchEmployeeName(t.employeeId));
    } catch (err) {
      console.log(err);
      toast.error("Failed to load PF Transactions");
    }
  };

  // Fetch Employee by Id and cache
  const fetchEmployeeName = async (id) => {
    if (employeeMap[id]) return; // already cached
    try {
      const res = await axiosInstance.get(`/Employee/${id}`);
      const emp = res.data;
      setEmployeeMap((prev) => ({
        ...prev,
        [id]: emp.fullName || `Emp-${id}`,
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

  // Handle Submit
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

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">PF Transactions</h2>
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
          className="bg-primary text-white text-sm px-4 py-2 rounded flex items-center gap-2 hover:bg-secondary transition"
        >
          <Plus className="mr-2" size={16} /> Add Transaction
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow p-4">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Trans. ID</th>
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">Payroll Month</th>
              <th className="p-2 border">Wage Considered</th>
              <th className="p-2 border">Employee Contr.</th>
              <th className="p-2 border">Employer Contr.</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Formula</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <tr key={t.pfTransactionId} className="hover:bg-gray-50">
                  <td className="p-2 border">{t.pfTransactionId}</td>
                  <td className="p-2 border">
                    {employeeMap[t.employeeId] || "Loading..."}
                  </td>
                  <td className="p-2 border">
                    {new Date(t.payrollMonth).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">{t.wageConsidered}</td>
                  <td className="p-2 border">{t.employeeContribution}</td>
                  <td className="p-2 border">{t.employerContribution}</td>
                  <td className="p-2 border">{t.totalContribution}</td>
                  <td className="p-2 border">{t.formulaUsed}</td>
                  <td className="p-2 border">
                    <button
                      className="text-blue-600 flex items-center"
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
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  No transactions found
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
