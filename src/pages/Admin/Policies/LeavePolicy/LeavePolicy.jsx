import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import LeavePolicyForm from "./LeavePolicyForm";
import { FiEdit2, FiPlus, FiRefreshCw } from "react-icons/fi";
import assets from "../../../../assets/assets";

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

              {/* ---------- Show ALL API Fields ---------- */}
              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Effective From:</strong> {policy.effectiveFrom}
                </p>
                <p>
                  <strong>Effective To:</strong> {policy.effectiveTo}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {policy.isActive ? "Active" : "Inactive"}
                </p>

                <p>
                  <strong>Leave Types:</strong>{" "}
                  {policy.applicableLeaveTypeIds.join(", ")}
                </p>
                <p>
                  <strong>Holiday Lists:</strong>{" "}
                  {policy.applicableHolidayListIds.join(", ")}
                </p>
                <p>
                  <strong>Weekend Policies:</strong>{" "}
                  {policy.applicableWeekendPolicyIds.join(", ")}
                </p>
                <p>
                  <strong>Departments:</strong>{" "}
                  {policy.applicableDepartmentIds.join(", ")}
                </p>
                <p>
                  <strong>Designations:</strong>{" "}
                  {policy.applicableDesignationIds.join(", ")}
                </p>
                <p>
                  <strong>Grades:</strong>{" "}
                  {policy.applicableGradeIds.join(", ")}
                </p>
                <p>
                  <strong>Roles:</strong> {policy.applicableRoleIds.join(", ")}
                </p>
                <p>
                  <strong>Work Locations:</strong>{" "}
                  {policy.applicableWorkLocationIds.join(", ")}
                </p>
                <p>
                  <strong>Shifts:</strong>{" "}
                  {policy.applicableShiftIds.join(", ")}
                </p>
                <p>
                  <strong>Employment Types:</strong>{" "}
                  {policy.applicableEmploymentTypeIds.join(", ")}
                </p>

                <p>
                  <strong>Allow Backdated Leave:</strong>{" "}
                  {policy.allowBackdatedLeave ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Backdated Limit (Days):</strong>{" "}
                  {policy.backdatedLimitInDays}
                </p>

                <p>
                  <strong>Allow Future Leave:</strong>{" "}
                  {policy.allowFutureDatedLeave ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Future Limit (Days):</strong>{" "}
                  {policy.futureDatedLimitInDays}
                </p>

                <p>
                  <strong>Min Notice Period:</strong>{" "}
                  {policy.minNoticePeriodInDays}
                </p>
                <p>
                  <strong>Max Days Per Application:</strong>{" "}
                  {policy.maxDaysPerApplication}
                </p>
                <p>
                  <strong>Min Days Per Application:</strong>{" "}
                  {policy.minDaysPerApplication}
                </p>

                <p>
                  <strong>Allow Mixed Leave Types:</strong>{" "}
                  {policy.allowMixedLeaveTypesInSingleApplication
                    ? "Yes"
                    : "No"}
                </p>
                <p>
                  <strong>Include Holidays:</strong>{" "}
                  {policy.includeHolidaysInLeaveCount ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Include Weekends:</strong>{" "}
                  {policy.includeWeekendsInLeaveCount ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Leave During Notice Period:</strong>{" "}
                  {policy.allowLeaveDuringNoticePeriod ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Block If Attendance Missing:</strong>{" "}
                  {policy.blockLeaveIfAttendanceMissing ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Min Service Months Required:</strong>{" "}
                  {policy.minServiceMonthsRequired}
                </p>
                <p>
                  <strong>Allow Half Day:</strong>{" "}
                  {policy.allowHalfDayLeave ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Half Day Cutoff:</strong> {policy.halfDayCutoffTime}
                </p>

                <p>
                  <strong>Document Required After Days:</strong>{" "}
                  {policy.documentRequiredAfterDays}
                </p>
                <p>
                  <strong>Document For Half Day:</strong>{" "}
                  {policy.requireDocumentForHalfDay ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Document For LOP:</strong>{" "}
                  {policy.requireDocumentForLOP ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Auto Deduct Unapproved:</strong>{" "}
                  {policy.autoDeductForUnapprovedAbsence ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Auto Deduct Priority:</strong>{" "}
                  {policy.autoDeductPriority.join(", ")}
                </p>

                <p>
                  <strong>Convert Excess Leave to LOP:</strong>{" "}
                  {policy.autoConvertExcessLeaveToLOP ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Comp Off Enabled:</strong>{" "}
                  {policy.compOffEnabled ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Comp Off Expiry (Days):</strong>{" "}
                  {policy.compOffExpiryInDays}
                </p>
                <p>
                  <strong>Comp Off on Holiday:</strong>{" "}
                  {policy.allowCompOffOnHoliday ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Comp Off on Weekend:</strong>{" "}
                  {policy.allowCompOffOnWeekend ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Created On:</strong> {policy.createdOn}
                </p>
                <p>
                  <strong>Created By:</strong> {policy.createdBy}
                </p>

                {policy.updatedOn && (
                  <>
                    <p>
                      <strong>Updated On:</strong> {policy.updatedOn}
                    </p>
                    <p>
                      <strong>Updated By:</strong> {policy.updatedBy}
                    </p>
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
