import axiosInstance from "../axiosInstance/axiosInstance";

// ---------- Category ----------
export const getAllCategories = () => axiosInstance.get("/Category/all");
const mapCategoryOptions = (response) =>
  Array.isArray(response?.data?.data)
    ? response.data.data.map((item) => ({
        value: item.categoryId,
        label: item.categoryName,
      }))
    : [];

// ---------- Employment Type ----------
export const getAllEmploymentTypes = () =>
  axiosInstance.get("/EmploymentType/all");
const mapEmploymentTypeOptions = (response) =>
  Array.isArray(response?.data?.data)
    ? response.data.data.map((item) => ({
        value: item.employmentTypeId,
        label: item.employmentTypeName,
      }))
    : [];

// ---------- Work Nature ----------
export const getAllWorkNatures = () =>
  axiosInstance.get("/WorkNatureMaster/all");
const mapWorkNatureOptions = (response) =>
  Array.isArray(response?.data?.data)
    ? response.data.data.map((item) => ({
        value: item.workNatureId,
        label: item.workNatureName,
      }))
    : [];

// ---------- Shift ----------
export const getShifts = () => axiosInstance.get("/shift");
const mapShiftOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.id,
        label: `${item.shiftName || "N/A"} (${item.shiftStart || "N/A"} - ${
          item.shiftEnd || "N/A"
        })`,
      }))
    : [];

// ---------- OT Rate Slab ----------
export const getOTRateSlabs = () => axiosInstance.get("/OTRateSlabMaster/all");
const mapOTRateSlabOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.otRateSlabId,
        label: `${item.rateType || "N/A"}: ${item.ratePerHour ?? 0}/unit (${
          item.fromHours ?? 0
        }h to ${item.toHours ?? 0}h)${
          item.notes ? " — " + item.notes.trim() : ""
        }`,
      }))
    : [];

// ---------- Weekend Policy ----------
export const getWeekendPolicies = () =>
  axiosInstance.get("/WeekendPolicy/get-all");
const mapWeekendPolicyOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.weekendPolicyId,
        label: item.policyName || "N/A",
      }))
    : [];

// ---------- Pay Schedule ----------
export const getPaySchedules = () => axiosInstance.get("/PaySchedule/all");
const mapPayScheduleOptions = (data) =>
  Array.isArray(data)
    ? data.map((item) => ({
        value: item.id,
        label: item.name || "N/A",
      }))
    : [];

// ---------- Fetch All HR Options ----------
export const fetchAllHROptions = async () => {
  try {
    const [
      categories,
      employmentTypes,
      workNatures,
      shifts,
      otRateSlabs,
      weekendPolicies,
      paySchedules,
    ] = await Promise.all([
      getAllCategories().catch(() => ({ data: { data: [] } })),
      getAllEmploymentTypes().catch(() => ({ data: { data: [] } })),
      getAllWorkNatures().catch(() => ({ data: { data: [] } })),
      getShifts().catch(() => ({ data: { data: [] } })),
      getOTRateSlabs().catch(() => ({ data: { data: [] } })),
      getWeekendPolicies().catch(() => ({ data: { data: [] } })),
      getPaySchedules().catch(() => ({ data: { data: [] } })),
    ]);

    return {
      categoryIds: mapCategoryOptions(categories),
      employmentTypeIds: mapEmploymentTypeOptions(employmentTypes),
      workNatureIds: mapWorkNatureOptions(workNatures),
      shiftIds: mapShiftOptions(shifts.data),
      otRateSlabIds: mapOTRateSlabOptions(otRateSlabs.data.data),
      weekendPolicyIds: mapWeekendPolicyOptions(weekendPolicies.data),
      payScheduleIds: mapPayScheduleOptions(paySchedules.data),
    };
  } catch (error) {
    console.error("Error fetching HR options:", error);
    // Return all empty arrays if fetching fails
    return {
      categoryIds: [],
      employmentTypeIds: [],
      workNatureIds: [],
      shiftIds: [],
      otRateSlabIds: [],
      weekendPolicyIds: [],
      payScheduleIds: [],
    };
  }
};
