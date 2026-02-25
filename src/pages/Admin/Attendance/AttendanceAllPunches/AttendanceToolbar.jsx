import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

const inputClass =
  "h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

const AttendanceToolbar = ({ selectedDate, setSelectedDate, onSync }) => {
  return (
    <div
      className="
        sticky top-14 z-10
        bg-white/95 backdrop-blur-sm
        border-b border-gray-300
        px-6 py-4
        flex justify-between items-center
      "
    >
      {/* ===== LEFT TITLE SECTION ===== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Attendance Management
        </h2>
        <p className="text-xs text-gray-500">
          Date-wise Employee Punch Records
        </p>
      </div>

      {/* ===== RIGHT CONTROLS ===== */}
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={inputClass}
        />

        <button
          onClick={onSync}
          className="
            inline-flex items-center gap-2
            h-10 px-4
            rounded-md
            text-sm font-semibold text-white
            bg-primary cursor-pointer
            hover:bg-secondary
            shadow-sm hover:shadow-md
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50
            disabled:opacity-60 disabled:cursor-not-allowed
            active:scale-95
          "
        >
          <RefreshCw size={16} />
          Sync
        </button>
      </div>
    </div>
  );
};

export default AttendanceToolbar;
