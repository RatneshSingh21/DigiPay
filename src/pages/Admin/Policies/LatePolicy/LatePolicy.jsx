import React, { useEffect, useState } from "react";
import { Plus, Edit } from "lucide-react";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AddLatePolicy from "./AddLatePolicy";
import assets from "../../../../assets/assets";

/* ---------- Rule Formatter ---------- */
const formatRule = (r) => {
  const range =
    r.toLateMinutes != null
      ? `${r.fromLateMinutes}–${r.toLateMinutes} mins`
      : `${r.fromLateMinutes}+ mins`;

  switch (r.resolutionType) {
    case "Ignore":
      return `${range} → Ignore`;
    case "ApplyFine":
      return `${range} → Fine ₹${r.amount} (${r.amountType})`;
    case "DeductHalfDay":
      return `${range} → Half Day`;
    case "DeductFullDay":
      return `${range} → Full Day`;
    case "RequireMakeUpHours":
      return `${range} → Make-up ${r.requiredMakeUpHours} hrs`;
    case "AdjustLeave":
      return `${range} → Leave (${r.leaveType})`;
    default:
      return `${range} → ${r.resolutionType}`;
  }
};

const LatePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ---------- Fetch Policies ---------- */
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/LatePolicy/all");
      setPolicies(res.data?.data || []);
    } catch {
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
      {/* ---------- Header ---------- */}
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-900">Late Policies</h2>

        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
            className="flex items-center gap-2 px-3 py-2 text-sm 
                       bg-primary hover:bg-secondary cursor-pointer text-white rounded-lg"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 
                       bg-primary hover:bg-secondary cursor-pointer text-white 
                       px-3 py-2 rounded-lg text-sm"
          >
            <Plus size={16} />
            Add Policy
          </button>
        </div>
      </div>

      {/* ---------- List ---------- */}
      <div className="px-4 pb-6">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : policies.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center 
                py-10 px-6 rounded-2xl 
                bg-gradient-to-br from-white to-gray-50 
                border border-gray-100 shadow-sm"
          >
            {/* Illustration */}
            <img
              src={assets.NoData}
              alt="No Late Policies"
              className="w-56 mb-6 opacity-90"
            />

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Late Policies Found
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 max-w-md text-center leading-relaxed">
              Create late policies to automatically handle employee late
              arrivals, apply grace time, fines, leave deductions, or make-up
              hours.
            </p>

            {/* CTA */}
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 
               bg-primary hover:bg-secondary 
               text-white px-6 py-2.5 
               rounded-full text-sm font-medium 
               shadow hover:shadow-md 
               transition-all duration-200"
            >
              <Plus size={16} />
              Create Late Policy
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {policies.map((p) => (
              <div
                key={p.latePolicyId}
                className="rounded-2xl bg-gradient-to-br from-white to-gray-50 
                           shadow-sm hover:shadow-lg hover:-translate-y-0.5 
                           transition-all duration-300 
                           p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Title */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-sm text-gray-900">
                      {p.policyName}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Description */}
                  {p.description && (
                    <p className="text-sm text-gray-600 mb-3 leading-snug line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Core Info */}
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium text-gray-800">
                        Effective:
                      </span>{" "}
                      {new Date(p.effectiveFrom).toLocaleDateString("en-GB")}
                      {" → "}
                      {p.effectiveTo
                        ? new Date(p.effectiveTo).toLocaleDateString("en-GB")
                        : "Open"}
                    </p>

                    <p>
                      <span className="font-medium text-gray-800">Grace:</span>{" "}
                      {p.graceMinutesPerDay} mins/day ({p.maxGraceOccurrences}{" "}
                      times)
                    </p>

                    <p>
                      <span className="font-medium text-gray-800">
                        Late Threshold:
                      </span>{" "}
                      {p.lateThresholdMinutes} mins
                    </p>

                    <p>
                      <span className="font-medium text-gray-800">
                        Max Late / Month:
                      </span>{" "}
                      {p.maxLateAllowedPerMonth}
                    </p>
                  </div>

                  {/* Rules */}
                  <div className="mt-4">
                    <p className="font-semibold text-sm mb-2 text-gray-800">
                      Resolution Rules
                    </p>

                    <ul className="space-y-1 text-sm text-gray-700">
                      {p.resolutionRules
                        ?.sort((a, b) => a.priority - b.priority)
                        .map((r, idx) => (
                          <li
                            key={idx}
                            className="flex gap-2 items-start 
                                       bg-white/80 rounded-md px-2 py-1"
                          >
                            <span className="w-1.5 h-1.5 mt-2 rounded-full bg-primary" />
                            {formatRule(r)}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 flex justify-end">
                  <button
                    onClick={() => handleEdit(p)}
                    className="group flex items-center gap-1.5 
                               px-3 py-1.5 rounded-full 
                               text-sm font-medium 
                               text-primary bg-primary/10 
                               hover:bg-primary hover:text-white 
                               transition-all duration-200 cursor-pointer"
                  >
                    <Edit
                      size={14}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Modal ---------- */}
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
