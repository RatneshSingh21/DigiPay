import axiosInstance from "../../../axiosInstance/axiosInstance.js";

export const fetchMasterLookups = async () => {
  const [
    shiftRes,
    deptRes,
    locRes,
    workTypeRes,
    weekendRes,
    leaveRes,
    holidayRes,
    paymentAdjRes,
  ] = await Promise.all([
    axiosInstance.get("/shift"),
    axiosInstance.get("/Department"),
    axiosInstance.get("/WorkLocation"),
    axiosInstance.get("/WorkTypeMaster/all"),
    axiosInstance.get("/WeekendPolicy/get-all-Weekend-policy"),
    axiosInstance.get("/LeaveType"),
    axiosInstance.get("/HolidayListMaster/get-all"),
    axiosInstance.get("/PaymentAdjustment/getAll"),
  ]);

  return {
    /* ---------- BASIC MASTERS ---------- */
    shiftMap: Object.fromEntries(
      (shiftRes.data || []).map((s) => [s.id, s.shiftName])
    ),

    departmentMap: Object.fromEntries(
      (deptRes.data || []).map((d) => [d.id, d.name])
    ),

    locationMap: Object.fromEntries(
      (locRes.data || []).map((l) => [l.id, l.name])
    ),

    workTypeMap: Object.fromEntries(
      (workTypeRes.data?.data || []).map((w) => [w.workTypeId, w.workTypeName])
    ),

    weekendPolicyMap: Object.fromEntries(
      (weekendRes.data?.data || []).map((w) => [
        w.weekendPolicyId,
        w.policyName,
      ])
    ),

    /* ---------- 🔥 NEW (FIXED) ---------- */
    leaveTypeMap: Object.fromEntries(
      (leaveRes.data || []).map((l) => [
        l.leaveTypeId,
        `${l.leaveName} (${l.leaveCode})`,
      ])
    ),

    holidayMap: Object.fromEntries(
      (holidayRes.data || []).map((h) => [h.holidayId, h.holidayName])
    ),

    paymentAdjustmentMap: Object.fromEntries(
      (paymentAdjRes.data?.data || []).map((p) => [
        p.paymentAdjustmentId,
        p.paymentType,
      ])
    ),
  };
};
