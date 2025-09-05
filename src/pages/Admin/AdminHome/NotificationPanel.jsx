import React from "react";
import { format } from "date-fns";
import { X, Bell, Clock } from "lucide-react";

const NotificationPanel = ({ notifications, onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl border z-30 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-700">Notifications</span>
          {notifications.length > 0 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
              {notifications.length}
            </span>
          )}
        </div>
        <button
          className="p-1 rounded-full hover:bg-red-600"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-600 hover:text-white" />
        </button>
      </div>

      {/* Body */}
      {notifications.length === 0 ? (
        <div className="p-6 text-center  text-gray-500 text-sm">
          No new notifications.
        </div>
      ) : (
        <ul className="divide-y">
          {notifications.map((item) => (
            <li
              key={item.approvalId}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-800">
                  Request{" "}
                  <span className="font-semibold">
                    #{item.genericRequestId}
                  </span>{" "}
                  is{" "}
                  <span
                    className={`font-medium px-2 py-0.5 rounded-md text-xs ${
                      item.statusId === 1
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.statusId === 1 ? "Pending" : "Updated"}
                  </span>
                </p>
              </div>

              {item.comments && (
                <p className="text-xs text-gray-600 mt-2 italic border-l-2 border-gray-200 pl-2">
                  “{item.comments}”
                </p>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                <Clock className="w-3 h-3" />
                {format(new Date(item.createdOn), "dd MMM yyyy, hh:mm a")}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Custom scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
