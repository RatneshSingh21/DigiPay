import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FaTimes } from "react-icons/fa";

// Dropdown options (UI strings)
const RESOLUTION_TYPES = [
  { value: "Ignore", label: "Ignore Late" },
  { value: "HalfDay", label: "Mark Half Day" },
  { value: "FullDay", label: "Mark Full Day" },
  { value: "Fine", label: "Apply Fine" },
  { value: "MakeUpHours", label: "Require Make-up Hours" },
  { value: "LeaveDeduction", label: "Deduct Leave" },
];
// 🔥 UI string → Backend enum number
const RESOLUTION_TYPE_MAP = {
  Ignore: 0,
  Warning: 1,
  Fine: 2, // ApplyFine
  HalfDay: 3, // DeductHalfDay
  FullDay: 4, // DeductFullDay
  LeaveDeduction: 5, // AdjustLeave
  MakeUpHours: 6, // RequireMakeUpHours
};

// ✅ Small react-select styles (compact UI)
const smallSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "28px",
    height: "28px",
    fontSize: "11px",
    borderRadius: "6px",
    borderColor: "#93c5fd", // tailwind blue-300
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: "28px",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "2px",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: "2px",
  }),
  multiValue: (base) => ({
    ...base,
    fontSize: "10px",
    borderRadius: "4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    padding: "0 4px",
  }),
  menu: (base) => ({
    ...base,
    fontSize: "11px",
    zIndex: 60,
  }),
};

