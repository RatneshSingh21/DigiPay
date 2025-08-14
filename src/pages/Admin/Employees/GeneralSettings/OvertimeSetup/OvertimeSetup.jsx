import React, { useState } from "react";

const OvertimeSetup = () => {
  const [rateType, setRateType] = useState("hourly");
  const [rate, setRate] = useState("");

  const handleSave = () => {
    console.log({ rateType, rate });
    // API call here
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Overtime Setup</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Overtime Rate Type
          </label>
          <select
            value={rateType}
            onChange={(e) => setRateType(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="hourly">Hourly Rate</option>
            <option value="fixed">Fixed Rate</option>
            <option value="percentage">Percentage of Salary</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Overtime Rate
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter rate"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Overtime Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default OvertimeSetup;
