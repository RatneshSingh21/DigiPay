import axiosInstance from "../axiosInstance/axiosInstance";


// Fetch multiple master lookup data and return as maps
export const fetchMasterLookups = async () => {
  const results = await Promise.allSettled([
    axiosInstance.get("/shift"),
    axiosInstance.get("/Department"),
    axiosInstance.get("/WorkLocation"),
    axiosInstance.get("/WorkTypeMaster/all"),
    axiosInstance.get("/WeekendPolicy/get-all-Weekend-policy"),
    axiosInstance.get("/LeaveType"),
    axiosInstance.get("/HolidayListMaster/get-all"),
    axiosInstance.get("/PaymentAdjustment/getAll"), 
  ]);

  const [
    shiftRes,
    deptRes,
    locRes,
    workTypeRes,
    weekendRes,
    leaveRes,
    holidayRes,
    paymentAdjRes,
  ] = results.map((r) => (r.status === "fulfilled" ? r.value : null));

  return {
    shiftMap: Object.fromEntries(
      (shiftRes?.data ?? []).map((s) => [String(s.id), s.shiftName])
    ),

    departmentMap: Object.fromEntries(
      (deptRes?.data ?? []).map((d) => [String(d.id), d.name])
    ),

    locationMap: Object.fromEntries(
      (locRes?.data ?? []).map((l) => [String(l.id), l.name])
    ),

    workTypeMap: Object.fromEntries(
      (workTypeRes?.data?.data ?? []).map((w) => [
        String(w.workTypeId),
        w.workTypeName,
      ])
    ),

    weekendPolicyMap: Object.fromEntries(
      (weekendRes?.data?.data ?? []).map((w) => [
        String(w.weekendPolicyId),
        w.policyName,
      ])
    ),

    leaveTypeMap: Object.fromEntries(
      (leaveRes?.data ?? []).map((l) => [
        String(l.leaveTypeId),
        `${l.leaveName} (${l.leaveCode})`,
      ])
    ),

    holidayMap: Object.fromEntries(
      (holidayRes?.data ?? []).map((h) => [
        String(h.holidayId),
        h.holidayName,
      ])
    ),

    paymentAdjustmentMap: Object.fromEntries(
      (paymentAdjRes?.data?.data ?? []).map((p) => [
        String(p.paymentAdjustmentId),
        p.paymentType,
      ])
    ),
  };
};

// Utility to convert array of IDs to names using a lookup map
export const idsToNames = (ids = [], map = {}) => {
  if (!Array.isArray(ids) || ids.length === 0) return "-";
  if (!map || Object.keys(map).length === 0) return ids.join(", ");

  return ids.map((id) => map[String(id)] ?? id).join(", ");
};
