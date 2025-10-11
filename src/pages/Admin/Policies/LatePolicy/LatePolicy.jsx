import React, { useEffect, useState } from "react";
import { Plus, Edit } from "lucide-react";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AddLatePolicy from "./AddLatePolicy";

const LatePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch all policies
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/LatePolicy");
      setPolicies(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch late policies");
    } finally {
      setLoading(false);
    }
  };

  //   useEffect(() => {
  //     fetchPolicies();
  //   }, []);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (data) => {
    setEditData(data);
    setShowForm(true);
  };

  return (
    <>
      {/* Header */}
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Late Policies</h2>
        <div className="flex gap-2">
          <button
            // onClick={fetchPolicies}
            className="flex cursor-pointer items-center text-sm gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md text-sm"
          >
            <Plus size={16} /> Add Policy
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white shadow-md mx-4 rounded-xl overflow-hidden border">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : policies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No late policies found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-2 px-3 text-left">Policy Name</th>
                <th className="py-2 px-3 text-left">Effective From</th>
                <th className="py-2 px-3 text-left">Effective To</th>
                <th className="py-2 px-3 text-left">Deduction Type</th>
                <th className="py-2 px-3 text-left">Active</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.latePolicyId} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3">{p.policyName}</td>
                  <td className="py-2 px-3">
                    {p.effectiveFrom
                      ? new Date(p.effectiveFrom).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-3">
                    {p.effectiveTo
                      ? new Date(p.effectiveTo).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-3">{p.deductionType || "-"}</td>
                  <td className="py-2 px-3">
                    {p.isActive ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-500 font-medium">No</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
                    >
                      <Edit size={16} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <AddLatePolicy
          onClose={() => setShowForm(false)}
          isEdit={!!editData}
          initialData={editData}
          onSuccess={() => fetchPolicies()}
        />
      )}
    </>
  );
};

export default LatePolicy;
