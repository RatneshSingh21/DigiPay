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

  // Fetch all late policies
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/LatePolicy/all");
      if (res.data && res.data.data) {
        setPolicies(res.data.data);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      toast.error("Failed to fetch late policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

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
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Late Policies</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
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
      <div className="px-4 pb-6">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : policies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No late policies found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {policies.map((p) => (
              <div
                key={p.latePolicyId}
                className="border rounded-xl shadow-sm hover:shadow-md transition bg-white p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {p.policyName}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-bold">Effective From:</span>{" "}
                      {p.effectiveFrom
                        ? new Date(p.effectiveFrom).toLocaleDateString("en-GB")
                        : "-"}
                    </p>
                    <p>
                      <span className="font-bold">Effective To:</span>{" "}
                      {p.effectiveTo
                        ? new Date(p.effectiveTo).toLocaleDateString("en-GB")
                        : "-"}
                    </p>
                    <p>
                      <span className="font-bold">Grace (mins/day):</span>{" "}
                      {p.graceMinutesPerDay ?? "-"}
                    </p>
                    <p>
                      <span className="font-bold">Max Grace Occurrences:</span>{" "}
                      {p.maxGraceOccurrences ?? "-"}
                    </p>
                    <p>
                      <span className="font-bold">Late Threshold (mins):</span>{" "}
                      {p.lateThresholdMinutes ?? "-"}
                    </p>
                    <p>
                      <span className="font-bold">Max Late/Month:</span>{" "}
                      {p.maxLateAllowedPerMonth ?? "-"}
                    </p>
                    <p>
                      <span className="font-bold">Deduct Half Day:</span>{" "}
                      {p.deductHalfDay ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-bold">Deduct Full Day:</span>{" "}
                      {p.deductFullDay ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-bold">Deduction Type:</span>{" "}
                      {p.deductionType || "-"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 border-t pt-2 flex justify-end">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 text-sm font-medium"
                  >
                    <Edit size={15} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <AddLatePolicy
          onClose={() => setShowForm(false)}
          isEdit={!!editData}
          initialData={editData}
          onSuccess={fetchPolicies}
        />
      )}
    </>
  );
};

export default LatePolicy;
