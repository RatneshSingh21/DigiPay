import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiInbox, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ConfirmModal from "../../../../components/ConfirmModal";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/* ===================== PILL ===================== */
const Pill = ({ label, color = "gray" }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[color]}`}
    >
      {label}
    </span>
  );
};

/* ===================== COMPONENT ===================== */
const WeekendPolicyList = ({
  weekendPolicy = [],
  fetchWeekendPolicy,
  setIsEdit,
  setSelectedWeekendPolicy,
  openModal,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/weekendPolicy/delete/${id}`);
      toast.success("Weekend policy deleted");
      fetchWeekendPolicy();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete policy");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const offDays = (policy) =>
    DAYS.filter((day) => policy[`${day.toLowerCase()}Off`]);

  const overrides = (policy) =>
    [
      policy.allowWeekendOverride && "Weekend",
      policy.allowShiftOverride && "Shift",
      policy.allowEmployeeOverride && "Employee",
    ].filter(Boolean);

  const saturdayOffs = (policy) =>
    [
      policy.firstSaturdayOff && "1st Sat",
      policy.secondSaturdayOff && "2nd Sat",
      policy.thirdSaturdayOff && "3rd Sat",
      policy.fourthSaturdayOff && "4th Sat",
      policy.fifthSaturdayOff && "5th Sat",
    ].filter(Boolean);

  if (!weekendPolicy.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] text-center text-gray-500 mx-6">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <FiInbox size={46} className="text-gray-400" />
        </div>

        <h3 className="text-sm font-semibold text-gray-700">
          No Weekend Policies Found
        </h3>

        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          Weekend policies have not been configured yet. Click{" "}
          <span className="text-primary font-medium">Add Weekend Policy</span>{" "}
          to create one.
        </p>

        {/* Optional CTA */}
        <button
          onClick={() => {
            setIsEdit("Add");
            setSelectedWeekendPolicy(null);
            openModal();
          }}
          className="mt-4 flex items-center cursor-pointer gap-1 bg-primary hover:bg-secondary text-white px-4 py-2 rounded text-xs"
        >
          <FiPlus size={14} /> Add Weekend Policy
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-4 my-4 md:mx-6 lg:mx-8">
      {weekendPolicy.map((policy) => (
        <div
          key={policy.weekendPolicyId}
          className="bg-white border border-gray-200 rounded-md shadow-sm"
        >
          {/* ================= HEADER ================= */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-400">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">
                {policy.policyName}
              </h3>
              <Pill
                label={policy.isActive ? "Active" : "Inactive"}
                color={policy.isActive ? "green" : "red"}
              />
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setIsEdit("Edit");
                  setSelectedWeekendPolicy(policy);
                  openModal();
                }}
                className="flex items-center gap-1 px-2.5 py-1 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-600 rounded text-xs"
              >
                <FiEdit2 size={12} /> Edit
              </button>
              <button
                onClick={() => setConfirmDeleteId(policy.weekendPolicyId)}
                className="flex items-center gap-1 px-2.5 py-1 cursor-pointer bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs"
              >
                <FiTrash2 size={12} /> Delete
              </button>
            </div>
          </div>

          {/* ================= BODY ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 text-xs">
            {/* -------- LEFT COLUMN -------- */}
            <div className="space-y-3">
              {/* Weekend Off */}
              <div>
                <p className="text-gray-500 font-medium mb-1">
                  Weekend Off Days
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {offDays(policy).length ? (
                    offDays(policy).map((day) => (
                      <Pill key={day} label={day} color="blue" />
                    ))
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </div>
              </div>

              {/* Half Day */}
              <div>
                <p className="text-gray-500 font-medium mb-1">
                  Half Day Configuration
                </p>
                {policy.isHalfDayApplicable ? (
                  <div className="flex flex-wrap gap-1.5">
                    <Pill label={`Yes (${policy.halfDayOn})`} color="yellow" />
                    <Pill
                      label={`${policy.halfDayStartTime} – ${policy.halfDayEndTime}`}
                    />
                  </div>
                ) : (
                  <Pill label="Not Applicable" />
                )}
              </div>

              {/* Overrides */}
              <div>
                <p className="text-gray-500 font-medium mb-1">
                  Overrides Allowed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {overrides(policy).length ? (
                    overrides(policy).map((o) => (
                      <Pill key={o} label={o} color="purple" />
                    ))
                  ) : (
                    <span className="text-gray-400">No overrides</span>
                  )}
                </div>
              </div>

              {/* Saturday Configuration */}
              <div>
                <p className="text-gray-500 font-medium mb-1">
                  Saturday Off Configuration
                </p>

                <div className="flex flex-wrap gap-1.5 mb-1">
                  <Pill
                    label={
                      policy.isAlternateSaturdayOff
                        ? "Alternate Saturday"
                        : "No Alternate"
                    }
                    color={policy.isAlternateSaturdayOff ? "yellow" : "gray"}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {saturdayOffs(policy).length ? (
                    saturdayOffs(policy).map((sat) => (
                      <Pill key={sat} label={sat} color="blue" />
                    ))
                  ) : (
                    <span className="text-gray-400">No Saturday off</span>
                  )}
                </div>
              </div>
            </div>

            {/* -------- RIGHT COLUMN -------- */}
            <div>
              <p className="text-gray-500 font-medium mb-2">
                Weekend Work Rules
              </p>

              {policy.weekendWorkRules.length === 0 ? (
                <p className="text-gray-400">No rules defined</p>
              ) : (
                <div className="space-y-2">
                  {policy.weekendWorkRules.map((rule) => (
                    <div
                      key={rule.weekendWorkRuleId}
                      className="bg-gray-50 border rounded p-3"
                    >
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Pill label={rule.workDay} color="blue" />
                        <Pill label={`Target: ${rule.targetType}`} />
                        <Pill
                          label={rule.isActive ? "Active" : "Inactive"}
                          color={rule.isActive ? "green" : "red"}
                        />
                        <Pill
                          label={
                            rule.isGovernmentApproved
                              ? "Govt Approved"
                              : "Not Govt Approved"
                          }
                          color={rule.isGovernmentApproved ? "green" : "red"}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                        <p>
                          <span className="font-medium">Target ID:</span>{" "}
                          {rule.targetId}
                        </p>
                        <p>
                          <span className="font-medium">Uses Shift:</span>{" "}
                          {rule.useShiftTiming ? "Yes" : "No"}
                        </p>
                        <p>
                          <span className="font-medium">Working Time:</span>{" "}
                          {rule.useShiftTiming
                            ? "As per shift"
                            : `${rule.startTime} – ${rule.endTime}`}
                        </p>
                        <p>
                          <span className="font-medium">Credit:</span>{" "}
                          {rule.workingDayCredit}
                        </p>
                        <p>
                          <span className="font-medium">Compensation:</span>{" "}
                          {rule.compensationType}
                        </p>
                        <p>
                          <span className="font-medium">Effective:</span>{" "}
                          {new Date(rule.effectiveFrom).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Weekend Policy?"
          message="This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default WeekendPolicyList;
