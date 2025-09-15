import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import RuleModal from "./RuleModal";
import RoleModal from "./RoleModal";
import { FaPlus } from "react-icons/fa";
import { HiLink, HiOutlineClipboardCheck } from "react-icons/hi";
import { MdGavel } from "react-icons/md";

const RoleApproval = () => {
  const [rules, setRules] = useState([]);
  const [ruleRoles, setRuleRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  const [formData, setFormData] = useState({
    requestType: "",
    allowCustomApprover: false,
  });

  const [roleAssignment, setRoleAssignment] = useState({
    ruleId: "",
    roleId: "",
    sequenceOrder: 1,
  });

  // Modal states
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Fetch data
  const fetchRules = async () => {
    try {
      const res = await axiosInstance.get("/ApprovalRule");
      setRules(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch approval rules");
    }
  };

  const fetchRuleRoles = async () => {
    try {
      const res = await axiosInstance.get("/ApprovalRuleRole");
      setRuleRoles(res.data?.data || []);
    } catch {
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
    } catch {
      toast.error("Failed to fetch roles.");
    }
  };

  useEffect(() => {
    fetchRules();
    fetchRuleRoles();
    fetchAvailableRoles();
  }, []);

  // Create new Approval Rule
  const createRule = async () => {
    if (!formData.requestType.trim()) {
      toast.error("Request Type is required");
      return;
    }
    try {
      await axiosInstance.post("/ApprovalRule", formData);
      toast.success("Rule created successfully");
      setFormData({ requestType: "", allowCustomApprover: false });
      setIsRuleModalOpen(false);
      fetchRules();
    } catch {
      toast.error("Failed to create rule");
    }
  };

  // Assign role to a rule
  const assignRole = async () => {
    if (!roleAssignment.ruleId || !roleAssignment.roleId) {
      toast.error("Please select a rule and a role");
      return;
    }
    try {
      await axiosInstance.post("/ApprovalRuleRole", roleAssignment);
      toast.success("Role assigned successfully");
      setRoleAssignment({ ruleId: "", roleId: "", sequenceOrder: 1 });
      setIsRoleModalOpen(false);
      fetchRuleRoles();
    } catch {
      toast.error("Failed to assign role");
    }
  };

  return (
    <>
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Approval Rules Management</h2>

        <div className="flex gap-4 items-center">
          {/* <button
            onClick={() => setIsRuleModalOpen(true)}
            className="bg-primary hover:opacity-80 cursor-pointer flex items-center text-white px-5 py-2 rounded-lg shadow-md"
          >
            <FaPlus className="mr-2" /> Create Rule
          </button> */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="bg-primary hover:bg-secondary cursor-pointer flex items-center text-white px-5 py-2 rounded-lg shadow-md"
          >
            <HiLink className="mr-2" /> Assign Role
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Existing Rules */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <HiOutlineClipboardCheck className="text-primary" /> Existing
              Rules
            </h3>
            <span className="text-sm text-gray-500">{rules.length} total</span>
          </div>

          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <HiOutlineClipboardCheck size={32} className="mb-2 opacity-50" />
              <p className="italic">No rules created yet.</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 text-gray-900 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Request Type</th>
                    <th className="px-4 py-3 text-center">Custom Approver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rules.map((r) => (
                    <tr
                      key={r.ruleId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {r.requestType}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.allowCustomApprover ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rule Roles */}
        <div className="bg-white  shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <MdGavel className="text-secondary" /> Rule Roles
            </h3>
            <span className="text-sm text-gray-500">
              {ruleRoles.length} assigned
            </span>
          </div>

          {ruleRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <MdGavel size={32} className="mb-2 opacity-50" />
              <p className="italic">No roles assigned yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 text-gray-900 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Rule Id</th>
                    <th className="px-4 py-3 text-center">Role</th>
                    <th className="px-4 py-3 text-center">Sequence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ruleRoles.map((rr) => {
                    const roleName =
                      availableRoles.find((r) => r.roleID === rr.roleId)
                        ?.roleName || rr.roleId;
                    return (
                      <tr
                        key={rr.ruleRoleId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {rr.ruleRoleId}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {roleName}
                        </td>
                        <td className="px-4 py-3 text-center">
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
        <RuleModal
          isOpen={isRuleModalOpen}
          onClose={() => setIsRuleModalOpen(false)}
          formData={formData}
          setFormData={setFormData}
          createRule={createRule}
        />

        <RoleModal
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

export default RoleApproval;
