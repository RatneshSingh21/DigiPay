import axiosInstance from "../axiosInstance/axiosInstance";

// ---------- Shift ----------
export const getAllShifts = () => axiosInstance.get("/Shift");
const mapShiftOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.id,
    label: `${item.shiftName} (${item.shiftStart} - ${item.shiftEnd})`,
  }));
};

// ---------- Work Type ----------
export const getAllWorkTypes = () => axiosInstance.get("/WorkTypeMaster/all");
const mapWorkTypeOptions = (response) => {
  const data = response?.data || [];
  return data.map((item) => ({
    value: item.workTypeId,
    label: item.workTypeName,
  }));
};

// ---------- Department ----------
export const getAllDepartments = () => axiosInstance.get("/Department");
const mapDepartmentOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.id,
    label: item.name,
  }));
};

// ---------- Work Location ----------
export const getAllWorkLocations = () => axiosInstance.get("/WorkLocation");
const mapWorkLocationOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.city}, ${item.state})`,
  }));
};

// ---------- Late Policy ----------
export const getAllLatePolicies = () => axiosInstance.get("/LatePolicy/all");
const mapLatePolicyOptions = (response) => {
  const data = response?.data?.data || [];
  return data.map((item) => ({
    value: item.latePolicyId,
    label: item.policyName,
  }));
};

// ---------- OT Policy ----------
export const getAllOTPolicies = () =>
  axiosInstance.get("/OTRateSlabMaster/all");
const mapOTRateSlabOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.otRateSlabId,
    label: `${item.rateType} - ${item.ratePerHour}% (From ${item.fromHours}h to ${item.toHours}h)`,
  }));
};

// ---------- OT Rate Slab ----------
export const getAllOTRateSlabs = () =>
  axiosInstance.get("/OTRateSlabAssignmentRule");
const mapOTAssignmentRuleOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.otRateSlabAssignmentRuleId,
    label: `${item.ruleCode} - ${item.entityName}`,
  }));
};

// ---------- Bonus Policy (No API yet) ----------
export const getAllBonusPolicies = () =>
  axiosInstance.get("/PaymentAdjustment/getAll");
const mapBonusPolicyOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.paymentAdjustmentId,
    label: item.paymentType,
  }));
};

// ---------- Special Allowance Policy (No API yet) ----------
export const getAllSpecialAllowancePolicies = async () => {
  return []; // return empty array placeholder
};

// ---------- Holiday List ----------
export const getAllHolidayLists = () =>
  axiosInstance.get("/HolidayListMaster/get-all");
const mapHolidayListOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.holidayId,
    label: `${item.holidayName} (${new Date(
      item.holidayDate
    ).toLocaleDateString()})`,
  }));
};

// ---------- Leave Type ----------
export const getAllLeaveTypes = () => axiosInstance.get("/LeaveType");
const mapLeaveTypeOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.leaveTypeId,
    label: `${item.leaveName} (${item.leaveCode})`,
  }));
};

// ---------- Compliance ----------
export const getAllCompliances = () => axiosInstance.get("/Compliance/get-all");
const mapComplianceOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.complianceId,
    label: `${item.complianceName} (${item.complianceCode})`,
  }));
};

// ---------- Compliance Rule ----------
export const getAllComplianceRules = () =>
  axiosInstance.get("/ComplianceRule/get-all");
const mapComplianceRuleOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.complianceRuleDetailId,
    label: `${item.ruleCode} - ${item.ruleName}`,
  }));
};

// ---------- Weekend Policy ----------
export const getAllWeekendPolicies = () =>
  axiosInstance.get("/WeekendPolicy/get-all");
const mapWeekendPolicyOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.weekendPolicyId,
    label: item.policyName,
  }));
};

// ---------- Weekend Policy Mapping ----------
export const getAllWeekendPolicyMappings = () =>
  axiosInstance.get("/WeekendPolicyMapping/get");
const mapWeekendPolicyMappingOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.mappingId,
    label: `Mapping #${item.mappingId} - Policy ${item.weekendPolicyId}`,
  }));
};

// ---------- Fetch All Attendance Policy Options ----------
export const fetchAllAttendancePolicyOptions = async () => {
  try {
    const [
      shifts,
      workTypes,
      departments,
      locations,
      latePolicies,
      otPolicies,
      otRateSlabs,
      bonusPolicies,
      specialAllowances,
      holidayLists,
      leaveTypes,
      compliances,
      complianceRules,
      weekendPolicies,
      weekendMappings,
    ] = await Promise.all([
      getAllShifts(),
      getAllWorkTypes(),
      getAllDepartments(),
      getAllWorkLocations(),
      getAllLatePolicies(),
      getAllOTPolicies(),
      getAllOTRateSlabs(),
      getAllBonusPolicies(),
      getAllSpecialAllowancePolicies(), // returns []
      getAllHolidayLists(),
      getAllLeaveTypes(),
      getAllCompliances(),
      getAllComplianceRules(),
      getAllWeekendPolicies(),
      getAllWeekendPolicyMappings(),
    ]);

    return {
      shiftIds: mapShiftOptions(shifts.data),
      workTypeIds: mapWorkTypeOptions(workTypes.data),
      departmentIds: mapDepartmentOptions(departments.data),
      locationIds: mapWorkLocationOptions(locations.data),
      latePolicyIds: mapLatePolicyOptions(latePolicies),
      otPolicyIds: mapOTRateSlabOptions(otPolicies.data.data),
      otRateSlabIds: mapOTAssignmentRuleOptions(otRateSlabs.data),
      bonusPolicyIds: mapBonusPolicyOptions(bonusPolicies.data.data),
      specialAllowancePolicyIds: [], // No API yet
      holidayListIds: mapHolidayListOptions(holidayLists.data),
      leaveTypeIds: mapLeaveTypeOptions(leaveTypes.data),
      complianceIds: mapComplianceOptions(compliances.data),
      complianceRuleIds: mapComplianceRuleOptions(complianceRules.data),
      weekendPolicyIds: mapWeekendPolicyOptions(weekendPolicies.data),
      weekendPolicyMappingIds: mapWeekendPolicyMappingOptions(
        weekendMappings.data
      ),
    };
  } catch (error) {
    console.error("Error fetching attendance policy options:", error);
    throw error;
  }
};
