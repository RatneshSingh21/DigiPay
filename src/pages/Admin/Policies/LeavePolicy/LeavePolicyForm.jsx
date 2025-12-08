import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import MultiSelectWithAll from "./MultiSelectWithAll";
import { FiX } from "react-icons/fi";

const LeavePolicyForm = ({
  onClose,
  onSuccess,
  isEdit = false,
  initialData = null,
}) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    policyName: "",
    description: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,

    applicableLeaveTypeIds: [],
    applicableHolidayListIds: [],
    applicableWeekendPolicyIds: [],
    applicableDepartmentIds: [],
    applicableDesignationIds: [],
    applicableGradeIds: [],
    applicableRoleIds: [],
    applicableWorkLocationIds: [],
    applicableShiftIds: [],
    applicableEmploymentTypeIds: [],

    allowBackdatedLeave: false,
    backdatedLimitInDays: 0,
    allowFutureDatedLeave: false,
    futureDatedLimitInDays: 0,
    minNoticePeriodInDays: 0,
    maxDaysPerApplication: 0,
    minDaysPerApplication: 0,
    allowMixedLeaveTypesInSingleApplication: false,
    includeHolidaysInLeaveCount: false,
    includeWeekendsInLeaveCount: false,
    allowLeaveDuringNoticePeriod: false,
    blockLeaveIfAttendanceMissing: false,
    minServiceMonthsRequired: 0,
    allowHalfDayLeave: false,
    halfDayCutoffTime: "",
    documentRequiredAfterDays: 0,
    requireDocumentForHalfDay: false,
    requireDocumentForLOP: false,
    autoDeductForUnapprovedAbsence: false,
    autoDeductPriority: [], // string[]
    autoConvertExcessLeaveToLOP: false,
    compOffEnabled: false,
    compOffExpiryInDays: 0,
    allowCompOffOnHoliday: false,
    allowCompOffOnWeekend: false,
    rulesJson: "",
  });

  const [errors, setErrors] = useState({});

  // Master data states
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [holidayLists, setHolidayLists] = useState([]);
  const [weekendPolicies, setWeekendPolicies] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [grades, setGrades] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          leaveTypesRes,
          deptRes,
          rolesRes,
          holidayRes,
          weekendRes,
          desigRes,
          gradeRes,
          locRes,
          shiftRes,
          empTypeRes,
        ] = await Promise.all([
          axiosInstance.get("/LeaveType"),
          axiosInstance.get("/Department"),
          axiosInstance.get("/RoleList/getall"),
          axiosInstance.get("/HolidayListMaster/get-all"),
          axiosInstance.get("/WeekendPolicy/get-all"),
          axiosInstance.get("/Designation"),
          axiosInstance.get("/Category/all"),
          axiosInstance.get("/WorkLocation"),
          axiosInstance.get("/Shift"),
          axiosInstance.get("/EmploymentType/all"),
        ]);

        setLeaveTypes(leaveTypesRes.data || []);
        setDepartments(deptRes.data || []);
        setRoles(rolesRes.data || []);
        setHolidayLists(holidayRes.data || []);
        setWeekendPolicies(weekendRes.data || []);
        setDesignations(desigRes.data || []);
        setGrades(gradeRes.data?.data || []);
        setWorkLocations(locRes.data || []);
        setShifts(shiftRes.data || []);
        setEmploymentTypes(empTypeRes.data?.data || []);
      } catch (err) {
        toast.error("Failed to fetch dropdown data");
      }
    };

    load();
  }, []);

  // Set edit mode values
  useEffect(() => {
    if (isEdit && initialData) {
      const localDate = (x) =>
        x ? new Date(x).toISOString().slice(0, 16) : "";

      setForm({
        ...initialData,
        effectiveFrom: localDate(initialData.effectiveFrom),
        effectiveTo: localDate(initialData.effectiveTo),
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.policyName) e.policyName = "Policy name required";

    if (form.effectiveFrom && form.effectiveTo) {
      if (new Date(form.effectiveFrom) > new Date(form.effectiveTo)) {
        e.effectiveTo = "Effective To must be after Effective From";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const normalizeNumber = (x) => (x === "" || x === null ? 0 : Number(x));

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const toISO = (x) => (x ? new Date(x).toISOString() : null);

    const payload = {
      ...form,

      effectiveFrom: toISO(form.effectiveFrom),
      effectiveTo: toISO(form.effectiveTo),

      backdatedLimitInDays: normalizeNumber(form.backdatedLimitInDays),
      futureDatedLimitInDays: normalizeNumber(form.futureDatedLimitInDays),
      minNoticePeriodInDays: normalizeNumber(form.minNoticePeriodInDays),
      maxDaysPerApplication: normalizeNumber(form.maxDaysPerApplication),
      minDaysPerApplication: normalizeNumber(form.minDaysPerApplication),
      minServiceMonthsRequired: normalizeNumber(form.minServiceMonthsRequired),
      documentRequiredAfterDays: normalizeNumber(
        form.documentRequiredAfterDays
      ),
      compOffExpiryInDays: normalizeNumber(form.compOffExpiryInDays),
    };

    try {
      let res;

      if (isEdit) {
        res = await axiosInstance.put(
          `/LeavePolicy/update/${initialData.leavePolicyId}`,
          payload
        );
      } else {
        res = await axiosInstance.post(`/LeavePolicy/create`, payload);
      }

      toast.success(isEdit ? "Updated successfully" : "Created successfully");
      onSuccess?.(res.data);
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }

    setLoading(false);
  };

  const BOOLEAN_FIELDS = [
    "allowBackdatedLeave",
    "allowFutureDatedLeave",
    "allowMixedLeaveTypesInSingleApplication",
    "includeHolidaysInLeaveCount",
    "includeWeekendsInLeaveCount",
    "allowLeaveDuringNoticePeriod",
    "blockLeaveIfAttendanceMissing",
    "allowHalfDayLeave",
    "requireDocumentForHalfDay",
    "requireDocumentForLOP",
    "autoDeductForUnapprovedAbsence",
    "autoConvertExcessLeaveToLOP",
    "compOffEnabled",
    "allowCompOffOnHoliday",
    "allowCompOffOnWeekend",
  ];

  const NUMBER_FIELDS = [
    "backdatedLimitInDays",
    "futureDatedLimitInDays",
    "minNoticePeriodInDays",
    "maxDaysPerApplication",
    "minDaysPerApplication",
    "minServiceMonthsRequired",
    "documentRequiredAfterDays",
    "compOffExpiryInDays",
  ];

  return (
    <>
      <div className="p-4 relative">
        <button
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>
        <h3 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Leave Policy" : "Create Leave Policy"}
        </h3>

        <form onSubmit={submit} className="space-y-1">
          {/* BASIC INFO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Policy Name</label>
              <input
                value={form.policyName}
                onChange={(e) => handleChange("policyName", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.policyName ? "border-red-500" : "border-blue-300"
                }  focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder="Enter policy name"
                autoFocus
              />
              {errors.policyName && (
                <p className="text-xs text-red-500">{errors.policyName}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium">Description</label>
              <input
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="text-xs font-medium">Effective From</label>
              <input
                type="datetime-local"
                value={form.effectiveFrom}
                onChange={(e) => handleChange("effectiveFrom", e.target.value)}
                className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium">Effective To</label>
              <input
                type="datetime-local"
                value={form.effectiveTo}
                onChange={(e) => handleChange("effectiveTo", e.target.value)}
                className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.effectiveTo && (
                <p className="text-xs text-red-500">{errors.effectiveTo}</p>
              )}
            </div>

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="accent-primary"
              />
              Active Policy
            </label>
          </div>

          {/* MULTI SELECTS */}
          <div className="grid grid-cols-2 gap-4">
            <MultiSelectWithAll
              label="Applicable Leave Types"
              list={leaveTypes}
              labelKey="leaveName"
              valueKey="leaveTypeId"
              selectedValues={form.applicableLeaveTypeIds}
              onChange={(v) => handleChange("applicableLeaveTypeIds", v)}
            />

            <MultiSelectWithAll
              label="Holiday Lists"
              list={holidayLists}
              labelKey="holidayName"
              valueKey="holidayId"
              selectedValues={form.applicableHolidayListIds}
              onChange={(v) => handleChange("applicableHolidayListIds", v)}
            />

            <MultiSelectWithAll
              label="Weekend Policy"
              list={weekendPolicies}
              labelKey="policyName"
              valueKey="weekendPolicyId"
              selectedValues={form.applicableWeekendPolicyIds}
              onChange={(v) => handleChange("applicableWeekendPolicyIds", v)}
            />

            <MultiSelectWithAll
              label="Departments"
              list={departments}
              labelKey="name"
              valueKey="id"
              selectedValues={form.applicableDepartmentIds}
              onChange={(v) => handleChange("applicableDepartmentIds", v)}
            />

            <MultiSelectWithAll
              label="Designations"
              list={designations}
              labelKey="title"
              valueKey="id"
              selectedValues={form.applicableDesignationIds}
              onChange={(v) => handleChange("applicableDesignationIds", v)}
            />

            <MultiSelectWithAll
              label="Category/Grades"
              list={grades}
              labelKey="categoryName"
              valueKey="categoryId"
              selectedValues={form.applicableGradeIds}
              onChange={(v) => handleChange("applicableGradeIds", v)}
            />

            <MultiSelectWithAll
              label="Roles"
              list={roles}
              labelKey="roleName"
              valueKey="roleID"
              selectedValues={form.applicableRoleIds}
              onChange={(v) => handleChange("applicableRoleIds", v)}
            />

            <MultiSelectWithAll
              label="Work Locations"
              list={workLocations}
              labelKey="name"
              valueKey="id"
              selectedValues={form.applicableWorkLocationIds}
              onChange={(v) => handleChange("applicableWorkLocationIds", v)}
            />

            <MultiSelectWithAll
              label="Shifts"
              list={shifts}
              labelKey="shiftName"
              valueKey="id"
              selectedValues={form.applicableShiftIds}
              onChange={(v) => handleChange("applicableShiftIds", v)}
            />

            <MultiSelectWithAll
              label="Employment Types"
              list={employmentTypes}
              labelKey="employmentTypeName"
              valueKey="employmentTypeId"
              selectedValues={form.applicableEmploymentTypeIds}
              onChange={(v) => handleChange("applicableEmploymentTypeIds", v)}
            />
          </div>

          {/* BOOLEAN SWITCHES */}
          <div className="grid grid-cols-2 gap-3">
            {BOOLEAN_FIELDS.map((field) => (
              <label key={field} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={form[field]}
                  onChange={(e) => handleChange(field, e.target.checked)}
                  className="accent-primary"
                />
                {field}
              </label>
            ))}
          </div>

          {/* NUMBER FIELDS */}
          <div className="grid grid-cols-3 gap-4">
            {NUMBER_FIELDS.map((field) => (
              <div key={field}>
                <label className="text-xs font-medium">{field}</label>
                <input
                  type="number"
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}

            {/* Missing Field: halfDayCutoffTime */}
            <div>
              <label className="text-xs font-medium">halfDayCutoffTime</label>
              <input
                type="text"
                value={form.halfDayCutoffTime}
                onChange={(e) =>
                  handleChange("halfDayCutoffTime", e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. 13:00"
              />
            </div>

            {/* Missing Field: autoDeductPriority (string array) */}
            <div className="col-span-3">
              <label className="text-xs font-medium">
                Auto Deduct Priority
              </label>
              <input
                type="text"
                placeholder='"Annual", "Sick"'
                value={form.autoDeductPriority.join(",")}
                onChange={(e) =>
                  handleChange(
                    "autoDeductPriority",
                    e.target.value.split(",").map((s) => s.trim())
                  )
                }
                className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* RULES JSON */}
          <div>
            <label className="text-xs font-medium">Rules JSON</label>
            <textarea
              rows={4}
              value={form.rulesJson}
              onChange={(e) => handleChange("rulesJson", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 font-mono text-xs  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder='e.g. {"rules": []}'
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LeavePolicyForm;
