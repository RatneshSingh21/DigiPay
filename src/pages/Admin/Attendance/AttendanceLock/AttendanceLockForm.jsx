import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { X } from "lucide-react";
import Select from "react-select";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const labelClass = "text-xs font-medium text-gray-600 mb-1";

const statusOptions = [
  { value: true, label: "Locked" },
  { value: false, label: "Unlocked" },
];

const componentOptions = [
  { value: "ATTENDANCE", label: "ATTENDANCE" },
//   { value: "SALARY", label: "SALARY" },
];

const sourceOptions = [
  { value: "AttendanceMachine", label: "Attendance Machine" },
  { value: "Mobile", label: "Mobile" },
  { value: "Admin Portal", label: "Admin Portal" },
];

const AttendanceLockForm = ({ editData, onSuccess, onClose }) => {
  const [form, setForm] = useState({
    component: "",
    month: "",
    year: "",
    lockedDate: "",
    reason: "",
    source: "",
  });

  const [updateData, setUpdateData] = useState({
    componentLockId: "",
    isLocked: true,
    reason: "",
    source: "",
  });

  useEffect(() => {
    if (editData) setUpdateData(editData);
  }, [editData]);

  const createLock = async () => {
    await axiosInstance.post("/component-locks", {
      ...form,
      month: Number(form.month),
      year: Number(form.year),
    });
    onSuccess();
  };

  const updateLock = async () => {
    await axiosInstance.put("/component-locks", {
      componentLockId: Number(updateData.componentLockId),
      isLocked: updateData.isLocked === true || updateData.isLocked === "true",
      reason: updateData.reason,
      source: updateData.source,
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {updateData.componentLockId
              ? "Update Attendance Lock"
              : "Create Attendance Lock"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 cursor-pointer"
          >
            <X />
          </button>
        </div>

        {/* CREATE FORM */}
        {!updateData.componentLockId && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {/* Component */}
              <div>
                <label className={labelClass}>Component</label>
                <Select
                  options={componentOptions}
                  onChange={(opt) => setForm({ ...form, component: opt.value })}
                />
              </div>

              {/* Month */}
              <div>
                <label className={labelClass}>Month</label>
                <input
                  className={inputClass}
                  type="number"
                  placeholder="1 - 12"
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                />
              </div>

              {/* Year */}
              <div>
                <label className={labelClass}>Year</label>
                <input
                  className={inputClass}
                  type="number"
                  placeholder="2026"
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>

              {/* Locked Date */}
              <div>
                <label className={labelClass}>Locked Date</label>
                <input
                  className={inputClass}
                  type="datetime-local"
                  onChange={(e) =>
                    setForm({ ...form, lockedDate: e.target.value })
                  }
                />
              </div>

              {/* Reason */}
              <div>
                <label className={labelClass}>Reason</label>
                <input
                  className={inputClass}
                  placeholder="Reason"
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              {/* Source */}
              <div>
                <label className={labelClass}>Source</label>
                <Select
                  options={sourceOptions}
                  onChange={(opt) => setForm({ ...form, source: opt.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border cursor-pointer hover:bg-gray-100 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createLock}
                className="px-4 py-2 bg-primary hover:bg-secondary cursor-pointer text-white rounded-md text-sm"
              >
                Create
              </button>
            </div>
          </>
        )}

        {/* UPDATE FORM */}
        {updateData.componentLockId && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {/* Component Lock ID */}
              <div>
                <label className={labelClass}>Component Lock ID</label>
                <input
                  className={`${inputClass} bg-gray-100 text-gray-600 cursor-not-allowed`}
                  disabled
                  value={updateData.componentLockId}
                />
              </div>

              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find(
                    (o) => o.value === updateData.isLocked,
                  )}
                  onChange={(opt) =>
                    setUpdateData({ ...updateData, isLocked: opt.value })
                  }
                />
              </div>

              {/* Reason */}
              <div>
                <label className={labelClass}>Reason</label>
                <input
                  className={inputClass}
                  value={updateData.reason}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, reason: e.target.value })
                  }
                />
              </div>

              {/* Source */}
              <div>
                <label className={labelClass}>Source</label>
                <Select
                  options={sourceOptions}
                  value={sourceOptions.find(
                    (o) => o.value === updateData.source,
                  )}
                  onChange={(opt) =>
                    setUpdateData({ ...updateData, source: opt.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border hover:bg-gray-100 cursor-pointer rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={updateLock}
                className="px-4 py-2 bg-primary hover:bg-secondary cursor-pointer text-white rounded-md text-sm"
              >
                Update
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceLockForm;
