import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import axiosInstance from "../axiosInstance/axiosInstance";
import useAuthStore from "../store/authStore";

export default function CompanySwitchModal({
  isOpen,
  onClose,
  currentCompanyId,
}) {
  const [companies, setCompanies] = useState([]);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ companyName: "", companyCode: "" });

  const updateToken = useAuthStore((s) => s.updateToken);

  useEffect(() => {
    if (!isOpen) return;
    fetchCompanies();
    setShowAddForm(false);
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get("/Company/my");

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setCompanies(list);
    } catch (e) {
      console.error("Failed to load companies", e);
      setCompanies([]);
    }
  };

  const switchCompany = async (companyId) => {
    if (companyId === currentCompanyId) return;

    try {
      const res = await axiosInstance.post(
        `/Company/switch-company/${companyId}`
      );

      const token = res.data?.token;
      if (!token) return;

      updateToken(token);
      onClose();
    } catch (e) {
      console.error("Company switch failed", e);
    }
  };

  const addCompany = async () => {
    if (!form.companyName || !form.companyCode) return;

    try {
      setAdding(true);
      await axiosInstance.post("/Company/create-additional", form);
      setForm({ companyName: "", companyCode: "" });
      setShowAddForm(false);
      await fetchCompanies();
    } catch (e) {
      console.error("Add company failed", e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
          >
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold">
                {showAddForm ? "Add Company" : "Switch Company"}
              </h2>

              <button
                onClick={onClose}
                className="rounded-md p-1 cursor-pointer text-gray-500 hover:bg-red-200 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="px-5 py-4">
              {/* --------- COMPANY LIST --------- */}
              {!showAddForm && (
                <>
                  <div className="max-h-64 space-y-2 overflow-auto">
                    {companies.length === 0 && (
                      <div className="text-center text-sm text-gray-500 py-8">
                        No companies found
                      </div>
                    )}

                    {companies.map((c) => {
                      const active = c.companyId === currentCompanyId;

                      return (
                        <button
                          key={c.companyId}
                          onClick={() => switchCompany(c.companyId)}
                          className={`flex w-full items-center cursor-pointer justify-between rounded-lg border border-gray-200 px-3 py-3 text-left transition
                            ${
                              active
                                ? "border-primary bg-gray-100"
                                : "hover:bg-gray-50"
                            }`}
                        >
                          <div>
                            <div className="text-sm font-medium">
                              {c.companyName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.companyCode}
                            </div>
                          </div>

                          {active && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                              <Check size={14} /> Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 border-t border-gray-400 pt-4">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="w-full rounded-md border border-dashed cursor-pointer border-primary py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      + Add New Company
                    </button>
                  </div>
                </>
              )}

              {/* --------- ADD COMPANY --------- */}
              {showAddForm && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Company Name
                    </label>
                    <input
                      autoFocus
                      className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder="e.g. Acme Pvt Ltd"
                      value={form.companyName}
                      onChange={(e) =>
                        setForm({ ...form, companyName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Company Code
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder="e.g. ACME001"
                      value={form.companyCode}
                      onChange={(e) =>
                        setForm({ ...form, companyCode: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={addCompany}
                      disabled={adding}
                      className="flex-1 rounded-md bg-primary cursor-pointer py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {adding ? "Adding..." : "Save Company"}
                    </button>

                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 rounded-md border cursor-pointer py-2 text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
