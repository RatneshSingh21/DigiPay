import React, { useState } from "react";
import useDynamicSalaryComponent from "./useDynamicSalaryComponent";
import DynamicSalaryComponentModal from "./DynamicSalaryComponentModal";

export default function DynamicSalaryComponentPage({ policyId }) {
  const {
    components,
    loading,
    createComponent,
    deleteComponent,
  } = useDynamicSalaryComponent(policyId);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Dynamic Salary Components
        </h1>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
        >
          + Add Dynamic Component
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : components.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No dynamic components found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-4">Code</th>
                <th>Type</th>
                <th>Calculation</th>
                <th>Execution</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-4 font-medium">{c.componentCode}</td>
                  <td>{c.componentType}</td>
                  <td>{c.calculationType}</td>
                  <td>{c.executionOrder}</td>
                  <td className="text-right pr-6">
                    <button
                      onClick={() => deleteComponent(c.id)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DynamicSalaryComponentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          createComponent({ ...data, policyId });
          setIsOpen(false);
        }}
      />
    </div>
  );
}