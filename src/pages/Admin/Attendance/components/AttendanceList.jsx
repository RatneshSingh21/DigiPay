import { FaRegCalendarAlt } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";

const AttendanceList = ({
  attendanceData,
  employees,
  loading,
  searchQuery,
  openDates,
  setOpenDates,
  onEdit, // edit handler from parent
}) => {
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : `Emp#${id}`;
  };

  const filteredAttendance = attendanceData.filter((item) =>
    getEmployeeName(item.employeeId)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const groupedByDate = filteredAttendance.reduce((groups, item) => {
    const dateKey = new Date(item.attendanceDate).toLocaleDateString("en-GB");
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
    return groups;
  }, {});

  const toggleDate = (date) => {
    setOpenDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const statusColors = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-yellow-100 text-yellow-700",
    Early: "bg-purple-100 text-purple-700",
    Default: "bg-gray-100 text-gray-700",
  };

  const getStatusClass = (status) =>
    statusColors[status] || statusColors.Default;

  return (
    <div className="mx-3">
      {loading ? (
        <div className="text-center py-4 text-gray-500">
          Loading attendance...
        </div>
      ) : Object.keys(groupedByDate).length > 0 ? (
        Object.keys(groupedByDate)
          .sort(
            (a, b) =>
              new Date(b.split("/").reverse().join("-")) -
              new Date(a.split("/").reverse().join("-")),
          )
          .map((date) => (
            <div
              key={date}
              className="mb-4 shadow rounded-lg bg-white overflow-hidden"
            >
              {/* Date Header */}
              <div
                onClick={() => toggleDate(date)}
                className="bg-gray-300 text-black px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <FaRegCalendarAlt /> {date}
                </span>
                <span className="text-lg">{openDates[date] ? "▼" : "▶"}</span>
              </div>

              {/* Table */}
              {openDates[date] && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-center divide-y divide-gray-200">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="py-2 px-3">S.No</th>
                        <th className="py-2 px-3">Employee</th>
                        <th className="py-2 px-3">In Time</th>
                        <th className="py-2 px-3">Out Time</th>
                        <th className="py-2 px-3">Total Hours</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Mode</th>
                        <th className="py-2 px-3">Manual</th>
                        <th className="py-2 px-3">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {groupedByDate[date].map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-3">{index + 1}.</td>

                          <td className="py-2 px-3">
                            <div className="flex items-center justify-center gap-2">
                              <span>{getEmployeeName(item.employeeId)}</span>

                              {item.isManual && (
                                <span
                                  className="text-xs text-orange-600 font-semibold"
                                  title="Attendance edited by Admin"
                                >
                                  (Edited)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-3">
                            <TimeWithRemark
                              time={item.inTime}
                              remark={item.inRemark}
                            />
                          </td>

                          <td className="py-2 px-3">
                            <TimeWithRemark
                              time={item.outTime}
                              remark={item.outRemark}
                            />
                          </td>
                          <td className="text-sm text-gray-700">
                            {item.totalHoursFormatted}
                          </td>

                          <td className="py-2 px-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                item.status,
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="py-2 px-3">
                            <span
                              className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                              title={
                                item.verificationMode === "ADMIN"
                                  ? "Edited by Admin"
                                  : item.verificationMode === "WEB"
                                    ? "Marked via Web"
                                    : "System generated"
                              }
                            >
                              {item.verificationMode || "SYSTEM"}
                            </span>
                          </td>

                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${item.isManual
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {item.isManual ? "Manual" : "Auto"}
                            </span>
                          </td>

                          {/* Edit Button */}
                          <td className="py-2 px-3">
                            <button
                              onClick={() => onEdit(item)}
                              title="Edit attendance"
                              className="
                                inline-flex items-center cursor-pointer gap-1
                                rounded-full px-3 py-1.5
                                text-xs font-semibold
                                text-indigo-700 bg-indigo-100
                                hover:bg-indigo-200 hover:text-indigo-800
                                transition-all duration-150
                                focus:outline-none focus:ring-2 focus:ring-indigo-400
                                "
                            >
                              <FiEdit2 className="text-sm" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center text-center bg-white border border-dashed border-gray-300 rounded-2xl p-10 max-w-md shadow-sm">
            <div className="mb-4 rounded-full bg-indigo-100 p-4 text-indigo-600">
              <FaRegCalendarAlt className="text-2xl" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              {searchQuery
                ? "No Matching Attendance Records"
                : "No Attendance Records Found"}
            </h3>

            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {searchQuery
                ? "Try adjusting your search term or clear the filter to view all attendance data."
                : "Attendance data has not been recorded yet. Once employees punch in or data is imported, it will appear here."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
const TimeWithRemark = ({ time, remark }) => {
  if (!time) return <span className="text-gray-400">—</span>;

  const formattedTime = new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative inline-flex group">
      {/* Time Chip */}
      <span
        className="
          px-2.5 py-1
          rounded-md
          text-xs font-medium
          bg-gray-100 text-gray-800
          hover:bg-indigo-100 hover:text-indigo-700
          transition-colors
          cursor-help
        "
      >
        {formattedTime}
      </span>

      {/* Tooltip */}
      {remark && (
        <div
          className="
            absolute left-1/2 -translate-x-1/2 top-full mt-2
            hidden group-hover:block z-50
            w-60
          "
        >
          {/* Arrow */}
          <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200" />

          {/* Tooltip box */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-left">
            <div className="text-xs font-semibold text-gray-800 mb-1">
              Remark
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              {remark}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
