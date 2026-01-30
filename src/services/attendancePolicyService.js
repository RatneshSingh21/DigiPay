import axiosInstance from "../axiosInstance/axiosInstance";

/* ================= SHIFT ================= */
export const getAllShifts = () => axiosInstance.get("/Shift");
const mapShiftOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.id,
        label: `${item.shiftName} (${item.shiftStart} - ${item.shiftEnd})`,
      }))
    : [];

/* ================= WORK TYPE ================= */
export const getAllWorkTypes = () => axiosInstance.get("/WorkTypeMaster/all");
const mapWorkTypeOptions = (res) => {
  const list = res?.data?.data; // correct path
  return Array.isArray(list)
    ? list.map((item) => ({
        value: item.workTypeId,
        label: item.workTypeName,
      }))
    : [];
};

/* ================= DEPARTMENT ================= */
export const getAllDepartments = () => axiosInstance.get("/Department");
const mapDepartmentOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.id,
        label: item.name,
      }))
    : [];

/* ================= LOCATION ================= */
export const getAllWorkLocations = () => axiosInstance.get("/WorkLocation");
const mapLocationOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.id,
        label: `${item.name} (${item.city}, ${item.state})`,
      }))
    : [];

/* ================= LATE POLICY ================= */
export const getAllLatePolicies = () => axiosInstance.get("/LatePolicy/all");
const mapLatePolicyOptions = (res) =>
  Array.isArray(res?.data?.data)
    ? res.data.data.map((item) => ({
        value: item.latePolicyId,
        label: item.policyName,
      }))
    : [];

/* ================= OT RATE SLAB ================= */
export const getAllOTRateSlabs = () =>
  axiosInstance.get("/OTRateSlabMaster/all");
const mapOTRateSlabOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.otRateSlabId,
        label: `${item.rateType} - ${item.ratePerHour} ( ${item.fromHours}h → ${item.toHours}h )`,
      }))
    : [];

/* ================= PAYMENT ADJUSTMENT (BONUS / ALLOWANCE / ETC) ================= */
export const getAllPaymentAdjustments = () =>
  axiosInstance.get("/PaymentAdjustment/getAll");
const mapPaymentAdjustmentOptions = (res) =>
  Array.isArray(res?.data?.data)
    ? res.data.data.map((item) => ({
        value: item.paymentAdjustmentId,
        label: item.paymentType,
      }))
    : [];

/* ================= HOLIDAY LIST ================= */
export const getAllHolidayLists = () =>
  axiosInstance.get("/HolidayListMaster/get-all");
const mapHolidayListOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.holidayId,
        label: `${item.holidayName} (${new Date(
          item.holidayDate,
        ).toLocaleDateString()})`,
      }))
    : [];

/* ================= LEAVE TYPE ================= */
export const getAllLeaveTypes = () => axiosInstance.get("/LeaveType");
const mapLeaveTypeOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.leaveTypeId,
        label: `${item.leaveName} (${item.leaveCode})`,
      }))
    : [];

/* ================= WEEKEND POLICY ================= */
export const getAllWeekendPolicies = () =>
  axiosInstance.get("/WeekendPolicy/get-all-Weekend-policy");
const mapWeekendPolicyOptions = (res) => {
  const list = res?.data?.data; // correct level
  return Array.isArray(list)
    ? list.map((item) => ({
        value: item.weekendPolicyId,
        label: item.policyName,
      }))
    : [];
};

/* ================= MASTER FETCH ================= */
export const fetchAllAttendancePolicyOptions = async () => {
  try {
    const results = await Promise.allSettled([
      getAllShifts(),
      getAllWorkTypes(),
      getAllDepartments(),
      getAllWorkLocations(),
      getAllLatePolicies(),
      getAllOTRateSlabs(),
      getAllPaymentAdjustments(),
      getAllHolidayLists(),
      getAllLeaveTypes(),
      getAllWeekendPolicies(),
    ]);

    const safe = (r) => (r.status === "fulfilled" ? (r.value?.data ?? []) : []);

    return {
      shiftIds: mapShiftOptions(safe(results[0])),
      workTypeIds: mapWorkTypeOptions(results[1].value),
      departmentIds: mapDepartmentOptions(safe(results[2])),
      locationIds: mapLocationOptions(safe(results[3])),
      latePolicyIds: mapLatePolicyOptions(results[4].value),
      otRateSlabIds: mapOTRateSlabOptions(safe(results[5])?.data || []),
      paymentAdjustmentIds: mapPaymentAdjustmentOptions(results[6].value),
      holidayListIds: mapHolidayListOptions(safe(results[7])),
      leaveTypeIds: mapLeaveTypeOptions(safe(results[8])),
      weekendPolicyIds: mapWeekendPolicyOptions(results[9].value),
    };
  } catch (err) {
    console.error("❌ Failed to fetch attendance policy options", err);
    return {};
  }
};
