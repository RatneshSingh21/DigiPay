import React from "react";
import { FiX } from "react-icons/fi";

const SalaryCalculationResultModalDynamic = ({ data, onClose }) => {
  if (!data) return null;

  const components = data.componentBreakdown || {};

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">
          Salary Breakdown(Dynamic)
        </h2>

        <div className="space-y-2 text-sm">

          {Object.entries(components).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between border-b border-gray-200 py-1"
            >
              <span>{key.replaceAll("_", " ")}</span>
              <span>₹ {Math.round(value)}</span>
            </div>
          ))}

        </div>

        <div className="mt-4 border-t border-gray-200 pt-3 space-y-2 text-sm font-semibold">

          <div className="flex justify-between">
            <span>Gross Salary</span>
            <span>₹ {Math.round(data.gross)}</span>
          </div>

          <div className="flex justify-between text-red-600">
            <span>Total Deductions</span>
            <span>₹ {Math.round(data.totalDeductions)}</span>
          </div>

          <div className="flex justify-between text-green-600 text-lg">
            <span>Net Salary</span>
            <span>₹ {Math.round(data.netSalary)}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SalaryCalculationResultModalDynamic;