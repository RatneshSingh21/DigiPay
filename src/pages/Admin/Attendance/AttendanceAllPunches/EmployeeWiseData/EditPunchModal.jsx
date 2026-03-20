import { useState } from "react";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

// helper inside component
const getStatusBadge = (status) => {
    switch (status) {
        case "Present":
            return "bg-green-100 text-green-700";
        case "Absent":
            return "bg-red-100 text-red-700";
        case "Missing In":
            return "bg-yellow-100 text-yellow-700";
        case "Missing Out":
            return "bg-orange-100 text-orange-700";
        default:
            return "bg-gray-100 text-gray-600";
    }
};


const EditPunchModal = ({ day, employeeId, onClose, onSuccess }) => {
    const baseDate = new Date(day.date).toISOString().split("T")[0];

    const [inTime, setInTime] = useState(
        day.inTime ? day.inTime.substring(11, 16) : ""
    );
    const [outTime, setOutTime] = useState(
        day.outTime ? day.outTime.substring(11, 16) : ""
    );

    const [saving, setSaving] = useState(false);

    const hasIn = !!day.inTime;
    const hasOut = !!day.outTime;

    const getStatus = () => {
        if (!hasIn && !hasOut) return "Absent";
        if (!hasIn) return "Missing In";
        if (!hasOut) return "Missing Out";
        return "Present";
    };

    const handleSave = async () => {
        if (!hasIn && !inTime) return toast.error("Enter In Time");
        if (!hasOut && !outTime) return toast.error("Enter Out Time");

        try {
            setSaving(true);

            if (!hasIn && !hasOut) {
                await axiosInstance.put("/DailyAttendanceStatus/edit", {
                    employeeId,
                    attendanceDate: day.date,
                    newInTime: `${baseDate}T${inTime}:00`,
                    newOutTime: `${baseDate}T${outTime}:00`,
                });
            } else if (!hasIn) {
                await axiosInstance.put("/DailyAttendanceStatus/edit-in", {
                    employeeId,
                    attendanceDate: day.date,
                    newInTime: `${baseDate}T${inTime}:00`,
                });
            } else if (!hasOut) {
                await axiosInstance.put("/DailyAttendanceStatus/edit-out", {
                    employeeId,
                    attendanceDate: day.date,
                    newOutTime: `${baseDate}T${outTime}:00`,
                });
            }

            toast.success("Attendance updated");
            onSuccess();
            onClose();
        } catch {
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">

            <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Edit Attendance
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(day.date).toDateString()}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 cursor-pointer transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="px-5 py-4 space-y-4">

                    {/* STATUS BADGE */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>

                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(
                                getStatus()
                            )}`}
                        >
                            {getStatus()}
                        </span>
                    </div>

                    {/* IN TIME */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            In Time
                        </label>
                        <input
                            type="time"
                            value={inTime}
                            disabled={hasIn}
                            onChange={(e) => setInTime(e.target.value)}
                            className={inputClass}
                        />
                        {hasIn && (
                            <p className="text-xs text-gray-400 mt-1">
                                Already recorded
                            </p>
                        )}
                    </div>

                    {/* OUT TIME */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Out Time
                        </label>
                        <input
                            type="time"
                            value={outTime}
                            disabled={hasOut}
                            onChange={(e) => setOutTime(e.target.value)}
                            className={inputClass}
                        />
                        {hasOut && (
                            <p className="text-xs text-gray-400 mt-1">
                                Already recorded
                            </p>
                        )}
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-md border cursor-pointer border-gray-300 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 text-sm rounded-md bg-primary cursor-pointer text-white font-medium hover:bg-secondary disabled:opacity-50 transition"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPunchModal;