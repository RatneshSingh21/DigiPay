import React from "react";

const PerDayAttendancePunchesCalendar = ({
    perDayDetails = [],
    selectedMonth,
    selectedYear,
    onDayClick,
}) => {
    const sortedDays = [...perDayDetails].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const year = selectedYear;
    const month = selectedMonth;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDayOfWeek; i++) calendar.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
        const dayData = sortedDays.find(
            (d) => new Date(d.date).getDate() === day
        );

        calendar.push(dayData || { date: new Date(year, month, day) });
    }

    // ===== STATUS =====
    const getStatus = (day) => {
        if (day.isHoliday) return "Holiday";
        if (day.isWeekend) return "Weekend";
        if (day.isOnLeave) return "Leave";

        if (day.isAbsent) return "Absent";
        if (!day.inTime && !day.outTime) return "Absent";
        if (!day.inTime) return "Missing In";
        if (!day.outTime) return "Missing Out";

        return "Present";
    };

    const isEditable = (day) => {
        const status = getStatus(day);

        // Allow edit for missing/absent always
        if (
            status === "Missing In" ||
            status === "Missing Out" ||
            status === "Absent"
        ) {
            return true;
        }

        // NEW: If weekend but employee has punches → allow edit
        if (day.isWeekend && (day.inTime || day.outTime)) {
            return true;
        }

        return false;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Present":
                return "bg-green-50 border-green-200";
            case "Absent":
                return "bg-red-50 border-red-200";
            case "Missing In":
                return "bg-yellow-50 border-yellow-200";
            case "Missing Out":
                return "bg-orange-50 border-orange-200";
            case "Weekend":
                return "bg-gray-100 border-gray-300";

            case "Holiday":
                return "bg-blue-50 border-blue-200";

            case "Leave":
                return "bg-purple-50 border-purple-200";
            default:
                return "bg-gray-100 border-gray-200";
        }
    };

    const getBadgeColor = (status) => {
        switch (status) {
            case "Present":
                return "bg-green-100 text-green-700";
            case "Absent":
                return "bg-red-100 text-red-700";
            case "Missing In":
                return "bg-yellow-100 text-yellow-700";
            case "Missing Out":
                return "bg-orange-100 text-orange-700";
            case "Weekend":
                return "bg-gray-200 text-gray-700";

            case "Holiday":
                return "bg-blue-100 text-blue-700";

            case "Leave":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="max-h-[75vh] overflow-y-auto px-3 py-2">
            {/* HEADER */}
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    {new Date(year, month).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                    })}
                </h3>
                <p className="text-xs text-gray-500">Click only missing days to edit</p>
            </div>

            {/* WEEK DAYS */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-500 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            {/* CALENDAR */}
            <div className="grid grid-cols-7 gap-2 text-xs">
                {calendar.map((day, idx) => {
                    if (!day) return <div key={idx} className="h-24" />;

                    const status = getStatus(day);
                    const editable = isEditable(day);

                    return (
                        <div
                            key={idx}
                            onClick={() => editable && onDayClick(day)}
                            className={`
                h-28 p-2 rounded-xl border shadow-sm transition-all
                ${getStatusColor(status)}
                ${editable ? "cursor-pointer hover:scale-[1.03] hover:shadow-md" : "opacity-70 cursor-not-allowed"}
              `}
                        >
                            {/* DATE */}
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">
                                    {new Date(day.date).getDate()}
                                </span>

                                {/* EDIT TAG */}
                                {editable && (
                                    <span className="text-[9px] px-1 py-[2px] bg-indigo-100 text-indigo-600 rounded">
                                        Edit
                                    </span>
                                )}
                            </div>

                            {/* STATUS BADGE */}
                            <div
                                className={`mt-1 inline-block px-2 py-[2px] text-[10px] font-semibold rounded-full ${getBadgeColor(
                                    status
                                )}`}
                            >
                                {status}
                            </div>

                            {/* TIMES */}
                            {/* TIMES */}
                            {(day.inTime || day.outTime) && (
                                <div className="mt-2 text-[11px] text-gray-700 space-y-1">
                                    <div className="flex justify-between">
                                        <span>In</span>
                                        <span>
                                            {day.inTime
                                                ? new Date(day.inTime).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Out</span>
                                        <span>
                                            {day.outTime
                                                ? new Date(day.outTime).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "-"}
                                        </span>
                                    </div>

                                    {/* ADD THIS */}
                                    {day.totalHours > 0 && (
                                        <div className="flex justify-between font-semibold text-indigo-600">
                                            <span>Hours</span>
                                            <span>{day.totalHours.toFixed(2)}h</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PerDayAttendancePunchesCalendar;