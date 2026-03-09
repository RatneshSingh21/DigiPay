import React, { useState, useEffect, useMemo } from "react";
import useDynamicSalaryPolicy from "./useDynamicSalaryPolicy";
import useDynamicSalaryComponent from "../DynamicSalaryComponent/useDynamicSalaryComponent";
import DynamicSalaryComponentModal from "../DynamicSalaryComponent/DynamicSalaryComponentModal";
import DynamicSalaryPolicyFormModal from "./DynamicSalaryPolicyFormModal";
import { Trash2 } from "lucide-react";
import { FiPlus } from "react-icons/fi";

const roundingLabels = {
  0: "No Rounding",
  1: "Round Up",
  2: "Round Down",
  3: "Round to Nearest",
};

export default function DynamicSalaryPolicyPage() {
  const { policies, loading, createPolicy, activatePolicy } =
    useDynamicSalaryPolicy();

  const {
    components,
    loading: componentLoading,
    fetchComponents,
    createComponent,
    deleteComponent,
  } = useDynamicSalaryComponent();

  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  /* ============================= */
  /* FETCH COMPONENTS */
  /* ============================= */
  useEffect(() => {
    if (selectedPolicyId) {
      fetchComponents(selectedPolicyId);
    }
  }, [selectedPolicyId]);

  /* ============================= */
  /* DELETE HANDLER */
  /* ============================= */
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this component?",
    );
    if (!confirm) return;

    await deleteComponent(id);
    fetchComponents(selectedPolicyId);
  };

  /* ============================= */
  /* SPLIT COMPONENTS */
  /* ============================= */

  const COMPONENT_TYPE = {
    EARNING: 1,
    DEDUCTION: 2,
  };

  const earnings = useMemo(
    () =>
      components
        .filter((c) => c.componentType === COMPONENT_TYPE.EARNING)
        .sort((a, b) => a.executionOrder - b.executionOrder),
    [components],
  );

  const deductions = useMemo(
    () =>
      components
        .filter((c) => c.componentType === COMPONENT_TYPE.DEDUCTION)
        .sort((a, b) => a.executionOrder - b.executionOrder),
    [components],
  );

  return (
    <div className="bg-white min-h-screen space-y-10">
      {/* PAGE HEADER */}
      <div className="bg-white border-b p-4 border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Dynamic Salary Policies
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure payroll rules and salary component execution flow
          </p>
        </div>

        <button
          onClick={() => setIsPolicyModalOpen(true)}
          className="flex items-center gap-2 bg-primary cursor-pointer text-white px-5 py-2.5 rounded-lg shadow hover:bg-secondary text-sm transition"
        >
          <FiPlus size={16} />
          Create Policy
        </button>
      </div>

      {loading && (
        <div className="text-center text-slate-500">Loading policies...</div>
      )}

      <div className="space-y-4 px-4">
        {policies.map((policy) => {
          const isSelected = selectedPolicyId === policy.id;

          return (
            <div
              key={policy.id}
              className={`bg-white rounded-2xl shadow-md 
                border border-gray-200
                 transition-all ${
                   isSelected
                     ? "border-indigo-500 ring-2 ring-indigo-200"
                     : "border-slate-200"
                 }`}
            >
              {/* POLICY HEADER */}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {policy.policyName}
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="px-3 py-1 bg-slate-100 rounded-full">
                        Version {policy.version}
                      </span>

                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        Rounding:{" "}
                        {roundingLabels[policy.netSalaryRoundingPolicy]}
                        {policy.roundingNearestValue &&
                          ` (${policy.roundingNearestValue})`}
                      </span>

                      {policy.allowNegativeSalary && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
                          Negative Salary Allowed
                        </span>
                      )}

                      {policy.isActive && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {policy.policyRuleSetJson && (
                      <div className="mt-3 bg-slate-50 p-3 rounded text-xs">
                        <p className="font-medium">Policy Rule Config</p>
                        <pre className="whitespace-pre-wrap">
                          {policy.policyRuleSetJson}
                        </pre>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mt-3">
                      Created{" "}
                      {new Date(policy.createdAt).toLocaleDateString("en-Gb")}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setSelectedPolicyId(
                          selectedPolicyId === policy.id ? null : policy.id,
                        )
                      }
                      className="px-4 py-2 text-sm cursor-pointer bg-slate-200 rounded-lg hover:bg-slate-300"
                    >
                      Manage Components
                    </button>

                    {!policy.isActive && (
                      <button
                        onClick={() => activatePolicy(policy.id)}
                        className="px-4 py-2 text-sm cursor-pointer bg-primary text-white rounded-lg"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* COMPONENT SECTION */}
              {isSelected && (
                <div className="border-t border-gray-200 bg-slate-50 p-6 space-y-8">
                  {/* SECTION HEADER */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Salary Components
                      </h3>
                      <p className="text-sm text-slate-500">
                        Manage earnings and deductions
                      </p>
                    </div>

                    <button
                      onClick={() => setIsComponentModalOpen(true)}
                      className="px-4 py-2 bg-primary hover:bg-secondary text-sm cursor-pointer text-white rounded-lg"
                    >
                      + Add Component
                    </button>
                  </div>

                  {componentLoading ? (
                    <p className="text-slate-500">Loading components...</p>
                  ) : components.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      No components configured.
                    </div>
                  ) : (
                    <>
                      {/* EARNINGS */}
                      <ComponentSection
                        title="Earnings"
                        color="emerald"
                        data={earnings}
                        onDelete={handleDelete}
                      />

                      {/* DEDUCTIONS */}
                      <ComponentSection
                        title="Deductions"
                        color="red"
                        data={deductions}
                        onDelete={handleDelete}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODALS */}
      <DynamicSalaryPolicyFormModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onSubmit={createPolicy}
      />

      <DynamicSalaryComponentModal
        isOpen={isComponentModalOpen}
        onClose={() => setIsComponentModalOpen(false)}
        onSubmit={async (form) => {
          await createComponent({
            ...form,
            policyId: selectedPolicyId,
          });

          setIsComponentModalOpen(false);
          fetchComponents(selectedPolicyId);
        }}
      />
    </div>
  );
}

/* ============================= */
/* COMPONENT SECTION */
/* ============================= */

function ComponentSection({ title, color, data, onDelete }) {
  return (
    <div>
      <h3
        className={`text-lg font-semibold mb-4 ${
          color === "emerald" ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {title} ({data.length})
      </h3>

      <div className="grid md:grid-cols-3 gap-4">
        {data.map((c) => (
          <ComponentCard key={c.id} component={c} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

/* ============================= */
/* COMPONENT CARD */
/* ============================= */

function ComponentCard({ component, onDelete }) {
  const calculationTypeLabels = {
    0: "Fixed",
    1: "Percentage",
    2: "Formula",
    3: "Aggregate",
  };

  const componentTypeLabel =
    component.componentType === 1 ? "Earning" : "Deduction";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition relative">
      {/* Delete Button */}
      <button
        onClick={() => onDelete(component.id)}
        className="absolute top-3 right-3 flex items-center gap-1 text-xs cursor-pointer
                   bg-red-50 text-red-600 px-3 py-1 rounded-full 
                   hover:bg-red-100 transition"
      >
        <Trash2 size={14} />
        Delete
      </button>

      {/* Header */}
      <div>
        <h4 className="font-semibold text-slate-800 text-lg">
          {component.componentCode}
        </h4>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Component Type Pill */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full border ${
              component.componentType === 1
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {component.componentType === 1 ? "Earning" : "Deduction"}
          </span>

          {/* Execution Order Pill */}
          <span className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-200">
            Execution Order: {component.executionOrder}
          </span>
        </div>
      </div>

      {/* Calculation Details */}
      <div className="mt-4 text-sm text-slate-600 space-y-2">
        <p>
          <span className="font-medium">Calculation:</span>{" "}
          {calculationTypeLabels[component.calculationType]}
        </p>

        {component.fixedValue !== null && (
          <p>Fixed Value: ₹{component.fixedValue}</p>
        )}

        {component.percentageValue !== null && (
          <p>Percentage: {component.percentageValue}%</p>
        )}

        {component.minimumValue !== null && (
          <p>Min Limit: ₹{component.minimumValue}</p>
        )}

        {component.maximumValue !== null && (
          <p>Max Limit: ₹{component.maximumValue}</p>
        )}

        {component.formulaExpressionJson && (
          <div className="bg-slate-50 p-2 rounded text-xs">
            <p className="font-medium">Formula</p>
            <pre className="whitespace-pre-wrap break-words">
              {component.formulaExpressionJson}
            </pre>
          </div>
        )}

        {component.tierConfigJson && (
          <div className="bg-slate-50 p-2 rounded text-xs">
            <p className="font-medium">Tier Config</p>
            <pre className="whitespace-pre-wrap break-words">
              {component.tierConfigJson}
            </pre>
          </div>
        )}

        {component.activationRuleJson && (
          <div className="bg-slate-50 p-2 rounded text-xs">
            <p className="font-medium">Activation Rule</p>
            <pre className="whitespace-pre-wrap break-words">
              {component.activationRuleJson}
            </pre>
          </div>
        )}

        {component.thresholdRuleJson && (
          <div className="bg-slate-50 p-2 rounded text-xs">
            <p className="font-medium">Threshold Rule</p>
            <pre className="whitespace-pre-wrap break-words">
              {component.thresholdRuleJson}
            </pre>
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {component.isAttendanceSensitive && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            Attendance Sensitive
          </span>
        )}

        {component.isStatutory && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            Statutory
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-slate-400">
        Created {new Date(component.createdAt).toLocaleDateString("en-Gb")}
      </div>
    </div>
  );
}
