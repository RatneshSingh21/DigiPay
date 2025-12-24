import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import LeavePolicyForm from "./LeavePolicyForm";
import { FiEdit2, FiPlus, FiRefreshCw } from "react-icons/fi";
import assets from "../../../../assets/assets";

/* ---------- Helpers ---------- */
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

const YesNo = ({ v }) => (
  <span
    className={`text-xs font-medium ${v ? "text-green-600" : "text-gray-400"}`}
  >
    {v ? "Yes" : "No"}
  </span>
);

/* ---------- Reusable Row ---------- */
const Row = ({ label, value }) => (
  <div className="flex justify-between py-0.5 text-xs">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium">{value ?? "-"}</span>
  </div>
);

/* ---------- Main Component ---------- */
const LeavePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/LeavePolicy/all");
      setPolicies(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const leaveTypeMap = React.useMemo(() => {
    const map = {};
    leaveTypes.forEach((lt) => {
      map[lt.leaveTypeId] = {
        name: lt.leaveName,
        code: lt.leaveCode,
      };
    });
    return map;
  }, [leaveTypes]);

  useEffect(() => {
    fetchPolicies();
    axiosInstance.get("/LeaveType").then((res) => {
      setLeaveTypes(res.data || []);
    });
  }, []);

  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="sticky top-14 z-10 bg-white px-5 py-3 mb-6 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Leave Policies</h2>

        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
            className="flex items-center gap-2 
                       px-3 py-1.5 text-xs rounded-lg 
                       bg-gray-100 cursor-pointer hover:bg-gray-200 
                       transition"
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 
                       px-3 py-1.5 text-xs rounded-lg 
                       bg-primary cursor-pointer hover:bg-secondary 
                       text-white transition"
          >
            <FiPlus size={14} />
            Add Policy
          </button>
        </div>
      </div>

      {/* ---------- Modal ---------- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-xl p-5 shadow-xl">
            <LeavePolicyForm
              initialData={editData}
              isEdit={!!editData}
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                fetchPolicies();
              }}
            />
          </div>
        </div>
      )}

      {/* ---------- Loading / Empty ---------- */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading leave policies…
        </div>
      ) : policies.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center 
                     py-12 px-6 mx-4 rounded-2xl 
                     bg-gradient-to-br from-white to-gray-50 
                     shadow-sm"
        >
          <img
            src={assets.NoData}
            alt="No Leave Policies"
            className="w-56 mb-6 opacity-90"
          />

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Leave Policies Found
          </h3>

          <p className="text-sm text-gray-600 mb-6 max-w-md text-center">
            Create leave policies to manage leave limits, carry forward,
            comp-off rules, and blackout dates.
          </p>

          <button
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 
                       bg-primary hover:bg-secondary 
                       text-white px-6 py-2 
                       rounded-full text-sm font-medium 
                       shadow hover:shadow-md transition"
          >
            <FiPlus size={16} />
            Create Leave Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-5 pb-6">
          {policies.map((p) => (
            <div
              key={p.leavePolicyId}
              className="bg-white rounded-2xl p-5 
                         shadow-sm hover:shadow-lg 
                         hover:-translate-y-0.5 
                         transition-all duration-300"
            >
              {/* ---------- Card Header ---------- */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {p.policyName}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <FiEdit2
                  className="cursor-pointer text-blue-600 hover:scale-110 transition"
                  onClick={() => {
                    setEditData(p);
                    setShowForm(true);
                  }}
                />
              </div>

              {/* ---------- Summary ---------- */}
              <div className="mt-3 space-y-0.5 text-xs">
                <Row
                  label="Status"
                  value={
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  }
                />
                <Row
                  label="Effective From"
                  value={formatDate(p.effectiveFrom)}
                />
                <Row label="Effective To" value={formatDate(p.effectiveTo)} />
              </div>

              {/* ---------- Leave Rules ---------- */}
              {p.leaveTypeRules?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                    Leave Rules
                  </h4>

                  <div className="space-y-2">
                    {p.leaveTypeRules.map((r) => (
                      <div
                        key={r.policyLeaveTypeRuleId}
                        className="rounded-lg bg-gray-50 p-2 text-xs"
                      >
                        <Row
                          label="Leave Type"
                          value={
                            leaveTypeMap[r.leaveTypeId]
                              ? `${leaveTypeMap[r.leaveTypeId].name} (${
                                  leaveTypeMap[r.leaveTypeId].code
                                })`
                              : `Leave #${r.leaveTypeId}`
                          }
                        />
                        <Row label="Max / Year" value={r.maxLeavesPerYear} />
                        <Row
                          label="Half Day"
                          value={<YesNo v={r.allowHalfDay} />}
                        />
                        <Row
                          label="Carry Forward"
                          value={<YesNo v={r.isCarryForwardAllowed} />}
                        />
                        <Row
                          label="Document Required"
                          value={<YesNo v={r.isDocumentRequired} />}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------- Comp Off ---------- */}
              {p.compOffRule && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                    Comp Off
                  </h4>
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Row
                      label="Enabled"
                      value={<YesNo v={p.compOffRule.isEnabled} />}
                    />
                    <Row
                      label="Expiry (Days)"
                      value={p.compOffRule.expiryInDays}
                    />
                    <Row
                      label="On Holiday"
                      value={<YesNo v={p.compOffRule.allowOnHoliday} />}
                    />
                    <Row
                      label="On Weekend"
                      value={<YesNo v={p.compOffRule.allowOnWeekend} />}
                    />
                  </div>
                </div>
              )}

              {/* ---------- Blackout ---------- */}
              {p.blackoutDates?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                    Blackout Dates
                  </h4>

                  <div className="space-y-2">
                    {p.blackoutDates.map((b) => (
                      <div
                        key={b.blackoutId}
                        className="rounded-lg bg-gray-50 p-2 text-xs"
                      >
                        <Row label="Title" value={b.title} />
                        <Row label="From" value={formatDate(b.fromDate)} />
                        <Row label="To" value={formatDate(b.toDate)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default LeavePolicy;
