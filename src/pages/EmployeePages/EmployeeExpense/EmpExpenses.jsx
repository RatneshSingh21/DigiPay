import React, { useEffect, useState } from "react";
import { FaPlus, FaFileInvoiceDollar, FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";

import EmpExpensesForm from "./EmpExpensesForm";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmpExpenses = () => {
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const employeeId = useAuthStore((state) => state.user?.userId);

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/ExpenseDetails/by-employee/${employeeId}`);
      if (res.data?.data) {
        setExpenses(res.data.data || []);
      }
      console.log(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ||"Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-2 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-lg sm:text-xl text-gray-800">
          Expense Details
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary cursor-pointer text-sm flex items-center gap-2"
        >
          <FaPlus /> Add Expense
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : expenses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.map((exp, i) => (
            <div
              key={exp.expenseDetailsId || i}
              className="m-4 rounded-lg shadow-sm bg-white hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-3">
                <FaFileInvoiceDollar className="text-primary text-2xl" />
                <h3 className="font-semibold text-gray-800 truncate">
                  {exp.expenseDetailsName || "Unnamed Expense"}
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                <strong>Amount:</strong> ₹{exp.amount || 0}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                <strong>Date:</strong>{" "}
                {exp.expenseDate
                  ? new Date(exp.expenseDate).toLocaleDateString()
                  : "N/A"}
              </p>

              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {exp.description || "No description."}
              </p>

              <div className="flex justify-between items-center mt-auto">
                {exp.filePath && (
                  <a
                    href={exp.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary text-sm hover:text-secondary"
                  >
                    <FaDownload /> View File
                  </a>
                )}
                <span className="text-xs text-gray-500">
                  DOC ID: {exp.expenseDetailsId}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          No expenses found.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <EmpExpensesForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchExpenses}
        />
      )}
    </div>
  );
};

export default EmpExpenses;
