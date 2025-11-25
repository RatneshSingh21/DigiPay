import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import ApprovalsByApprover from "./ApprovalsByApprover";
import ApprovalAll from "./ApprovalAll";

export default function ApprovalWrapper() {
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch approver list (HOD, Admin)
  const fetchApprovers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/EmployeeRoleMapping");

      const options = res.data
        .filter((item) => {
          const role = item.roleName?.toLowerCase(); // 🔥 case-insensitive role name
          return role !== "user" && role !== "employee"; // ❌ excluded
        })
        .map((item) => ({
          label: `${item.employeeName} (${item.roleName})`,
          value: item.employeeId,
        }));

      setApprovers(options);
    } catch (err) {
      console.error("Failed to fetch approvers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="px-4 py-3 shadow bg-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">Approval Management</h2>

        <div className="w-72">
          <Select
            options={approvers}
            value={selectedApprover}
            onChange={(val) => setSelectedApprover(val)}
            isClearable
            isLoading={loading}
            placeholder="Select Approver"
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div>
        {selectedApprover ? (
          <ApprovalsByApprover
            key={`approver-${selectedApprover.value}`} // 🔥 FIX
            approverId={selectedApprover.value}
          />
        ) : (
          <ApprovalAll key="all-approvals" /> // 🔥 FIX
        )}
      </div>
    </div>
  );
}
