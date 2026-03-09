import React, { useState } from "react";
import useDefaultSalaryComponentDefinition from "./useDefaultSalaryComponentDefinition";
import DefaultSalaryComponentModal from "./DefaultSalaryComponentModal";

export default function DefaultSalaryComponentPage({ policyId }) {
  const {
    components,
    loading,
    createComponent,
    updateComponent,
    deleteComponent,
  } = useDefaultSalaryComponentDefinition(policyId);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Salary Component Definitions
        </h1>

        <button
          onClick={() => {
            setEditing(null);
            setIsOpen(true);
          }}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
        >
          + Add Component
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-4">Code</th>
                <th>Type</th>
                <th>Calculation</th>
                <th>Execution</th>
                <th>Status</th>
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
                  <td>
                    {c.isActive ? (
                      <span className="text-green-600 text-sm">Active</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Inactive</span>
                    )}
                  </td>
                  <td className="text-right pr-6 space-x-3">
                    <button
                      onClick={() => {
                        setEditing(c);
                        setIsOpen(true);
                      }}
                      className="text-indigo-600 text-sm"
                    >
                      Edit
                    </button>

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

      <DefaultSalaryComponentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          editing
            ? updateComponent(editing.id, data)
            : createComponent(data);
          setIsOpen(false);
        }}
        initialData={editing}
        existingComponents={components}
      />
    </div>
  );
}