export default function AddLatePolicy({
  onClose,
  isEdit = false,
  initialData = null,
  onSuccess,
}) {
  const [form, setForm] = useState({
    policyName: "",
    description: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,

    graceMinutesPerDay: "",
    maxGraceOccurrences: "",
    lateThresholdMinutes: "",
    maxLateAllowedPerMonth: "",

    resolutionRules: [
      {
        fromLateMinutes: "",
        toLateMinutes: "",
        fromOccurrence: "",
        toOccurrence: "",
        cutoffTime: "",
        resolutionType: "Ignore",
        amount: "",
        amountType: "",
        requiredMakeUpHours: "",
        leaveType: "",
        priority: 1,
        isActive: true,
      },
    ],

    workTypeIds: [],
    shiftIds: [],
    departmentIds: [],
    locationIds: [],
  });

  const [loading, setLoading] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [workTypeOptions, setWorkTypeOptions] = useState([]);
  const selectAllOption = { value: "*", label: "Select All" };

  /* ================= FETCHING (UNCHANGED) ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shiftRes, deptRes, locRes, workTypeRes] = await Promise.all([
          axiosInstance.get("/shift"),
          axiosInstance.get("/Department"),
          axiosInstance.get("/WorkLocation"),
          axiosInstance.get("/WorkTypeMaster/all"),
        ]);

        setShiftOptions(
          shiftRes.data.map((s) => ({
            value: s.id || s.shiftId,
            label: s.shiftName,
          }))
        );

        setDepartmentOptions(
          deptRes.data.map((d) => ({
            value: d.id || d.departmentId,
            label: d.name,
          }))
        );

        setLocationOptions(
          locRes.data.map((l) => ({
            value: l.id || l.locationId,
            label: l.name,
          }))
        );

        setWorkTypeOptions(
          workTypeRes.data.data.map((w) => ({
            value: w.workTypeId,
            label: w.workTypeName,
          }))
        );
      } catch {
        toast.error("Failed to fetch options");
      }
    };
    fetchData();
  }, []);

  /* ================= EDIT MODE POPULATE ================= */

  useEffect(() => {
    if (isEdit && initialData) {
      const toLocal = (iso) =>
        iso ? new Date(iso).toISOString().slice(0, 16) : "";

      setForm({
        ...initialData,
        effectiveFrom: toLocal(initialData.effectiveFrom),
        effectiveTo: toLocal(initialData.effectiveTo),
      });
    }
  }, [isEdit, initialData]);

  /* ================= HELPERS ================= */

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleMultiSelect = (key, selected, options) => {
    if (!selected) return handleChange(key, []);
    if (selected[selected.length - 1]?.value === "*") {
      handleChange(
        key,
        options.map((o) => o.value)
      );
    } else {
      handleChange(
        key,
        selected.map((s) => s.value)
      );
    }
  };

  /* ================= RULE HANDLERS ================= */

  const addRule = () => {
    setForm((prev) => ({
      ...prev,
      resolutionRules: [
        ...prev.resolutionRules,
        {
          fromLateMinutes: "",
          toLateMinutes: "",
          fromOccurrence: "",
          toOccurrence: "",
          cutoffTime: "",
          resolutionType: "Ignore",
          amount: "",
          amountType: "",
          requiredMakeUpHours: "",
          leaveType: "",
          priority: prev.resolutionRules.length + 1,
          isActive: true,
        },
      ],
    }));
  };

  const removeRule = (index) => {
    setForm((prev) => ({
      ...prev,
      resolutionRules: prev.resolutionRules
        .filter((_, i) => i !== index)
        .map((r, i) => ({ ...r, priority: i + 1 })),
    }));
  };

  const updateRule = (index, key, value) => {
    const rules = [...form.resolutionRules];
    rules[index][key] = value;
    setForm({ ...form, resolutionRules: rules });
  };

  /* ================= SUBMIT ================= */

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const toISO = (v) => (v ? new Date(v).toISOString() : null);

      const payload = {
        ...form,
        effectiveFrom: toISO(form.effectiveFrom),
        effectiveTo: toISO(form.effectiveTo),

        // 🔥 THIS IS THE IMPORTANT PART
        resolutionRules: form.resolutionRules.map((r) => ({
          fromLateMinutes: r.fromLateMinutes ? Number(r.fromLateMinutes) : null,

          toLateMinutes: r.toLateMinutes ? Number(r.toLateMinutes) : null,

          fromOccurrence: r.useOccurrence ? Number(r.fromOccurrence) : null,

          toOccurrence: r.useOccurrence ? Number(r.toOccurrence) : null,

          cutoffTime: r.cutoffTime || null,

          // 🔥 STRING → ENUM NUMBER
          resolutionType: RESOLUTION_TYPE_MAP[r.resolutionType],

          amount:
            r.resolutionType === "Fine" && r.amount ? Number(r.amount) : null,

          amountType: r.resolutionType === "Fine" ? r.amountType || null : null,

          requiredMakeUpHours:
            r.resolutionType === "MakeUpHours" && r.requiredMakeUpHours
              ? Number(r.requiredMakeUpHours)
              : null,

          leaveType:
            r.resolutionType === "LeaveDeduction" ? r.leaveType || null : null,

          priority: Number(r.priority),
          isActive: true,
        })),
      };

      const res = isEdit
        ? await axiosInstance.put(
            `/LatePolicy/update/${initialData.latePolicyId}`,
            payload
          )
        : await axiosInstance.post("/LatePolicy/create", payload);

      toast.success(isEdit ? "Late Policy updated!" : "Late Policy created!");
      onSuccess?.(res.data);
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border rounded-lg px-2 py-1  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400";

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 backdrop-blur-sm  z-40 flex justify-center items-center">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-4 max-h-[85vh] overflow-y-auto text-[11px] relative">
        {/* ❌ Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-red-500 transition"
          title="Close"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-sm font-semibold mb-3">
          {isEdit ? "Edit" : "Create"} Late Policy
        </h2>

        <form onSubmit={submit} className="space-y-3">
          {/* ================= BASIC INFO ================= */}
          <div className="space-y-1">
            <label className="font-medium text-gray-700">Policy Name</label>
            <input
              value={form.policyName}
              onChange={(e) => handleChange("policyName", e.target.value)}
              className={inputClass}
              placeholder="Policy Name"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Description</label>
            <input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={inputClass}
              placeholder="Description"
            />
          </div>

          {/* ================= DATES ================= */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-medium">Effective From</label>
              <input
                type="datetime-local"
                value={form.effectiveFrom}
                onChange={(e) => handleChange("effectiveFrom", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium">Effective To</label>
              <input
                type="datetime-local"
                value={form.effectiveTo}
                onChange={(e) => handleChange("effectiveTo", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* ================= CORE SETTINGS ================= */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label>Grace Minutes / Day</label>
              <input
                value={form.graceMinutesPerDay}
                onChange={(e) =>
                  handleChange("graceMinutesPerDay", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label>Max Grace Occurrences</label>
              <input
                value={form.maxGraceOccurrences}
                onChange={(e) =>
                  handleChange("maxGraceOccurrences", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label>Late Threshold (mins)</label>
              <input
                value={form.lateThresholdMinutes}
                onChange={(e) =>
                  handleChange("lateThresholdMinutes", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label>Max Late / Month</label>
              <input
                value={form.maxLateAllowedPerMonth}
                onChange={(e) =>
                  handleChange("maxLateAllowedPerMonth", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* ================= MAPPINGS ================= */}
          <div className="space-y-2">
            <div>
              <label className="block mb-1">Work Types</label>
              <Select
                isMulti
                styles={smallSelectStyles}
                options={[selectAllOption, ...workTypeOptions]}
                value={workTypeOptions.filter((o) =>
                  form.workTypeIds.includes(o.value)
                )}
                onChange={(s) =>
                  handleMultiSelect("workTypeIds", s, workTypeOptions)
                }
              />
            </div>

            <div>
              <label className="block mb-1">Shifts</label>
              <Select
                isMulti
                styles={smallSelectStyles}
                options={[selectAllOption, ...shiftOptions]}
                value={shiftOptions.filter((o) =>
                  form.shiftIds.includes(o.value)
                )}
                onChange={(s) => handleMultiSelect("shiftIds", s, shiftOptions)}
              />
            </div>

            <div>
              <label className="block mb-1">Departments</label>
              <Select
                isMulti
                styles={smallSelectStyles}
                options={[selectAllOption, ...departmentOptions]}
                value={departmentOptions.filter((o) =>
                  form.departmentIds.includes(o.value)
                )}
                onChange={(s) =>
                  handleMultiSelect("departmentIds", s, departmentOptions)
                }
              />
            </div>

            <div>
              <label className="block mb-1">Locations</label>
              <Select
                isMulti
                styles={smallSelectStyles}
                options={[selectAllOption, ...locationOptions]}
                value={locationOptions.filter((o) =>
                  form.locationIds.includes(o.value)
                )}
                onChange={(s) =>
                  handleMultiSelect("locationIds", s, locationOptions)
                }
              />
            </div>
          </div>

          {/* ================= RESOLUTION RULES ================= */}
          <h3 className="font-semibold text-sm mt-3">Resolution Rules</h3>

          {form.resolutionRules.map((rule, i) => (
            <div key={i} className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Rule {rule.priority}</span>
                {form.resolutionRules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(i)}
                    className="text-red-500 text-[10px]"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Late Minutes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label>From Late (mins)</label>
                  <input
                    className={inputClass}
                    value={rule.fromLateMinutes}
                    onChange={(e) =>
                      updateRule(i, "fromLateMinutes", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>To Late (mins)</label>
                  <input
                    className={inputClass}
                    value={rule.toLateMinutes}
                    onChange={(e) =>
                      updateRule(i, "toLateMinutes", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Occurrence */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rule.useOccurrence}
                  onChange={(e) =>
                    updateRule(i, "useOccurrence", e.target.checked)
                  }
                />
                Apply after repeated lateness
              </label>

              {rule.useOccurrence && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label>From Occurrence</label>
                    <input
                      className={inputClass}
                      value={rule.fromOccurrence}
                      onChange={(e) =>
                        updateRule(i, "fromOccurrence", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label>To Occurrence</label>
                    <input
                      className={inputClass}
                      value={rule.toOccurrence}
                      onChange={(e) =>
                        updateRule(i, "toOccurrence", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Action */}
              <div>
                <label>Resolution Action</label>
                <Select
                  options={RESOLUTION_TYPES}
                  styles={smallSelectStyles}
                  value={RESOLUTION_TYPES.find(
                    (x) => x.value === rule.resolutionType
                  )}
                  onChange={(opt) => updateRule(i, "resolutionType", opt.value)}
                />
              </div>

              {/* Conditional Fields */}
              {rule.resolutionType === "Fine" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label>Fine Amount</label>
                    <input
                      className={inputClass}
                      value={rule.amount}
                      onChange={(e) => updateRule(i, "amount", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Amount Type</label>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={rule.amountType}
                      onChange={(e) =>
                        updateRule(i, "amountType", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {rule.resolutionType === "MakeUpHours" && (
                <div>
                  <label>Required Make-up Hours</label>
                  <input
                    className={inputClass}
                    value={rule.requiredMakeUpHours}
                    onChange={(e) =>
                      updateRule(i, "requiredMakeUpHours", e.target.value)
                    }
                  />
                </div>
              )}

              {rule.resolutionType === "LeaveDeduction" && (
                <div>
                  <label>Leave Type</label>
                  <input
                    className={inputClass}
                    value={rule.leaveType}
                    onChange={(e) => updateRule(i, "leaveType", e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRule}
            className="px-4 py-1.5 text-xs cursor-pointer rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            + Add Rule
          </button>

          {/* ================= FOOTER BUTTONS ================= */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs cursor-pointer rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-1.5 text-xs rounded-md text-white transition
              ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-primary hover:secondary cursor-pointer"
              }`}
            >
              {loading ? "Saving..." : "Save Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
