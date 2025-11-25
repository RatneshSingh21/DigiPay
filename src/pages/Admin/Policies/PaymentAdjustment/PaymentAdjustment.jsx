import React, { useEffect, useState } from "react";
import { FiEdit2, FiRefreshCw } from "react-icons/fi";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";
import PaymentAdjustmentForm from "./PaymentAdjustmentForm";

export default function PaymentAdjustment() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState("Add");
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/PaymentAdjustment/getAll");
      if (Array.isArray(res.data.data)) {
        setAdjustments(res.data.data);
      } else {
        setAdjustments([]);
      }
    } catch (error) {
      console.error("Error fetching payment adjustments:", error);
      toast.error("Failed to fetch payment adjustments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    fetchData();
    setIsEdit("Add");
    setSelectedAdjustment(null);
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Payment Adjustments</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition cursor-pointer"
          >
            <FiRefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-secondary text-white text-sm px-3 py-2 rounded-lg transition cursor-pointer"
          >
            <Plus size={16} /> Add Adjustment
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto shadow rounded-lg bg-white">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : adjustments.length > 0 ? (
          <table className="min-w-full divide-y text-xs divide-gray-200">
            <thead className="bg-gray-100 text-gray-700 text-center">
              <tr>
                <th className="py-2 px-3">S.No</th>
                <th className="py-2 px-3">Payment Type</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">Formula</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Effective From</th>
                <th className="py-2 px-3">Effective To</th>
                <th className="py-2 px-3">Taxable</th>
                <th className="py-2 px-3">Recurring</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-center">
              {adjustments.map((item, index) => (
                <tr
                  key={item.paymentAdjustmentId}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3">{item.paymentType}</td>
                  <td className="py-2 px-3">{item.description}</td>
                  <td className="py-2 px-3">{item.calculationFormula}</td>
                  <td className="py-2 px-3">{item.maxAllowedAmount}</td>
                  <td className="py-2 px-3">
                    {item.effectiveFrom?.split("T")[0]}
                  </td>
                  <td className="py-2 px-3">
                    {item.effectiveTo?.split("T")[0]}
                  </td>
                  <td className="py-2 px-3">{item.isTaxable ? "Yes" : "No"}</td>
                  <td className="py-2 px-3">
                    {item.isRecurring ? "Yes" : "No"}
                  </td>
                  <td>
                    <button
                      className="p-2 cursor-pointer bg-gray-100 rounded-full hover:bg-teal-100 transition"
                      onClick={() => {
                        setIsEdit("Edit");
                        setSelectedAdjustment(item);
                        setShowForm(true);
                      }}
                      title="Edit Adjustment"
                    >
                      <FiEdit2 size={16} className="text-teal-700" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No payment adjustments found.
          </p>
        )}
      </div>

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[600px] relative shadow-lg animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500  cursor-pointer"
            >
              <X size={20} />
            </button>
            <PaymentAdjustmentForm
              onClose={() => setShowForm(false)}
              onSuccess={handleSuccess}
              isEdit={isEdit}
              initialData={selectedAdjustment}
            />
          </div>
        </div>
      )}
    </>
  );
}
