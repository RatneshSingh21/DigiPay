import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import LeavePolicyForm from "./LeavePolicyForm";
import { FiEdit2, FiPlus, FiRefreshCw } from "react-icons/fi";
import assets from "../../../../assets/assets";

const Field = ({ label, value }) => (
  <div className="flex justify-between border-b pb-1">
    <span className="font-semibold text-gray-600">{label}:</span>
    <span className="text-gray-800">{value || "-"}</span>
  </div>
);

const LeavePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch Leave Policies
  const fetchPolicies = async () => {
    try {
      const res = await axiosInstance.get("/LeavePolicy/all");
      if (res.data?.data) {
        setPolicies(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching leave policies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openAddForm = () => {
    setEditData(null);
    setShowForm(true);
  };

  const openEditForm = (policy) => {
    setEditData(policy);
    setShowForm(true);
  };

  return (
    <>
      {/* ---------- Header with Add Button ---------- */}
      <div className="sticky top-14 bg-white shadow-sm px-4 py-2 mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Leave Policies</h2>
        <div className="flex gap-2 text-sm">
          <button
            onClick={fetchPolicies}
            className="flex items-center cursor-pointer gap-2 border px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700"
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={openAddForm}
            className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md"
          >
            <FiPlus size={18} />
            Add Policy
          </button>
        </div>
      </div>

      {/* ---------- Popup Modal ---------- */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <div className="bg-white max-w-3xl max-h-[85vh] overflow-y-auto rounded-lg shadow-lg p-4">
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

      {/* ---------- Loading State ---------- */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : policies.length === 0 ? (
        // ---------- Empty Illustration ----------
        <div className="flex flex-col items-center mt-10">
          <img src={assets.NoData} alt="No Data" className="w-60 opacity-80" />
          <p className="text-gray-600 mt-4 text-lg">No Leave Policies Found</p>
        </div>
      ) : (
        // ---------- Card Layout ----------
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 text-xs">
          {policies.map((policy) => (
            <div
              key={policy.leavePolicyId}
              className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{policy.policyName}</h3>
                  <p className="text-gray-600 text-sm">{policy.description}</p>
                </div>

                <FiEdit2
                  onClick={() => openEditForm(policy)}
                  className="text-blue-600 cursor-pointer text-xl"
                  title="Edit"
                />
              </div>

              {/* ---------- Show ALL API Fields in 2-Column Table ---------- */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-gray-700 text-sm">
                <Field
                  label="Effective From"
                  value={
                    policy.effectiveFrom
                      ? new Date(policy.effectiveFrom).toLocaleDateString(
                          "en-GB"
                        )
                      : "-"
                  }
                />
                <Field
                  label="Effective To"
                  value={
                    policy.effectiveTo
                      ? new Date(policy.effectiveTo).toLocaleDateString("en-GB")
                      : "-"
                  }
                />
                <Field
                  label="Status"
                  value={policy.isActive ? "Active" : "Inactive"}
                />

                <Field
                  label="Leave Types"
                  value={policy.applicableLeaveTypeIds.join(", ")}
                />
                <Field
                  label="Holiday Lists"
                  value={policy.applicableHolidayListIds.join(", ")}
                />
                <Field
                  label="Weekend Policies"
                  value={policy.applicableWeekendPolicyIds.join(", ")}
                />
                <Field
                  label="Departments"
                  value={policy.applicableDepartmentIds.join(", ")}
                />
                <Field
                  label="Designations"
                  value={policy.applicableDesignationIds.join(", ")}
                />
                <Field
                  label="Grades"
                  value={policy.applicableGradeIds.join(", ")}
                />
                <Field
                  label="Roles"
                  value={policy.applicableRoleIds.join(", ")}
                />
                <Field
                  label="Work Locations"
                  value={policy.applicableWorkLocationIds.join(", ")}
                />
                <Field
                  label="Shifts"
                  value={policy.applicableShiftIds.join(", ")}
                />
                <Field
                  label="Employment Types"
                  value={policy.applicableEmploymentTypeIds.join(", ")}
                />

                <Field
                  label="Allow Backdated Leave"
                  value={policy.allowBackdatedLeave ? "Yes" : "No"}
                />
                <Field
                  label="Backdated Limit (Days)"
                  value={policy.backdatedLimitInDays}
                />

                <Field
                  label="Allow Future Leave"
                  value={policy.allowFutureDatedLeave ? "Yes" : "No"}
                />
                <Field
                  label="Future Limit (Days)"
                  value={policy.futureDatedLimitInDays}
                />

                <Field
                  label="Min Notice Period"
                  value={policy.minNoticePeriodInDays}
                />
                <Field
                  label="Max Days / Application"
                  value={policy.maxDaysPerApplication}
                />
                <Field
                  label="Min Days / Application"
                  value={policy.minDaysPerApplication}
                />

                <Field
                  label="Allow Mixed Leave Types"
                  value={
                    policy.allowMixedLeaveTypesInSingleApplication
                      ? "Yes"
                      : "No"
                  }
                />
                <Field
                  label="Include Holidays"
                  value={policy.includeHolidaysInLeaveCount ? "Yes" : "No"}
                />
                <Field
                  label="Include Weekends"
                  value={policy.includeWeekendsInLeaveCount ? "Yes" : "No"}
                />

                <Field
                  label="Leave During Notice Period"
                  value={policy.allowLeaveDuringNoticePeriod ? "Yes" : "No"}
                />
                <Field
                  label="Block If Attendance Missing"
                  value={policy.blockLeaveIfAttendanceMissing ? "Yes" : "No"}
                />

                <Field
                  label="Min Service Months Required"
                  value={policy.minServiceMonthsRequired}
                />
                <Field
                  label="Allow Half Day"
                  value={policy.allowHalfDayLeave ? "Yes" : "No"}
                />
                <Field
                  label="Half Day Cutoff"
                  value={policy.halfDayCutoffTime}
                />

                <Field
                  label="Document Required After Days"
                  value={policy.documentRequiredAfterDays}
                />
                <Field
                  label="Document For Half Day"
                  value={policy.requireDocumentForHalfDay ? "Yes" : "No"}
                />
                <Field
                  label="Document For LOP"
                  value={policy.requireDocumentForLOP ? "Yes" : "No"}
                />

                <Field
                  label="Auto Deduct Unapproved"
                  value={policy.autoDeductForUnapprovedAbsence ? "Yes" : "No"}
                />
                <Field
                  label="Auto Deduct Priority"
                  value={policy.autoDeductPriority.join(", ")}
                />

                <Field
                  label="Convert Excess Leave to LOP"
                  value={policy.autoConvertExcessLeaveToLOP ? "Yes" : "No"}
                />

                <Field
                  label="Comp Off Enabled"
                  value={policy.compOffEnabled ? "Yes" : "No"}
                />
                <Field
                  label="Comp Off Expiry (Days)"
                  value={policy.compOffExpiryInDays}
                />
                <Field
                  label="Comp Off on Holiday"
                  value={policy.allowCompOffOnHoliday ? "Yes" : "No"}
                />
                <Field
                  label="Comp Off on Weekend"
                  value={policy.allowCompOffOnWeekend ? "Yes" : "No"}
                />

                <Field
                  label="Created On"
                  value={
                    policy.createdOn
                      ? new Date(policy.createdOn).toLocaleDateString("en-GB")
                      : "-"
                  }
                />
                <Field label="Created By" value={policy.createdBy} />

                {policy.updatedOn && (
                  <>
                    <Field
                      label="Updated On"
                      value={
                        policy.updatedOn
                          ? new Date(policy.updatedOn).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"
                      }
                    />
                    <Field label="Updated By" value={policy.updatedBy} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default LeavePolicy;
