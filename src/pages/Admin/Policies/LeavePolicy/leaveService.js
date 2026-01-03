import axiosInstance from "../../../../axiosInstance/axiosInstance";

/**
 * Safely extract array data from API response
 */
const extractArray = (res) => {
  if (!res?.data) return [];
  return Array.isArray(res.data) ? res.data : res.data.data ?? [];
};

/**
 * Convert array to lookup map
 */
const toMap = (arr, keyField, valueField) =>
  Object.fromEntries(
    arr.map((item) => [String(item[keyField]), item[valueField]])
  );

/**
 * Fetch all master lookups
 */
export const fetchMasterLookups = async () => {
  const results = await Promise.allSettled([
    axiosInstance.get("/shift"),
    axiosInstance.get("/Department"),
    axiosInstance.get("/WorkLocation"),
    axiosInstance.get("/Designation"),
    axiosInstance.get("/Category/all"),
    axiosInstance.get("/RoleList/getall"),
    axiosInstance.get("/EmploymentType/all"),
  ]);

  const [shiftRes, deptRes, locRes, desRes, catRes, roleRes, empTypeRes] =
    results.map((r) => (r.status === "fulfilled" ? r.value : null));

  // Normalize arrays
  const shifts = extractArray(shiftRes);
  const departments = extractArray(deptRes);
  const locations = extractArray(locRes);
  const designations = extractArray(desRes);
  const categories = extractArray(catRes);
  const roles = extractArray(roleRes);
  const employmentTypes = extractArray(empTypeRes);

  return {
    shiftMap: toMap(shifts, "id", "shiftName"),

    departmentMap: toMap(departments, "id", "name"),

    locationMap: toMap(locations, "id", "name"),

    designationMap: toMap(designations, "id", "title"),

    categoryMap: toMap(categories, "categoryId", "categoryName"),

    roleMap: toMap(roles, "roleID", "roleName"),

    employmentTypeMap: toMap(
      employmentTypes,
      "employmentTypeId",
      "employmentTypeName"
    ),
  };
};

/**
 * Convert array of IDs to comma-separated names
 */
export const idsToNames = (ids = [], map = {}) => {
  if (!Array.isArray(ids) || ids.length === 0) return "-";
  if (!map || Object.keys(map).length === 0) return ids.join(", ");

  return ids.map((id) => map[String(id)] ?? id).join(", ");
};
