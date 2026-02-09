import { X } from "lucide-react";
import React, { useRef } from "react";
import Select from "react-select";

const RuleRoleModal = ({
  isOpen,
  onClose,
  roleAssignment,
  setRoleAssignment,
  assignRole,
  rules,
  availableRoles,
}) => {
  if (!isOpen) return null;

  const modalRef = useRef(null);

  // Build options for react-select
  const ruleOptions = rules.map((r) => ({
    value: r.ruleId,
    label: r.requestType,
  }));

  const roleOptions = availableRoles.map((role) => ({
    value: role.roleID,
    label: role.roleName,
  }));

  // Close modal when clicking outside content
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Assign Role to Rule
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-red-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 mb-6">
          {/* Rule Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Rule
            </label>
            <Select
              options={ruleOptions}
              placeholder="Choose a rule"
              value={
                ruleOptions.find(
                  (opt) => opt.value === roleAssignment.ruleId,
                ) || null
              }
              onChange={(selected) =>
                setRoleAssignment({
                  ...roleAssignment,
                  ruleId: selected ? selected.value : "",
                })
              }
              autoFocus
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Role
            </label>
            <Select
              options={roleOptions}
              placeholder="Choose a role"
              value={
                roleOptions.find(
                  (opt) => opt.value === roleAssignment.roleId,
                ) || null
              }
              onChange={(selected) =>
                setRoleAssignment({
                  ...roleAssignment,
                  roleId: selected ? selected.value : "",
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Sequence Order Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sequence Order
            </label>
            <input
              type="number"
              min={1}
              value={roleAssignment.sequenceOrder}
              onChange={(e) =>
                setRoleAssignment({
                  ...roleAssignment,
                  sequenceOrder: parseInt(e.target.value, 10) || 1,
                })
              }
              className={inputClass}
              placeholder="Enter sequence order"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 text-sm rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={assignRole}
            className="px-4 py-2 bg-primary text-sm hover:bg-secondary cursor-pointer text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleRoleModal;
