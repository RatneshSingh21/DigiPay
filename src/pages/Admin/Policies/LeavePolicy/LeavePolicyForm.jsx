import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";

import LeaveRuleCard from "./LeaveRuleCard";
import { normalizeLeaveTypeKey } from "./normalizeLeaveTypeKey";
import { LEAVE_TYPE_CAPABILITIES } from "./leaveTypeCapabilities";

const LeavePolicyForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("policy");

  /* ================= MASTER DATA ================= */
  const [leaveTypes, setLeaveTypes] = useState([]);

  /* ================= POLICY ================= */
  const [policy, setPolicy] = useState({
    policyName: "",
    description: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
    departmentId: 0,
    designationId: 0,
    gradeId: 0,
    roleId: 0,
    workLocationId: 0,
    shiftId: 0,
    employmentTypeId: 0,
    allowBackdatedLeave: false,
    backdatedLimitInDays: 0,
    allowFutureDatedLeave: false,
    futureDatedLimitInDays: 0,
    minNoticePeriodInDays: 0,
    allowMixedLeaveTypes: false,
    blockLeaveIfAttendanceMissing: false,
  });

  /* ================= LEAVE RULES ================= */
  const [selectedLeaveTypeIds, setSelectedLeaveTypeIds] = useState([]);
  const [leaveRules, setLeaveRules] = useState({});

  /* ================= COMP OFF ================= */
  const [compOffRule, setCompOffRule] = useState({
    isEnabled: false,
    expiryInDays: 0,
    allowOnHoliday: false,
    allowOnWeekend: false,
  });

  /* ================= ENCASHMENT ================= */
  const [encashmentRules, setEncashmentRules] = useState([]);

  /* ================= ACCRUAL ================= */
  const [accrualRules, setAccrualRules] = useState([]);

  /* ================= CARRY FORWARD ================= */
  const [carryForwardRules, setCarryForwardRules] = useState([]);

  /* ================= BLACKOUT DATES ================= */
  const [blackoutDates, setBlackoutDates] = useState([]);

  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    axiosInstance
      .get("/LeaveType")
      .then((res) => setLeaveTypes(res.data || []));
  }, []);

  /* ================= HELPERS ================= */
  const createEmptyRule = (leave) => {
    const typeKey = normalizeLeaveTypeKey(leave);
    const caps = LEAVE_TYPE_CAPABILITIES[typeKey] || {};

    return {
      leaveTypeId: leave.leaveTypeId,
      maxLeavesPerYear: 0,
      maxDaysPerApplication: 0,
      minDaysPerApplication: 0,
      minServiceMonthsRequired: 0,
      includeWeekends: !!caps.includeWeekends,
      includeHolidays: !!caps.includeHolidays,
      allowHalfDay: false,
      halfDayCutoffTime: null,
      isCarryForwardAllowed: false,
      carryForwardLimit: 0,
      isDocumentRequired: !!caps.documentRequired,
      documentRequiredAfterDays: 0,
      allowDuringNoticePeriod: true,
      genderRestriction: caps.genderRestriction || null,
    };
  };

  const toggleLeaveType = (leave) => {
    const id = leave.leaveTypeId;
    setSelectedLeaveTypeIds((prev) => {
      if (prev.includes(id)) {
        const updated = { ...leaveRules };
        delete updated[id];
        setLeaveRules(updated);
        return prev.filter((x) => x !== id);
      }
      setLeaveRules((r) => ({ ...r, [id]: createEmptyRule(leave) }));
      return [...prev, id];
    });
  };

  const updateRule = (leaveTypeId, key, value) => {
    setLeaveRules((r) => ({
      ...r,
      [leaveTypeId]: { ...r[leaveTypeId], [key]: value },
    }));
  };

  const submit = async () => {
    if (!policy.policyName || !policy.effectiveFrom) {
      toast.error("Policy name and Effective From are required");
      return;
    }

    setLoading(true);

    const payload = {
      ...policy,
      effectiveFrom: new Date(policy.effectiveFrom).toISOString(),
      effectiveTo: policy.effectiveTo
        ? new Date(policy.effectiveTo).toISOString()
        : null,
      leaveTypeRules: selectedLeaveTypeIds.length
        ? Object.values(leaveRules)
        : [],
      compOffRule: compOffRule.isEnabled ? compOffRule : null,
      encashmentRules: encashmentRules.length ? encashmentRules : [],
      accrualRules: accrualRules.length ? accrualRules : [],
      carryForwardRules: carryForwardRules.length ? carryForwardRules : [],
      blackoutDates: blackoutDates.length ? blackoutDates : [],
    };

    try {
      await axiosInstance.post("/LeavePolicy/create", payload);
      toast.success("Leave policy created successfully");
      onSuccess?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create policy");
    }

    setLoading(false);
  };

  /* ================= TAB CONTENT ================= */
  const renderTabContent = () => {
    switch (activeTab) {
      case "policy":
        return (
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Policy Name"
              className="border p-2 rounded"
              value={policy.policyName}
              onChange={(e) =>
                setPolicy({ ...policy, policyName: e.target.value })
              }
            />
            <input
              placeholder="Description"
              className="border p-2 rounded"
              value={policy.description}
              onChange={(e) =>
                setPolicy({ ...policy, description: e.target.value })
              }
            />
            <input
              type="datetime-local"
              className="border p-2 rounded"
              value={policy.effectiveFrom}
              onChange={(e) =>
                setPolicy({ ...policy, effectiveFrom: e.target.value })
              }
            />
            <input
              type="datetime-local"
              className="border p-2 rounded"
              value={policy.effectiveTo}
              onChange={(e) =>
                setPolicy({ ...policy, effectiveTo: e.target.value })
              }
            />
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={policy.isActive}
                onChange={(e) =>
                  setPolicy({ ...policy, isActive: e.target.checked })
                }
              />
              Is Active
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={policy.allowBackdatedLeave}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    allowBackdatedLeave: e.target.checked,
                  })
                }
              />
              Allow Backdated Leave
            </label>
            <input
              type="number"
              placeholder="Backdated Limit (days)"
              className="border p-2 rounded"
              value={policy.backdatedLimitInDays}
              onChange={(e) =>
                setPolicy({ ...policy, backdatedLimitInDays: +e.target.value })
              }
            />
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={policy.allowFutureDatedLeave}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    allowFutureDatedLeave: e.target.checked,
                  })
                }
              />
              Allow Future Dated Leave
            </label>
            <input
              type="number"
              placeholder="Future Dated Limit (days)"
              className="border p-2 rounded"
              value={policy.futureDatedLimitInDays}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  futureDatedLimitInDays: +e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Min Notice Period (days)"
              className="border p-2 rounded"
              value={policy.minNoticePeriodInDays}
              onChange={(e) =>
                setPolicy({ ...policy, minNoticePeriodInDays: +e.target.value })
              }
            />
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={policy.allowMixedLeaveTypes}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    allowMixedLeaveTypes: e.target.checked,
                  })
                }
              />
              Allow Mixed Leave Types
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={policy.blockLeaveIfAttendanceMissing}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    blockLeaveIfAttendanceMissing: e.target.checked,
                  })
                }
              />
              Block Leave If Attendance Missing
            </label>
          </div>
        );
      case "leave":
        return (
          <>
            <h3 className="font-semibold mb-2">Applicable Leave Types</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {leaveTypes.map((lt) => (
                <label key={lt.leaveTypeId} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={selectedLeaveTypeIds.includes(lt.leaveTypeId)}
                    onChange={() => toggleLeaveType(lt)}
                  />
                  {lt.leaveName}
                </label>
              ))}
            </div>
            {selectedLeaveTypeIds.map((id) => {
              const leave = leaveTypes.find((l) => l.leaveTypeId === id);
              const rule = leaveRules[id];
              return (
                <LeaveRuleCard
                  key={id}
                  leave={leave}
                  rule={rule}
                  onChange={(k, v) => updateRule(id, k, v)}
                  caps={
                    LEAVE_TYPE_CAPABILITIES[normalizeLeaveTypeKey(leave)] || {}
                  }
                />
              );
            })}
          </>
        );
      case "compOff":
        return (
          <div>
            <label className="flex gap-2 items-center mb-2">
              <input
                type="checkbox"
                checked={compOffRule.isEnabled}
                onChange={(e) =>
                  setCompOffRule({
                    ...compOffRule,
                    isEnabled: e.target.checked,
                  })
                }
              />
              Enable Comp Off
            </label>
            {compOffRule.isEnabled && (
              <div className="grid grid-cols-3 gap-3 mt-2">
                <input
                  type="number"
                  placeholder="Expiry Days"
                  className="border p-2 rounded"
                  value={compOffRule.expiryInDays}
                  onChange={(e) =>
                    setCompOffRule({
                      ...compOffRule,
                      expiryInDays: +e.target.value,
                    })
                  }
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compOffRule.allowOnHoliday}
                    onChange={(e) =>
                      setCompOffRule({
                        ...compOffRule,
                        allowOnHoliday: e.target.checked,
                      })
                    }
                  />
                  Holiday
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compOffRule.allowOnWeekend}
                    onChange={(e) =>
                      setCompOffRule({
                        ...compOffRule,
                        allowOnWeekend: e.target.checked,
                      })
                    }
                  />
                  Weekend
                </label>
              </div>
            )}
          </div>
        );
      case "encashment":
        return (
         <div>
  <h3 className="font-semibold mb-2">Encashment Rules</h3>
  <button
    className="mb-2 bg-green-600 text-white px-3 py-1 rounded"
    onClick={() =>
      setEncashmentRules([
        ...encashmentRules,
        {
          leaveTypeId: 0,
          isEncashmentAllowed: true,
          maxEncashableDaysPerYear: 0,
          minBalanceRequired: 0,
          allowAtYearEnd: true,
          allowDuringResignation: true,
          allowDuringRetirement: true,
          encashmentCalculationType: "Fixed",
        },
      ])
    }
  >
    Add Rule
  </button>

  {encashmentRules.map((rule, index) => (
    <div key={index} className="grid grid-cols-4 gap-3 mb-2 items-center">
      <select
        className="border p-2 rounded"
        value={rule.leaveTypeId}
        onChange={(e) =>
          setEncashmentRules((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, leaveTypeId: +e.target.value } : r
            )
          )
        }
      >
        <option value={0}>Select Leave Type</option>
        {leaveTypes.map((lt) => (
          <option key={lt.leaveTypeId} value={lt.leaveTypeId}>
            {lt.leaveName}
          </option>
        ))}
      </select>
      <input
        type="number"
        className="border p-2 rounded"
        placeholder="Max Encashable Days"
        value={rule.maxEncashableDaysPerYear}
        onChange={(e) =>
          setEncashmentRules((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, maxEncashableDaysPerYear: +e.target.value } : r
            )
          )
        }
      />
      <input
        type="number"
        className="border p-2 rounded"
        placeholder="Min Balance Required"
        value={rule.minBalanceRequired}
        onChange={(e) =>
          setEncashmentRules((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, minBalanceRequired: +e.target.value } : r
            )
          )
        }
      />
      <button
        className="bg-red-600 text-white px-3 py-1 rounded"
        onClick={() =>
          setEncashmentRules((prev) => prev.filter((_, i) => i !== index))
        }
      >
        Remove
      </button>
    </div>
  ))}
