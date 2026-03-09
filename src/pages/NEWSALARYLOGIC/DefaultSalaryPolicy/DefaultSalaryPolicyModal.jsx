import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Select from "react-select";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const attendanceModes = [
  { label: "Cut All Components", value: "CutAllComponents" },
  {
    label: "Cut Only Attendance Sensitive",
    value: "CutOnlyAttendanceSensitive",
  },
  { label: "Cut Only Basic", value: "CutOnlyBasic" },
];

const roundingOptions = [
  { label: "No Rounding", value: "None" },
  { label: "Round Up", value: "RoundUp" },
  { label: "Round Down", value: "RoundDown" },
  { label: "Round To Nearest", value: "Nearest" },
];

export default function DefaultSalaryPolicyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const defaultState = {
    policyName: "",
    prorateByAttendance: true,
    attendanceCutMode: "CutAllComponents",
    applyAttendanceForNewEmployeesOnly: false,
    attendanceJoinYearThreshold: null,
    netSalaryRoundingPolicy: "None",
    roundingNearestValue: null,
    allowNegativeSalary: false,
    activateNow: true,
  };

  const [form, setForm] = useState(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...defaultState,
        ...initialData,
        activateNow: false,
      });
    } else {
      setForm(defaultState);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const payload = {
      policyName: form.policyName?.trim(),

      prorateByAttendance: form.prorateByAttendance,

      attendanceCutMode: form.prorateByAttendance
        ? form.attendanceCutMode
        : "CutAllComponents",

      applyAttendanceForNewEmployeesOnly:
        form.prorateByAttendance && form.applyAttendanceForNewEmployeesOnly,

      attendanceJoinYearThreshold:
        form.prorateByAttendance && form.applyAttendanceForNewEmployeesOnly
          ? Number(form.attendanceJoinYearThreshold)
          : null,

      netSalaryRoundingPolicy: form.netSalaryRoundingPolicy,

      roundingNearestValue:
        form.netSalaryRoundingPolicy === "Nearest"
          ? Number(form.roundingNearestValue)
          : null,

      allowNegativeSalary: form.allowNegativeSalary,
      activateNow: form.activateNow,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {initialData ? "Edit Salary Policy" : "Create Salary Policy"}
            </h2>
            <p className="text-sm text-gray-500">
              Configure how salary is calculated and processed.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 cursor-pointer text-2xl font-semibold"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Policy Name
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Standard Monthly Policy"
              value={form.policyName}
              onChange={(e) => setForm({ ...form, policyName: e.target.value })}
            />
          </div>

          {/* Attendance Rules */}
          <div className="border-t border-gray-200 pt-2 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Attendance Rules
            </h3>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.prorateByAttendance}
                onChange={(e) =>
                  setForm({ ...form, prorateByAttendance: e.target.checked })
                }
                className="accent-primary"
              />
              <span className="text-sm text-gray-700">
                Prorate salary based on attendance
              </span>
            </label>

            {form.prorateByAttendance && (
              <div className="space-y-2 ml-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Attendance Cut Mode
                  </label>
                  <Select
                    options={attendanceModes}
                    value={attendanceModes.find(
                      (option) => option.value === form.attendanceCutMode,
                    )}
                    onChange={(selected) =>
                      setForm({ ...form, attendanceCutMode: selected.value })
                    }
                    className="mt-1"
                    classNamePrefix="react-select"
                    isSearchable={false}
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.applyAttendanceForNewEmployeesOnly}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        applyAttendanceForNewEmployeesOnly: e.target.checked,
                        attendanceJoinYearThreshold: null,
                      })
                    }
                    className="accent-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Apply only for new employees
                  </span>
                </label>

                {form.applyAttendanceForNewEmployeesOnly && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Join Year Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      placeholder="e.g. 1"
                      value={form.attendanceJoinYearThreshold ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          attendanceJoinYearThreshold: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rounding */}
          <div className="border-t border-gray-200 pt-2 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Net Salary Rounding
            </h3>

            <Select
              options={roundingOptions}
              value={roundingOptions.find(
                (option) => option.value === form.netSalaryRoundingPolicy,
              )}
              onChange={(selected) =>
                setForm({
                  ...form,
                  netSalaryRoundingPolicy: selected.value,
                  roundingNearestValue: null,
                })
              }
              className="mt-1"
              classNamePrefix="react-select"
              isSearchable={false}
            />

            {form.netSalaryRoundingPolicy === "Nearest" && (
              <input
                type="number"
                min="1"
                className={inputClass}
                placeholder="Nearest value (e.g. 10, 100)"
                value={form.roundingNearestValue ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    roundingNearestValue: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            )}
          </div>

          {/* Controls */}
          <div className="border-t border-gray-200 pt-2 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Controls
            </h3>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.allowNegativeSalary}
                onChange={(e) =>
                  setForm({ ...form, allowNegativeSalary: e.target.checked })
                }
                className="accent-primary"
              />
              <span className="text-sm text-gray-700">
                Allow negative salary
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.activateNow}
                onChange={(e) =>
                  setForm({ ...form, activateNow: e.target.checked })
                }
                className="accent-primary"
              />
              <span className="text-sm text-gray-700">
                Activate immediately after saving
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!form.policyName.trim()}
            className="px-6 py-2 rounded-lg cursor-pointer bg-primary text-white hover:bg-secondary transition disabled:opacity-50"
          >
            Save Policy
          </button>
        </div>
      </div>
    </div>
  );
}
