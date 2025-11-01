import axiosInstance from "../axiosInstance/axiosInstance";


// ---------- Category ----------
export const getAllCategories = () => axiosInstance   .get("/Category/all");
const mapCategoryOptions = (response) => {
  const data = response?.data?.data || [];
  return data.map((item) => ({
    value: item.categoryId,
    label: item.categoryName,
  }));
};

// ---------- Employment Type ----------
export const getAllEmploymentTypes = () => axiosInstance.get("/EmploymentType/all");
const mapEmploymentTypeOptions = (response) => {
  const data = response?.data?.data || [];
  return data.map((item) => ({
    value: item.employmentTypeId,
    label: item.employmentTypeName,
  }));
};

// ---------- Work Nature ----------
export const getAllWorkNatures = () => axiosInstance.get("/WorkNatureMaster/all");
const mapWorkNatureOptions = (response) => {
  const data = response?.data?.data || [];
  return data.map((item) => ({
    value: item.workNatureId,
    label: item.workNatureName,
  }));
};

// ---------- Shift ----------
export const getShifts = () => axiosInstance.get("/shift");
const mapShiftOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.id,
    label: `${item.shiftName} (${item.shiftStart} - ${item.shiftEnd})`,
  }));
};

// ---------- OT Rate Slab ----------
export const getOTRateSlabs = () => axiosInstance.get("/OTRateSlabMaster/all");
const mapOTRateSlabOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.otRateSlabId,
    label: `${item.rateType} - ${item.ratePerHour}% (From ${item.fromHours}h to ${item.toHours}h)`,
  }));
};

// ---------- Weekend Policy ----------
export const getWeekendPolicies = () => axiosInstance.get("/WeekendPolicy/get-all");
const mapWeekendPolicyOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.weekendPolicyId,
    label: item.policyName,
  }));
};

// ---------- Pay Schedule ----------
export const getPaySchedules = () => axiosInstance.get("/PaySchedule/all");
const mapPayScheduleOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.id,
    label: item.name,
  }));
};

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
      getAllCategories(),
      getAllEmploymentTypes(),
      getAllWorkNatures(),
      getShifts(),
      getOTRateSlabs(),
      getWeekendPolicies(),
      getPaySchedules(),
    ]);

    return {
      categoryIds: mapCategoryOptions(categories),
      employmentTypeIds: mapEmploymentTypeOptions(employmentTypes),
      workNatureIds: mapWorkNatureOptions(workNatures),
      shiftIds: mapShiftOptions(shifts.data),
      otRateSlabIds: mapOTRateSlabOptions(otRateSlabs.data),
      weekendPolicyIds: mapWeekendPolicyOptions(weekendPolicies.data),
      payScheduleIds: mapPayScheduleOptions(paySchedules.data),
    };
  } catch (error) {
    console.error("Error fetching HR options:", error);
    throw error;
  }
};
