import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { X, Bell, Clock } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const NotificationPanel = ({ notifications, onClose }) => {
  const [statusMap, setStatusMap] = useState({});
  const [statusColorMap, setStatusColorMap] = useState({});

  // Fetch Status Master
  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      const map = {};
      const colorMap = {};

      // Define badge colors for each status
      res.data.data.forEach((s) => {
        map[s.statusId] = s.statusName;

        switch (s.statusName.toLowerCase()) {
          case "pending":
            colorMap[s.statusId] = "bg-yellow-100 text-yellow-700";
            break;
          case "approved":
            colorMap[s.statusId] = "bg-green-100 text-green-700";
            break;
          case "rejected":
            colorMap[s.statusId] = "bg-red-100 text-red-700";
            break;
          default:
            colorMap[s.statusId] = "bg-gray-100 text-gray-700";
            break;
        }
      });

      setStatusMap(map);
      setStatusColorMap(colorMap);
    } catch (error) {
      console.error("Error fetching status master:", error);
      toast.error("Failed to load status master");
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

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
          className="p-1 rounded-full cursor-pointer hover:bg-red-600"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-600 hover:text-white" />
        </button>
      </div>

      {/* Body */}
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">
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
                      statusColorMap[item.statusId] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusMap[item.statusId] || "Unknown"}
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
