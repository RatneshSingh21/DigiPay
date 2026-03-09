import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const policyModeOptions = [
  { value: 1, label: "Default Policy" },
  { value: 2, label: "Dynamic Policy" },
  { value: 3, label: "Compliance Policy" },
];

const defaultForm = {
  policyMode: 1,
  defaultPolicyId: null,
  dynamicPolicyId: null,
  complianceRuleSetId: null,
  activateNow: true,
};

export default function CompanySalaryPolicyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const [formData, setFormData] = useState(defaultForm);
  const [defaultPolicies, setDefaultPolicies] = useState([]);
  const [dynamicPolicies, setDynamicPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  /* ================= FETCH POLICIES ================= */

  useEffect(() => {
    if (!isOpen) return;

    const fetchPolicies = async () => {
      try {
        setLoadingPolicies(true);

        const [defaultRes, dynamicRes, activeDynamicRes] = await Promise.all([
          axiosInstance.get("/DefaultSalaryPolicy/all"),
          axiosInstance.get("/DynamicSalaryPolicy/company"),
          axiosInstance.get("/DynamicSalaryPolicy/active"),
        ]);

        /* ===== DEFAULT POLICIES ===== */
        const defaultOptions =
          defaultRes.data?.data?.map((p) => ({
            value: p.id,
            label: `${p.policyName} (v${p.version})`,
            isActive: p.isActive,
          })) || [];

        setDefaultPolicies(defaultOptions);

        /* ===== DYNAMIC POLICIES ===== */
        const dynamicOptions =
          dynamicRes.data?.data?.map((p) => ({
            value: p.id,
            label: `${p.policyName} (v${p.version})`,
            isActive: p.isActive,
          })) || [];

        setDynamicPolicies(dynamicOptions);

        /* ===== AUTO SELECT ACTIVE (CREATE MODE ONLY) ===== */
        if (!initialData) {
          const activeDefault = defaultOptions.find((p) => p.isActive);
          const activeDynamic = activeDynamicRes.data?.data;

          setFormData((prev) => ({
            ...prev,
            defaultPolicyId: activeDefault?.value || null,
            dynamicPolicyId: activeDynamic?.id || null,
          }));
        }
      } catch (err) {
        toast.error("Failed to fetch salary policies");
      } finally {
        setLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, [isOpen, initialData]);

  /* ================= INITIAL DATA ================= */

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData]);

  if (!isOpen) return null;

  /* ================= HELPERS ================= */

  const mapPolicyModeToString = (mode) => {
    switch (mode) {
      case 1:
        return "Default";
      case 2:
        return "Dynamic";
      case 3:
        return "Compliance";
      default:
        return "Default";
    }
  };

  const handleSubmit = () => {
    if (formData.policyMode === 1 && !formData.defaultPolicyId) {
      toast.warning("Please select a default policy");
      return;
    }

    if (formData.policyMode === 2 && !formData.dynamicPolicyId) {
      toast.warning("Please select a dynamic policy");
      return;
    }

    const payload = {
      ...formData,
      policyMode: mapPolicyModeToString(formData.policyMode),
    };

    onSubmit(payload);
  };

  /* ================= RENDER ================= */

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {initialData
                ? "Update Company Salary Policy"
                : "Create Company Salary Policy"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure how salaries are executed for this company
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} className="text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto space-y-6">
          {/* POLICY MODE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Policy Mode *
            </label>
            <Select
              options={policyModeOptions}
              value={policyModeOptions.find(
                (o) => o.value === formData.policyMode,
              )}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  policyMode: selected.value,
                  defaultPolicyId: null,
                  dynamicPolicyId: null,
                })
              }
              className="text-sm"
            />
          </div>

          {/* DEFAULT POLICY */}
          {formData.policyMode === 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Default Salary Policy
              </label>
              <Select
                isLoading={loadingPolicies}
                options={defaultPolicies}
                value={defaultPolicies.find(
                  (o) => o.value === formData.defaultPolicyId,
                )}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    defaultPolicyId: selected?.value || null,
                  })
                }
                placeholder="Choose default policy..."
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                formatOptionLabel={(option) => (
                  <div className="flex justify-between items-center">
                    <span>{option.label}</span>
                    {option.isActive && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          )}

          {/* DYNAMIC POLICY */}
          {formData.policyMode === 2 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Active Dynamic Salary Policy
              </label>
              <Select
                isLoading={loadingPolicies}
                options={dynamicPolicies}
                value={dynamicPolicies.find(
                  (o) => o.value === formData.dynamicPolicyId,
                )}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    dynamicPolicyId: selected?.value || null,
                  })
                }
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                formatOptionLabel={(option) => (
                  <div className="flex justify-between items-center">
                    <span>{option.label}</span>
                    {option.isActive && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          )}

          {/* ACTIVATE */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activateNow}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activateNow: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-200 text-indigo-600 focus:ring-indigo-500"
              />
              Activate Immediately
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t text-sm border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-secondary text-white shadow-md transition cursor-pointer"
          >
            {initialData ? "Update Policy" : "Create Policy"}
          </button>
        </div>
      </div>
    </div>
  );
}
