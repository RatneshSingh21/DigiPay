import React, { useEffect, useState } from "react";
import { FiEdit2, FiRefreshCw } from "react-icons/fi";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";
import PaymentAdjustmentForm from "./PaymentAdjustmentForm";
import assets from "../../../../assets/assets"; // make sure dummy illustration exists

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
      setAdjustments(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error(error);
      // toast.error("Failed to load payment adjustments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    setIsEdit("Add");
    setSelectedAdjustment(null);
    fetchData();
  };

  return (
    <>
      {/* HEADER */}
      <div className="px-4 py-3 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-xl">Payment Adjustments</h2>
          <p className="text-xs text-gray-500">
            Control how extra earnings or deductions are applied to salary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border cursor-pointer"
          >
            <FiRefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-secondary text-white text-sm px-3 py-2 rounded-lg cursor-pointer"
          >
            <Plus size={16} /> Add Adjustment
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : adjustments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {adjustments.map((item) => {
            const isDeduction =
              item.paymentCalculationType?.toLowerCase() === "deduction";

            return (
              <div
                key={item.paymentAdjustmentId}
                className="bg-white rounded-xl shadow p-4 flex flex-col justify-between hover:shadow-lg transition"
              >
                {/* TITLE ROW */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      isDeduction
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.paymentType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.paymentCalculationType || "—"}
                  </span>
                </div>

                {/* DESCRIPTION */}
                {item.description && (
                  <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                )}

                {/* FORMULA */}
                {item.calculationFormula && (
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded w-fit mb-2">
                    {item.calculationFormula}
                  </code>
                )}

                {/* META */}
                <div className="flex flex-col gap-1 text-xs text-gray-500 mb-2">
                  <span>
                    Max Amount:{" "}
                    {item.maxAllowedAmount > 0
                      ? `₹${item.maxAllowedAmount}`
                      : "Unlimited"}
                  </span>
                  <span>
                    Applies:{" "}
                    {item.effectiveFrom
                      ? new Date(item.effectiveFrom).toLocaleDateString("en-GB")
                      : "Always"}{" "}
                    →{" "}
                    {item.effectiveTo
                      ? new Date(item.effectiveTo).toLocaleDateString("en-GB")
                      : "Ongoing"}
                  </span>
                </div>

                {/* TAGS */}
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.isTaxable
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.isTaxable ? "Taxable" : "Non-Taxable"}
                  </span>

                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.isRecurring
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.isRecurring ? "Recurring" : "One-Time"}
                  </span>
                </div>

                {/* ACTION */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsEdit("Edit");
                      setSelectedAdjustment(item);
                      setShowForm(true);
                    }}
                    className="p-2 bg-gray-100 rounded-full hover:bg-teal-100 transition cursor-pointer"
                    title="Edit Adjustment"
                  >
                    <FiEdit2 size={16} className="text-teal-700" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // EMPTY STATE WITH ILLUSTRATION
        <div className="flex flex-col items-center py-12">
          <img
            src={assets.NoData} // use any placeholder illustration
            alt="No Payment Adjustments"
            className="w-52 mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">
            No payment adjustments found
          </h3>
          <p className="text-sm text-gray-600 mb-4 max-w-md text-center">
            Create payment adjustments to control extra earnings or deductions
            for employee salaries.
          </p>
          <button
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm hover:bg-secondary transition"
            onClick={() => setShowForm(true)}
          >
            + Add Adjustment
          </button>
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <PaymentAdjustmentForm
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
          isEdit={isEdit}
          initialData={selectedAdjustment}
        />
      )}
    </>
  );
}
