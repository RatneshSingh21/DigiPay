import React, { useState } from "react";
import LeaveTypeLocation from "./LeaveTypeLocation";
import LeaveTypeRole from "./LeaveTypeRole";
import LeaveTypeDepartment from "./LeaveTypeDepartment";

const tabs = [
  { id: "By Location", label: "By Location" },
  { id: "By Role", label: "By Role" },
  { id: "By Department", label: "By Department" },
  
];

const LeaveMapping = () => {
  const [activeTab, setActiveTab] = useState("By Location");

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 gap-2 ">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t cursor-pointer ${
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
        {activeTab === "By Location" && <LeaveTypeLocation />}
        {activeTab === "By Role" && <LeaveTypeRole/>}
        {activeTab === "By Department" && <LeaveTypeDepartment />} 
      </div>
    </div>
  );
};

export default LeaveMapping;
