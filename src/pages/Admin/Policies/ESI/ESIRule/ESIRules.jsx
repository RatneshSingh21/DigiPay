import React, { useEffect, useState } from "react";
import { Plus, Edit, Inbox } from "lucide-react";
import { toast } from "react-toastify";
import { getESIRules } from "../../../../../services/esiService";
import Spinner from "../../../../../components/Spinner";
import ESIRulesForm from "./ESIRulesForm";

const ESIRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch ESI rules
  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await getESIRules();
      // If backend wraps array inside .data
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRules(list);
    } catch (err) {
      toast.error("Failed to fetch ESI Rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">ESI Rules</h2>
        <button
          onClick={() => {
            setEditData(null);
            setIsFormOpen(true);
          }}
          className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2" size={16} /> Add ESI Rule
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto shadow rounded-lg px-3">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-100 text-gray-600 text-center">
              <tr>
                <th className="px-3 py-2">Rule ID</th>
                <th className="px-3 py-2">Employee Rate (%)</th>
                <th className="px-3 py-2">Employer Rate (%)</th>
                <th className="px-3 py-2">Wage Ceiling</th>
                <th className="px-3 py-2">Disable WageCeiling</th>
                <th className="px-3 py-2">DailyWage Exemption</th>
                <th className="px-3 py-2">esiApplicable Components</th>
                <th className="px-3 py-2">Effective From</th>
                <th className="px-3 py-2">Effective To</th>
                <th className="px-3 py-2">Status</th>
                {/* <th className="px-3 py-2">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-center">
              {rules.map((rule) => (
                <tr key={rule.ruleId} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{rule.ruleId}</td>
                  <td className="px-3 py-2">{rule.employeeContributionRate}</td>
                  <td className="px-3 py-2">{rule.employerContributionRate}</td>
                  <td className="px-3 py-2">{rule.wageCeiling}</td>
                  <td className="px-3 py-2">{rule.disabledWageCeiling}</td>
                  <td className="px-3 py-2">{rule.dailyWageExemption}</td>
                  <td className="px-3 py-2">{rule.esiApplicableComponents}</td>
                  <td className="px-3 py-2">
                    {rule.effectiveFrom
                      ? new Date(rule.effectiveFrom).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {rule.effectiveTo
                      ? new Date(rule.effectiveTo).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        rule.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {rule.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {/* <td className="px-3 py-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await getESIRuleById(rule.ruleId);
                          setEditData(res.data?.data);
                          setIsFormOpen(true);
                        } catch (err) {
                          toast.error("Failed to fetch rule details");
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Edit size={16} className="mr-1" /> Edit
                    </button>
                  </td> */}
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan="10">
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Inbox size={44} className="text-gray-400" />
                      </div>

                      <p className="text-sm font-semibold text-gray-700">
                        No ESI Rules Found
                      </p>

                      <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
                        ESI contribution rules have not been configured yet.
                        Click{" "}
                        <span className="text-primary font-medium">
                          Add ESI Rule
                        </span>{" "}
                        to create one.
                      </p>

                      {/* Optional CTA */}
                      <button
                        onClick={() => {
                          setEditData(null);
                          setIsFormOpen(true);
                        }}
                        className="mt-4 flex items-center cursor-pointer gap-1 bg-primary hover:bg-secondary text-white px-4 py-2 rounded text-xs"
                      >
                        <Plus size={14} /> Add ESI Rule
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <ESIRulesForm
          editData={editData}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            fetchRules();
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ESIRules;
