import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit } from "lucide-react";
import PFContributionRuleForm from "./PFContributionRuleForm";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const PFContributionRule = () => {
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await axiosInstance.get("/ContributionRule");
      console.log(res.data);
      setRules(res.data.response || []);
    } catch (error) {
      toast.error("Failed to fetch contribution rules");
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAdd = () => {
    setSelectedRule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-lg font-semibold">PF Contribution Rules</h2>
        <button
          onClick={handleAdd}
          className="flex items-center cursor-pointer text-sm gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary"
        >
          <Plus size={16} /> Add Rule
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg px-3">
        <table className="min-w-full divide-y text-xs divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 text-center">
            <tr>
              <th className="p-2">Component</th>
              <th className="p-2">Code</th>
              <th className="p-2">Account</th>
              <th className="p-2">%</th>
              <th className="p-2">Max</th>
              <th className="p-2">Ceiling</th>
              <th className="p-2">EmployerShare</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-500">
                  No rules found
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr
                  key={rule.contributionRuleId}
                  className="hover:bg-gray-50 text-center"
                >
                  <td className="p-1">{rule.componentName}</td>
                  <td className="p-1">{rule.code}</td>
                  <td className="p-1">{rule.accountType}</td>
                  <td className="p-1">{rule.percentage}%</td>
                  <td className="p-1">{rule.maxContribution}</td>
                  <td className="p-1">
                    {rule.hasCeiling ? rule.ceilingAmount : "-"}
                  </td>
                  <td className="p-1 text-center">
                    {rule.isEmployerShare ? "✔️" : "❌"}
                  </td>
                  <td className="p-1 text-center">
                    {rule.isActive ? "✔️" : "❌"}
                  </td>
                  <td className="p-1 text-center">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <PFContributionRuleForm
          initialData={selectedRule}
          onClose={() => setIsFormOpen(false)}
          refreshList={fetchRules}
        />
      )}
    </div>
  );
};

export default PFContributionRule;
