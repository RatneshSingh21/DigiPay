import React, { useEffect, useState, useMemo } from "react";
import {
  CheckCircle,
  Pencil,
  Power,
  Plus,
  FileText,
  CheckCircle2,
} from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useCompanySalaryPolicy from "./useCompanySalaryPolicy";
import CompanySalaryPolicyFormModal from "./CompanySalaryPolicyFormModal";

export default function CompanySalaryPolicyPage() {
  const {
    policies,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    activatePolicy,
  } = useCompanySalaryPolicy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [defaultPolicies, setDefaultPolicies] = useState([]);
  const [dynamicPolicies, setDynamicPolicies] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  // structure: { type: "activate" | "delete", id: number }

  const onClose = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  /* ================= FETCH MASTER DATA ================= */

  useEffect(() => {
    const fetchDefaultPolicies = async () => {
      try {
        const res = await axiosInstance.get("/DefaultSalaryPolicy/all");
        setDefaultPolicies(res.data?.data || []);
      } catch (error) {
        console.log("Default policy fetch failed", error);
        setDefaultPolicies([]);
      }
    };

    const fetchDynamicPolicies = async () => {
      try {
        const res = await axiosInstance.get("/DynamicSalaryPolicy/company");
        setDynamicPolicies(res.data?.data || []);
      } catch (error) {
        console.log("Dynamic policy fetch failed", error);
        setDynamicPolicies([]);
      }
    };

    fetchDefaultPolicies();
    fetchDynamicPolicies();
  }, []);

  /* ================= HELPERS ================= */

  const getDefaultPolicyName = (id) => {
    if (!id) return "-";

    const policy = defaultPolicies.find((p) => p.id === id);

    if (!policy) return `Policy #${id}`;

    return `${policy.policyName} (v${policy.version})`;
  };
  const getDynamicPolicyName = (id) => {
    const policy = dynamicPolicies.find((p) => p.id === id);
    return policy ? `${policy.policyName} (v${policy.version})` : "-";
  };

  const activeCount = useMemo(
    () => policies.filter((p) => p.isActive).length,
    [policies],
  );

  const handleActivate = (id) => {
    setConfirmAction({ type: "activate", id });
  };

  const handleDelete = (id) => {
    setConfirmAction({ type: "delete", id });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "activate") {
      await activatePolicy(confirmAction.id);
    }

    if (confirmAction.type === "delete") {
      await deletePolicy(confirmAction.id);
    }

    setConfirmAction(null);
  };

  /* ================= UI ================= */

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-2.5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Company Salary Policies
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage salary execution configuration versions
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedPolicy(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-secondary text-sm text-white rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            Create Policy
          </button>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TOTAL POLICIES */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 font-medium">
                  Total Policies
                </div>

                <div className="text-3xl font-semibold text-gray-800">
                  {policies.length}
                </div>

                <div className="text-xs text-gray-400">
                  All configured salary versions
                </div>
              </div>

              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText size={22} />
              </div>
            </div>
          </div>

          {/* ACTIVE POLICIES */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 font-medium">
                  Active Policies
                </div>

                <div className="text-3xl font-semibold text-green-600">
                  {activeCount}
                </div>

                <div className="text-xs text-gray-400">
                  Currently applied versions
                </div>
              </div>

              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>
        {/* ================= POLICY LIST ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center text-gray-500 py-10">
              Loading policies...
            </div>
          ) : policies.length === 0 ? (
            <div className="col-span-2 bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-gray-500">
                No salary policies configured yet.
              </div>
            </div>
          ) : (
            policies.map((policy) => {
              const isActive = policy.isActive;

              return (
                <div
                  key={policy.id}
                  className={`bg-white rounded-xl shadow-sm transition-all duration-300 border p-6 ${isActive
                    ? "border-green-500 ring-2 ring-green-100"
                    : "border-gray-200 hover:shadow-md"
                    }`}
                >
                  {/* BADGES */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                      Version {policy.version}
                    </span>

                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${policy.policyMode === "Default"
                        ? "bg-blue-100 text-blue-700"
                        : policy.policyMode === "Dynamic"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                        }`}
                    >
                      {policy.policyMode}
                    </span>

                    {isActive && (
                      <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                        Active Policy
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="text-sm text-gray-600 space-y-2">
                    {policy.policyMode === "Default" && (
                      <div>
                        <span className="font-medium text-gray-800">
                          Default Policy:
                        </span>{" "}
                        {defaultPolicies.length
                          ? getDefaultPolicyName(policy.defaultPolicyId)
                          : "Loading..."}
                      </div>
                    )}

                    {policy.policyMode === "Dynamic" && (
                      <div>
                        <span className="font-medium text-gray-800">
                          Dynamic Policy:
                        </span>{" "}
                        {getDynamicPolicyName(policy.dynamicPolicyId)}
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-gray-800">
                        Created:
                      </span>{" "}
                      {new Date(policy.createdAt).toLocaleDateString("en-Gb")}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 pt-5 mt-5 border-t border-gray-200">
                    {!isActive && (
                      <button
                        onClick={() => handleActivate(policy.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                      >
                        <CheckCircle size={16} />
                        Activate
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                    >
                      <Power size={16} />
                      Deactivate
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <CompanySalaryPolicyFormModal
        isOpen={isModalOpen}
        onClose={onClose}
        onSubmit={async (data) => {
          if (selectedPolicy) {
            const success = await updatePolicy(selectedPolicy.id, data);
            if (success) onClose();
          } else {
            const success = await createPolicy(data);
            if (success) onClose();
          }
        }}
        initialData={selectedPolicy}
      />

      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30  backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Action
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              {confirmAction.type === "activate"
                ? "Are you sure you want to activate this policy?"
                : "Are you sure you want to deactivate this policy?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm border border-gray-200 bg-white hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={executeConfirmAction}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
