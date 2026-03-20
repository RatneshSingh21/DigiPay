import React, { useState } from "react";
import EmployeeUpdates from "./EmployeeUpdates/EmployeeUpdates";
import EmployeePFMapping from "./PolicySetup/EmployeePFMapping/EmployeePFMapping";
import EmployeeESIDetails from "./PolicySetup/EmployeeESIMapping/EmployeeESIDetails";
import EmployeeAttendancePolicyMapping from "./PolicySetup/EmployeeAttendancePolicyMapping/EmployeeAttendancePolicyMapping";
import EmployeeLeavePolicyMapping from "./PolicySetup/EmployeeLeavePolicyMapping/EmployeeLeavePolicyMapping";
import EmployeeWeekendPolicyMapping from "./PolicySetup/EmployeeWeekendPolicyMapping/EmployeeWeekendPolicyMapping";

const tabs = [
  { id: "employee", label: "Employee Updates" },
  { id: "pf", label: "PF Settings" },
  { id: "esi", label: "ESI Setup" },
  { id: "leave", label: "Leave Policy" },
  { id: "weekend", label: "Weekend Policy" },
  { id: "attendance", label: "Attendance Policy" },
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
            className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-t ${activeTab === t.id
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
        {activeTab === "pf" && <EmployeePFMapping />}
        {activeTab === "esi" && <EmployeeESIDetails />}
        {activeTab === "leave" && <EmployeeLeavePolicyMapping />}
        {activeTab === "weekend" && <EmployeeWeekendPolicyMapping />}
        {activeTab === "attendance" && <EmployeeAttendancePolicyMapping />}
      </div>
    </div>
  );
};

export default GeneralSettings;
