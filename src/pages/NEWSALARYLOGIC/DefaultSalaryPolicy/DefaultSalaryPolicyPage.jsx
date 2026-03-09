import React, { useState, useMemo, useEffect } from "react";
import useDefaultSalaryPolicy from "./useDefaultSalaryPolicy";
import useDefaultSalaryComponentDefinition from "../DefaultSalaryComponentDefinition/useDefaultSalaryComponentDefinition";
import DefaultSalaryPolicyModal from "./DefaultSalaryPolicyModal";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

export default function DefaultSalaryPolicyPage() {
  const { policies, loading, createPolicy, updatePolicy, deletePolicy } =
    useDefaultSalaryPolicy();

  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Fetch components for selected policy
  const { components, loading: componentLoading } =
    useDefaultSalaryComponentDefinition(selectedPolicy?.id);

  const activePolicy = useMemo(
    () => policies.find((p) => p.isActive),
    [policies],
  );

  // Auto-select active policy on load
  useEffect(() => {
    if (!selectedPolicy && activePolicy) setSelectedPolicy(activePolicy);
  }, [activePolicy]);

  return (
    <div className="min-h-screen bg-gray-50 space-y-8">
      {/* HEADER */}
      <div className="bg-white border-b p-4 border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Default Salary Policies
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage company-wide salary policies and view their components.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPolicy(null);
            setIsPolicyOpen(true);
          }}
          className="flex items-center gap-2 bg-primary cursor-pointer text-white px-5 py-2.5 rounded-lg shadow hover:bg-secondary text-sm transition"
        >
          <FiPlus size={16} />
          Create Policy
        </button>
      </div>

      {/* POLICIES CARDS */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-6 text-center text-gray-500">
            Loading policies...
          </div>
        ) : policies.length === 0 ? (
          <div className="col-span-full p-6 text-center text-gray-400">
            No policies created yet.
          </div>
        ) : (
          policies.map((policy) => (
            <div
              key={policy.id}
              onClick={() => setSelectedPolicy(policy)}
              className={`cursor-pointer border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition ${
                selectedPolicy?.id === policy.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {policy.policyName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Version: v{policy.version}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        policy.prorateByAttendance
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      Attendance{" "}
                      {policy.prorateByAttendance ? "Enabled" : "Disabled"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      Rounding: {policy.netSalaryRoundingPolicy}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPolicy(policy);
                      setIsPolicyOpen(true);
                    }}
                    className="flex items-center text-center justify-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition cursor-pointer text-sm font-medium"
                  >
                    <FiEdit2 className="w-4 h-4" /> Edit
                  </button>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      // Deactivate the policy
                      await updatePolicy(policy.id, {
                        ...policy,
                        isActive: false,
                      });
                      if (selectedPolicy?.id === policy.id)
                        setSelectedPolicy(null);
                    }}
                    className="flex items-center gap-1 justify-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition cursor-pointer text-sm font-medium"
                  >
                    <FiTrash2 className="w-4 h-4" /> Deactivate
                  </button>
                </div>
              </div>
              {policy.isActive && (
                <span className="mt-3 inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Active Policy
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* COMPONENTS SECTION - READ-ONLY */}
      {selectedPolicy && (
        <div className="space-y-6 px-4">
          {/* HEADING */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-xl font-bold text-gray-800">
              Components for "{selectedPolicy.policyName}"
            </h2>
            <p className="text-sm text-gray-500 sm:mt-0">
              All automatically assigned components for this policy
            </p>
          </div>

          {/* COMPONENTS LIST */}
          {componentLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading components...
            </div>
          ) : components.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No components defined for this policy.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {components.map((c) => (
                <div
                  key={c.id}
                  className="border border-gray-200 rounded-xl p-5 shadow hover:shadow-lg transition bg-white"
                >
                  {/* Top: Component Code + Active/Inactive */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {c.componentCode}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.componentType === "Earning"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.componentType}
                    </span>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.calculationType === "Fixed"
                          ? "bg-green-100 text-green-700"
                          : c.calculationType === "Percentage"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {c.calculationType}
                    </span>

                    {c.isAttendanceSensitive && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        Attendance Sensitive
                      </span>
                    )}

                    {c.isStatutory && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Statutory
                      </span>
                    )}

                    {c.dependsOn && c.dependsOn.length > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Depends on: {c.dependsOn.join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Execution Order */}
                  <div className="flex justify-end">
                    <span className="text-gray-500 text-xs font-medium px-2 py-1 bg-gray-50 rounded-full border border-gray-200">
                      Execution Order: {c.executionOrder}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POLICY MODAL */}
      <DefaultSalaryPolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        initialData={editingPolicy}
        onSubmit={(data) => {
          editingPolicy
            ? updatePolicy(editingPolicy.id, data)
            : createPolicy(data);
          setIsPolicyOpen(false);
        }}
      />
    </div>
  );
}
