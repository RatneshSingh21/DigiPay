import React, { useState } from "react";

const ComplianceRules = () => {
  const [pfEnabled, setPfEnabled] = useState(false);
  const [esiEnabled, setEsiEnabled] = useState(false);
  const [gratuityEnabled, setGratuityEnabled] = useState(false);

  const handleSave = () => {
    console.log({ pfEnabled, esiEnabled, gratuityEnabled });
    // API call here
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Compliance Rules</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pfEnabled}
            onChange={() => setPfEnabled(!pfEnabled)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Enable PF</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={esiEnabled}
            onChange={() => setEsiEnabled(!esiEnabled)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Enable ESI</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={gratuityEnabled}
            onChange={() => setGratuityEnabled(!gratuityEnabled)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Enable Gratuity</label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Compliance
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRules;
