import Select from "react-select";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const punchTypeOptions = [
  { value: "IN", label: "IN" },
  { value: "OUT", label: "OUT" },
];

const EditAttendanceModal = ({
  isOpen,
  editData,
  editPunchType,
  setEditPunchType,
  remark,
  setRemark,
  saving,
  onClose,
  onSave,
}) => {
  const [timeValue, setTimeValue] = useState("");

  useEffect(() => {
    if (!editData) return;

    if (editPunchType === "IN") {
      setTimeValue(editData.inTime ? editData.inTime.slice(11, 16) : "");
    } else {
      setTimeValue(editData.outTime ? editData.outTime.slice(11, 16) : "");
    }
  }, [editData, editPunchType]);

  if (!isOpen || !editData) return null;

  const attendanceDate = editData.attendanceDate.split("T")[0];

  const isSaveDisabled = !remark || !timeValue || saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit Attendance
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-2">

          {/* Punch Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Punch Type
            </label>

            <Select
              options={punchTypeOptions}
              value={punchTypeOptions.find(
                (opt) => opt.value === editPunchType
              )}
              onChange={(opt) => setEditPunchType(opt.value)}
              className="mt-1 text-sm"
              classNamePrefix="react-select"
              isSearchable={false}
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {editPunchType === "IN" ? "In Time" : "Out Time"}
            </label>

            <input
              type="time"
              className={inputClass}
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Remark <span className="text-red-500">*</span>
            </label>

            <textarea
              rows={3}
              className={inputClass}
              placeholder="Reason for updating attendance"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <p className="mt-1 text-xs text-gray-500">
              This remark will be visible on hover in attendance records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="rounded-md border cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={isSaveDisabled}
            onClick={() =>
              onSave({
                attendanceId:
                  editPunchType === "IN"
                    ? editData.inAttendanceId
                    : editData.outAttendanceId,
                attendanceDate: editData.attendanceDate,
                inTime:
                  editPunchType === "IN"
                    ? `${attendanceDate}T${timeValue}:00`
                    : null,
                outTime:
                  editPunchType === "OUT"
                    ? `${attendanceDate}T${timeValue}:00`
                    : null,
                remarks: remark,
                source: "ADMIN_PANEL",
                verificationMode: "ADMIN",
                isManual: true,
              })
            }
            className="
              rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white cursor-pointer
              hover:bg-secondary disabled:opacity-50
            "
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
