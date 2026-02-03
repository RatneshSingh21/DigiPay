import React, { useEffect, useState } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { format } from "date-fns";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";
import { toast } from "react-toastify";
import EmployeeAdvancePaymentForm from "./EmployeeAdvancePaymentForm";
import assets from "../../../../assets/assets";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


const EmployeeAdvancePayments = () => {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ===============================
     FETCH DATA
  =============================== */
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/AdvancePayment");
      setPayments(res.data?.data || []);
    } catch (err) {
      console.error(err);
      // toast.error("Failed to fetch advance payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch {
      toast.error("Failed to fetch employees");
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      setStatuses(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch status master");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayments();
    fetchStatuses();
  }, []);

  /* ===============================
     HELPERS
  =============================== */
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : "Unknown Employee";
  };

  const getStatusBadge = (statusId, isFullyRepaid) => {
    if (isFullyRepaid) {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
          Fully Repaid
        </span>
      );
    }

    const status = statuses.find((s) => s.statusId === statusId);
    if (!status) {
      return (
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
          Unknown
        </span>
      );
    }

    // Color based on statusName
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";

    switch (status.statusName.toLowerCase()) {
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "approved":
      case "processed":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "rejected":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "paid":
      case "partial":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
    }

    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded text-xs`}>
        {status.statusName}
      </span>
    );
  };

  const filteredPayments = payments.filter((p) =>
    getEmployeeName(p.employeeId)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  /* ===============================
     UI
  =============================== */
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="font-semibold text-lg">
          Employee Advance Payment Management
        </h2>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by employee name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:ring-1 focus:ring-primary outline-none`}
          />

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 cursor-pointer bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition"
          >
            <FiPlus /> Apply Advance
          </button>
        </div>
      </div>

      {/* TABLE / STATES */}
      <div className="bg-white rounded-xl shadow overflow-x-auto px-2">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Spinner />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <img src={assets.NoData} className="w-52 mb-4" />
            <h3 className="font-semibold text-lg">No Advance Payments Found</h3>

            <button
              onClick={fetchPayments}
              className="mt-4 flex items-center cursor-pointer gap-2 bg-primary text-white px-6 py-2 rounded-full"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        ) : (
          <table className="w-full text-sm text-center text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Balance</th>
                <th className="px-4 py-2">Installments</th>
                <th className="px-4 py-2">Repayment</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Applied On</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((p, i) => (
                <tr
                  key={p.advancePaymentId}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{i + 1}.</td>

                  <td className="px-4 py-2 font-medium">
                    {getEmployeeName(p.employeeId)}
                  </td>

                  <td className="px-4 py-2 font-semibold">
                    ₹{p.advancePaymentAmount}
                    <div className="text-xs text-gray-500">
                      EMI ₹{p.installmentAmount}
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    ₹{p.balanceAmount}
                    <div className="text-xs text-gray-500">
                      Repaid ₹{p.amountRepaid}
                    </div>
                  </td>

                  <td className="px-4 py-2">{p.noOfInstallments}</td>

                  <td className="px-4 py-2">{p.repaymentMode}</td>

                  <td className="px-4 py-2">
                    {getStatusBadge(p.statusId, p.isFullyRepaid)}
                  </td>

                  <td className="px-4 py-2">
                    {format(new Date(p.createdOn), "dd-MMM-yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <EmployeeAdvancePaymentForm
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              fetchPayments();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeAdvancePayments;