</div>
        );
      case "accrual":
        return (<div>
  <h3 className="font-semibold mb-2">Accrual Rules</h3>
  <button
    className="mb-2 bg-green-600 text-white px-3 py-1 rounded"
    onClick={() =>
      setAccrualRules([
        ...accrualRules,
        {
          leaveTypeId: 0,
          policyCode: "",
          frequency: "Daily",
          accrualValue: 0,
          prorateOnJoin: true,
          prorateOnLeave: true,
          accrualStartsAfterServiceMonths: 0,
          effectiveFrom: "",
          effectiveTo: "",
          extraJson: "",
        },
      ])
    }
  >
    Add Rule
  </button>

  {accrualRules.map((rule, index) => (
    <div key={index} className="grid grid-cols-3 gap-3 mb-2 items-center">
      <select
        className="border p-2 rounded"
        value={rule.leaveTypeId}
        onChange={(e) =>
          setAccrualRules((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, leaveTypeId: +e.target.value } : r
            )
          )
        }
      >
        <option value={0}>Select Leave Type</option>
        {leaveTypes.map((lt) => (
          <option key={lt.leaveTypeId} value={lt.leaveTypeId}>
            {lt.leaveName}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Policy Code"
        className="border p-2 rounded"
        value={rule.policyCode}
        onChange={(e) =>
          setAccrualRules((prev) =>
            prev.map((r, i) => (i === index ? { ...r, policyCode: e.target.value } : r))
          )
        }
      />

      <input
        type="number"
        placeholder="Accrual Value"
        className="border p-2 rounded"
        value={rule.accrualValue}
        onChange={(e) =>
          setAccrualRules((prev) =>
            prev.map((r, i) => (i === index ? { ...r, accrualValue: +e.target.value } : r))
          )
        }
      />

      <input
        type="datetime-local"
        placeholder="Effective From"
        className="border p-2 rounded"
        value={rule.effectiveFrom}
        onChange={(e) =>
          setAccrualRules((prev) =>
            prev.map((r, i) => (i === index ? { ...r, effectiveFrom: e.target.value } : r))
          )
        }
      />

      <input
        type="datetime-local"
        placeholder="Effective To"
        className="border p-2 rounded"
        value={rule.effectiveTo}
        onChange={(e) =>
          setAccrualRules((prev) =>
            prev.map((r, i) => (i === index ? { ...r, effectiveTo: e.target.value } : r))
          )
        }
      />

      <button
        className="bg-red-600 text-white px-3 py-1 rounded"
        onClick={() => setAccrualRules((prev) => prev.filter((_, i) => i !== index))}
      >
        Remove
      </button>
    </div>
  ))}
</div>
);
      case "carryForward":
        return (
          <div>
  <h3 className="font-semibold mb-2">Carry Forward Rules</h3>
  <button
    className="mb-2 bg-green-600 text-white px-3 py-1 rounded"
    onClick={() =>
      setCarryForwardRules([
        ...carryForwardRules,
        {
          leaveTypeId: 0,
          allowCarryForward: true,
          maxCarryForwardDays: 0,
          carryForwardExpiryInMonths: 0,
          carryForwardProrated: true,
          conditionsJson: "",
        },
      ])
    }
  >
    Add Rule
  </button>

  {carryForwardRules.map((rule, index) => (
    <div key={index} className="grid grid-cols-4 gap-3 mb-2 items-center">
      <select
        className="border p-2 rounded"
        value={rule.leaveTypeId}
        onChange={(e) =>
          setCarryForwardRules((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, leaveTypeId: +e.target.value } : r
            )
          )
        }
      >
        <option value={0}>Select Leave Type</option>
        {leaveTypes.map((lt) => (
          <option key={lt.leaveTypeId} value={lt.leaveTypeId}>
            {lt.leaveName}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Max Carry Forward Days"
        className="border p-2 rounded"
        value={rule.maxCarryForwardDays}
        onChange={(e) =>
          setCarryForwardRules((prev) =>
            prev.map((r, i) => (i === index ? { ...r, maxCarryForwardDays: +e.target.value } : r))
          )
        }
      />

      <input
        type="number"
        placeholder="Carry Forward Expiry (months)"
        className="border p-2 rounded"
        value={rule.carryForwardExpiryInMonths}
        onChange={(e) =>
          setCarryForwardRules((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, carryForwardExpiryInMonths: +e.target.value } : r
            )
          )
        }
      />

      <button
        className="bg-red-600 text-white px-3 py-1 rounded"
        onClick={() =>
          setCarryForwardRules((prev) => prev.filter((_, i) => i !== index))
        }
      >
        Remove
      </button>
    </div>
  ))}
</div>
        );
      case "blackout":
        return (
          <div>
  <h3 className="font-semibold mb-2">Blackout Dates</h3>
  <button
    className="mb-2 bg-green-600 text-white px-3 py-1 rounded"
    onClick={() =>
      setBlackoutDates([
        ...blackoutDates,
        {
          title: "",
          fromDate: "",
          toDate: "",
          isFullBlock: true,
          applicableLeaveTypeIds: [],
          applicableDepartmentIds: [],
        },
      ])
    }
  >
    Add Blackout Date
  </button>

  {blackoutDates.map((b, index) => (
    <div key={index} className="grid grid-cols-3 gap-3 mb-2 items-center">
      <input
        type="text"
        placeholder="Title"
        className="border p-2 rounded"
        value={b.title}
        onChange={(e) =>
          setBlackoutDates((prev) =>
            prev.map((r, i) => (i === index ? { ...r, title: e.target.value } : r))
          )
        }
      />
      <input
        type="date"
        className="border p-2 rounded"
        value={b.fromDate}
        onChange={(e) =>
          setBlackoutDates((prev) =>
            prev.map((r, i) => (i === index ? { ...r, fromDate: e.target.value } : r))
          )
        }
      />
      <input
        type="date"
        className="border p-2 rounded"
        value={b.toDate}
        onChange={(e) =>
          setBlackoutDates((prev) =>
            prev.map((r, i) => (i === index ? { ...r, toDate: e.target.value } : r))
          )
        }
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={b.isFullBlock}
          onChange={(e) =>
            setBlackoutDates((prev) =>
              prev.map((r, i) => (i === index ? { ...r, isFullBlock: e.target.checked } : r))
            )
          }
        />
        Full Block
      </label>
      <button
        className="bg-red-600 text-white px-3 py-1 rounded"
        onClick={() => setBlackoutDates((prev) => prev.filter((_, i) => i !== index))}
      >
        Remove
      </button>
    </div>
  ))}
</div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-5 relative max-h-[85vh] overflow-y-auto">
      <button onClick={onClose} className="absolute right-4 top-4">
        <FiX size={20} />
      </button>

      <h2 className="text-xl font-semibold mb-4">Create Leave Policy</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {[
          "policy",
          "leave",
          "compOff",
          "encashment",
          "accrual",
          "carryForward",
          "blackout",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 ${
              activeTab === tab
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="border px-4 py-2 rounded">
          Cancel
        </button>
        <button
          disabled={loading}
          onClick={submit}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Saving..." : "Create Policy"}
        </button>
      </div>
    </div>
  );
};

export default LeavePolicyForm;
