import React, { useState } from "react";
import EmployeeUpdates from "./EmployeeUpdates/EmployeeUpdates";
import PolicySetup from "./PolicySetup/PolicySetup";
import OvertimeSetup from "./OvertimeSetup/OvertimeSetup";
import ComplianceRules from "./ComplianceRules/ComplianceRules";

const tabs = [
  { id: "employee", label: "Employee Updates" },
  { id: "policies", label: "Policies" },
  { id: "overtime", label: "Overtime Setup" },
  { id: "compliance", label: "Compliance" },
];

const GeneralSettings = () => {
  const [activeTab, setActiveTab] = useState("employee");

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Tabs */}
      <div className="flex border-b mb-4 gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t ${
              activeTab === t.id
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "employee" && <EmployeeUpdates />}
        {activeTab === "policies" && <PolicySetup />}
        {activeTab === "overtime" && <OvertimeSetup />}
        {activeTab === "compliance" && <ComplianceRules />}
      </div>
    </div>
  );
};

export default GeneralSettings;
