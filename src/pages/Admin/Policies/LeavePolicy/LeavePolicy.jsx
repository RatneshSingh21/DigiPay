import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import LeavePolicyForm from "./LeavePolicyForm";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import assets from "../../../../assets/assets";
import { Edit } from "lucide-react";

/* ================= HELPERS ================= */

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

const YesNo = ({ v }) => (
  <span
    className={`text-xs font-semibold ${
      v ? "text-green-600" : "text-gray-400"
    }`}
  >
    {v ? "Yes" : "No"}
  </span>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between text-xs py-0.5">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium text-right">{value ?? "-"}</span>
  </div>
);

/* ================= MAIN ================= */
const groupBlackoutDates = (blackouts = []) => {
  const map = {};

  blackouts.forEach((b) => {
    const key = `${b.title}_${b.fromDate}_${b.toDate}`;

    if (!map[key]) {
      map[key] = {
        title: b.title,
        fromDate: b.fromDate,
        toDate: b.toDate,
        count: 0,
      };
    }

    map[key].count += 1;
  });

  return Object.values(map);
};
const LeavePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ---------- DATA ---------- */

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

  useEffect(() => {
    fetchPolicies();
    axiosInstance.get("/LeaveType").then((res) => {
      setLeaveTypes(res.data || []);
    });
  }, []);

  const leaveTypeMap = useMemo(() => {
    const map = {};
    leaveTypes.forEach((lt) => {
      map[lt.leaveTypeId] = `${lt.leaveName} (${lt.leaveCode})`;
    });
    return map;
  }, [leaveTypes]);

  /* ================= UI ================= */

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="sticky top-14 z-10 bg-white px-5 py-3 mb-6 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Leave Policies</h2>

        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
            className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-xs rounded-md bg-primary text-white hover:bg-secondary"
          >
            <FiPlus size={14} />
            Add Policy
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm z-[50] flex items-center justify-center">
          {/* Modal */}
          <div className="relative bg-white w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-xl p-4 shadow-xl">
            <LeavePolicyForm
              policyId={editData?.leavePolicyId || null}
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                fetchPolicies();
              }}
            />
          </div>
        </div>
      )}

      {/* ================= STATES ================= */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading leave policies…
        </div>
      ) : policies.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <img src={assets.NoData} className="w-56 mb-4" />
          <p className="text-sm text-gray-500">No leave policies found</p>
        </div>
      ) : (
        <div className="flex gap-5 px-5 pb-6 overflow-x-auto">
          {policies.map((p) => (
            <div
              key={p.leavePolicyId}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition min-w-[300px]"
            >
              {/* ================= TITLE ================= */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {p.policyName}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditData(p);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary hover:text-white transition cursor-pointer"
                >
                  <Edit size={12} /> Edit
                </button>
              </div>

              {/* ================= SUMMARY STRIP ================= */}
              <div className="mt-3 bg-blue-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
                <Row
                  label="Status"
                  value={
                    p.isActive ? (
                      <span className="text-green-700 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Inactive
                      </span>
                    )
                  }
                />
                <Row
                  label="Effective Period"
                  value={`${formatDate(p.effectiveFrom)} → ${formatDate(
                    p.effectiveTo,
                  )}`}
                />
                <Row
                  label="Leave Types"
                  value={p.leaveTypeRules?.length || 0}
                />
                <Row
                  label="Backdated Leave"
                  value={
                    p.allowBackdatedLeave
                      ? `Yes (≤ ${p.backdatedLimitInDays} days)`
                      : "No"
                  }
                />
                <Row
                  label="Future Dated Leave"
                  value={
                    p.allowFutureDatedLeave
                      ? `Yes (≤ ${p.futureDatedLimitInDays} days)`
                      : "No"
                  }
                />
              </div>

              {/* ================= LEAVE RULES ================= */}
              {p.leaveTypeRules?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                    Leave Rules
                  </h4>

                  <div className="space-y-2">
                    {p.leaveTypeRules.map((r) => (
                      <div
                        key={r.policyLeaveTypeRuleId}
                        className="rounded-lg bg-gray-50 p-3 text-xs"
                      >
                        <div className="font-semibold text-gray-800 mb-1">
                          {leaveTypeMap[r.leaveTypeId] ||
                            `Leave #${r.leaveTypeId}`}
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <Row label="Max / Year" value={r.maxLeavesPerYear} />
                          <Row
                            label="Per Application"
                            value={`${r.minDaysPerApplication} – ${r.maxDaysPerApplication}`}
                          />
                          <Row
                            label="Eligibility"
                            value={
                              r.minServiceMonthsRequired
                                ? `${r.minServiceMonthsRequired} months`
                                : "Immediate"
                            }
                          />
                          <Row
                            label="Half Day"
                            value={<YesNo v={r.allowHalfDay} />}
                          />
                          <Row
                            label="Weekends Counted"
                            value={<YesNo v={r.includeWeekends} />}
                          />
                          <Row
                            label="Holidays Counted"
                            value={<YesNo v={r.includeHolidays} />}
                          />
                          <Row
                            label="Carry Forward"
                            value={
                              r.isCarryForwardAllowed
                                ? `Yes (≤ ${r.carryForwardLimit})`
                                : "No"
                            }
                          />
                          <Row
                            label="Document Required"
                            value={
                              r.isDocumentRequired
                                ? `After ${r.documentRequiredAfterDays} days`
                                : "No"
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= COMP OFF ================= */}
              {p.compOffRule?.isEnabled && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                    Comp Off
                  </h4>
                  <div className="rounded-lg bg-green-50 p-3 text-xs">
                    <Row
                      label="Expiry"
                      value={`${p.compOffRule.expiryInDays} days`}
                    />
                    <Row
                      label="On Holidays"
                      value={<YesNo v={p.compOffRule.allowOnHoliday} />}
                    />
                    <Row
                      label="On Weekends"
                      value={<YesNo v={p.compOffRule.allowOnWeekend} />}
                    />
                  </div>
                </div>
              )}

              {/* ================= BLACKOUT DATES ================= */}
              {p.blackoutDates?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-red-700 mb-2">
                    Blackout Periods
                  </h4>

                  <div className="space-y-2">
                    {groupBlackoutDates(p.blackoutDates).map((b, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs"
                      >
                        <div className="font-semibold text-red-800 flex items-center gap-2">
                          ⛔ {b.title}
                        </div>

                        <div className="mt-1 text-gray-700">
                          <span className="font-medium">Period:</span>{" "}
                          {formatDate(b.fromDate)} → {formatDate(b.toDate)}
                        </div>

                        {b.count > 1 && (
                          <div className="mt-1 text-[11px] text-gray-500 italic">
                            Applies to multiple leave types
                          </div>
                        )}
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
