import { FiRefreshCw } from "react-icons/fi";

const AttendanceHeader = ({
  searchQuery,
  setSearchQuery,
  onRefresh,
  onOpenHistory,
  // onOpenExport,
}) => (
  <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
    <h2 className="font-semibold text-xl">Attendance</h2>

    <div className="flex gap-2">
      <input
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search employee..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* <button
        onClick={onOpenExport}
        className="bg-primary text-white cursor-pointer px-4 py-2 rounded-md hover:opacity-90 transition"
      >
        MonthlyAttendance
      </button> */}

      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-3 py-2 bg-primary cursor-pointer hover:bg-secondary text-white rounded-lg text-sm"
      >
        <FiRefreshCw /> Refresh
      </button>

      <button
        onClick={onOpenHistory}
        className=" px-3 py-2 bg-green-500 cursor-pointer hover:bg-green-600 text-white rounded-lg text-sm"
      >
        History
      </button>
    </div>
  </div>
);

export default AttendanceHeader;
