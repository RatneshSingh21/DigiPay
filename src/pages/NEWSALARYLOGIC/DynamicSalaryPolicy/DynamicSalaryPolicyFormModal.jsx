import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const attendanceOptions = [
  { value: 1, label: "Cut All Components" },
  { value: 2, label: "Cut Only Attendance Sensitive" },
  { value: 3, label: "Cut Only Basic" },
];

const roundingOptions = [
  { value: 0, label: "No Rounding" },
  { value: 1, label: "Round Up" },
  { value: 2, label: "Round Down" },
  { value: 3, label: "Round to Nearest" },
];

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const defaultForm = {
  policyName: "",
  prorateByAttendance: false,
  attendanceCutMode: 1,
  applyAttendanceForNewEmployeesOnly: false,
  attendanceJoinYearThreshold: null,
  netSalaryRoundingPolicy: 0,
  roundingNearestValue: null,
  allowNegativeSalary: false,
  activateNow: true,
};

export default function DynamicSalaryPolicyFormModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(defaultForm);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFormData(defaultForm);
    }
  }, [isOpen]);

  // 🔥 AFTER all hooks
  if (!isOpen) return null;

  const payload = {
    policyName: formData.policyName.trim(),

    policyRuleSetJson: JSON.stringify({
      prorateByAttendance: formData.prorateByAttendance,
      attendanceCutMode: formData.attendanceCutMode,
      applyAttendanceForNewEmployeesOnly:
        formData.applyAttendanceForNewEmployeesOnly,
      attendanceJoinYearThreshold: formData.attendanceJoinYearThreshold,
    }),

    netSalaryRoundingPolicy: formData.netSalaryRoundingPolicy,

    roundingNearestValue:
      formData.netSalaryRoundingPolicy === 3
        ? (formData.roundingNearestValue ?? 0)
        : 0,

    allowNegativeSalary: formData.allowNegativeSalary,

    activateNow: formData.activateNow,
  };

  const handleSubmit = async () => {
    if (!formData.policyName.trim()) {
      toast.error("Policy name is required");
      return;
    }

    try {
      await onSubmit(payload);

      setFormData(defaultForm); // reset form
      onClose(); // close modal
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white min-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Create Salary Policy</h2>
            <p className="text-sm text-gray-500">
              Configure attendance, rounding and salary controls
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-500 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6 space-y-8">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Policy Name</label>
              <input
                type="text"
                className={inputClass}
                value={formData.policyName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policyName: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.activateNow}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activateNow: e.target.checked,
                    })
                  }
                  className="accent-primary"
                />
                Activate Immediately
              </label>
            </div>
          </div>

          {/* Attendance */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="font-semibold text-gray-700">
              Attendance Configuration
            </h3>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.prorateByAttendance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prorateByAttendance: e.target.checked,
                  })
                }
                className="accent-primary"
              />
              Prorate Salary by Attendance
            </label>

            {formData.prorateByAttendance && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">
                    Attendance Cut Mode
                  </label>
                  <Select
                    options={attendanceOptions}
                    value={attendanceOptions.find(
                      (o) => o.value === formData.attendanceCutMode,
                    )}
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        attendanceCutMode: selected.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Join Year Threshold
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.attendanceJoinYearThreshold || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attendanceJoinYearThreshold: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.applyAttendanceForNewEmployeesOnly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applyAttendanceForNewEmployeesOnly: e.target.checked,
                        })
                      }
                      className="accent-primary"
                    />
                    Apply Attendance Only For New Employees
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Rounding */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="font-semibold text-gray-700">Net Salary Rounding</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Rounding Mode</label>
                <Select
                  options={roundingOptions}
                  value={roundingOptions.find(
                    (o) => o.value === formData.netSalaryRoundingPolicy,
                  )}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      netSalaryRoundingPolicy: selected.value,
                    })
                  }
                />
              </div>

              {formData.netSalaryRoundingPolicy === 3 && (
                <div>
                  <label className="text-sm font-medium">Nearest Value</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.roundingNearestValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roundingNearestValue: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.allowNegativeSalary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allowNegativeSalary: e.target.checked,
                  })
                }
                className="accent-primary"
              />
              Allow Negative Salary
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-secondary text-white shadow cursor-pointer"
          >
            Save Policy
          </button>
        </div>
      </div>
    </div>
  );
}
