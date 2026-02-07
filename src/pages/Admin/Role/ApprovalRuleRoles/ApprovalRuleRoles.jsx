import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RuleRoleModal from "./RuleRoleModal";
import { FaPlus } from "react-icons/fa";
import { HiLink, HiOutlineClipboardCheck } from "react-icons/hi";
import { MdGavel } from "react-icons/md";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const ApprovalRuleRoles = () => {
  const [rules, setRules] = useState([]);
  const [ruleRoles, setRuleRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  const [roleAssignment, setRoleAssignment] = useState({
    ruleId: "",
    roleId: "",
    sequenceOrder: "",
  });

  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Fetch data
  const fetchRules = async () => {
    try {
      const res = await axiosInstance.get("/ApprovalRule");
      setRules(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast.error("Failed to fetch approval rules");
    }
  };

  const fetchRuleRoles = async () => {
    try {
      const res = await axiosInstance.get("/ApprovalRuleRole");
      setRuleRoles(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching rule roles:", error);
      toast.error("Failed to fetch approval rule roles");
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const res = await axiosInstance.get("/RoleList/getall");
      if (Array.isArray(res.data)) {
        setAvailableRoles(res.data);
      } else {
        toast.error("Unexpected roles response");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles.");
    }
  };

  useEffect(() => {
    fetchRules();
    fetchRuleRoles();
    fetchAvailableRoles();
  }, []);

  // Assign role to a rule
  const assignRole = async () => {
    if (!roleAssignment.ruleId || !roleAssignment.roleId) {
      toast.error("Please select a rule and a role");
      return;
    }

    // Frontend validation: prevent duplicate sequence for same rule
    const existingRoleForSequence = ruleRoles.find(
      (r) =>
        r.ruleId === roleAssignment.ruleId &&
        r.sequenceOrder === roleAssignment.sequenceOrder,
    );

    if (existingRoleForSequence) {
      toast.error(
        `Sequence order ${roleAssignment.sequenceOrder} is already used for this rule`,
      );
      return;
    }

    try {
      await axiosInstance.post("/ApprovalRuleRole", {
        ruleId: roleAssignment.ruleId,
        roleId: roleAssignment.roleId,
        sequenceOrder: roleAssignment.sequenceOrder,
      });

      toast.success("Role assigned successfully");

      // reset form
      setRoleAssignment({ ruleId: "", roleId: "", sequenceOrder: "" });
      setIsRoleModalOpen(false);
      fetchRuleRoles();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error(error?.response?.data?.message || "Failed to assign role");
    }
  };

  return (
    <>
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Approval RuleRoles Management</h2>
      </div>

      <div className="px-4 py-2 space-y-2">
        {/* Rule Roles */}
        <div className="bg-white  shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <MdGavel className="text-secondary" /> Rule Roles{" "}
              <span className="text-sm text-gray-500">
                {ruleRoles.length} assigned
              </span>
            </h3>

            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-primary text-sm hover:bg-secondary cursor-pointer flex items-center text-white px-5 py-2 rounded-lg shadow-md"
            >
              <HiLink className="mr-2" /> Assign Role
            </button>
          </div>

          {ruleRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <MdGavel size={32} className="mb-2 opacity-50" />
              <p className="italic">No roles assigned yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow">
              <table className="min-w-full divide-y text-xs divide-gray-200 text-center ">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2">S.No</th>
                    <th className="p-2">Rule</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Sequence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ruleRoles.map((rr, index) => {
                    const roleName =
                      availableRoles.find((r) => r.roleID === rr.roleId)
                        ?.roleName || rr.roleId;
                    return (
                      <tr
                        key={rr.ruleRoleId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-2 text-gray-700">{index + 1}</td>

                        <td className="p-2 font-medium text-gray-800">
                          {rules.find((r) => r.ruleId === rr.ruleId)
                            ?.requestType || rr.ruleId}
                        </td>
                        <td className="p-2 text-gray-700">{roleName}</td>
                        <td className="p-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {rr.sequenceOrder}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}

        <RuleRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          roleAssignment={roleAssignment}
          setRoleAssignment={setRoleAssignment}
          assignRole={assignRole}
          rules={rules}
          availableRoles={availableRoles}
        />
      </div>
    </>
  );
};

export default ApprovalRuleRoles;
