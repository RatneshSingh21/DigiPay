import React, { useEffect, useState, useMemo } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { X, Bell, Clock } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const NotificationPanel = ({ notifications, onClose }) => {
  const [statusMap, setStatusMap] = useState({});
  const [statusColorMap, setStatusColorMap] = useState({});
  const [employeesMap, setEmployeesMap] = useState({});
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const companyId = useAuthStore((state) => state.companyId);

  // Fetch Status Master
  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      const map = {};
      const colorMap = {};
      res.data.data.forEach((s) => {
        map[s.statusId] = s.statusName;
        switch (s.statusName.toLowerCase()) {
          case "pending":
            colorMap[s.statusId] = "bg-yellow-100 text-yellow-800";
            break;
          case "approved":
            colorMap[s.statusId] = "bg-green-100 text-green-800";
            break;
          case "rejected":
            colorMap[s.statusId] = "bg-red-100 text-red-800";
            break;
          case "paid":
            colorMap[s.statusId] = "bg-blue-100 text-blue-800";
            break;
          default:
            colorMap[s.statusId] = "bg-gray-100 text-gray-800";
        }
      });
      setStatusMap(map);
      setStatusColorMap(colorMap);
    } catch (error) {
      console.error("Error fetching status master:", error);
      toast.error("Failed to load status master");
    }
  };

  // Fetch Employees for the company
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get(
        `/user-auth/getEmployee/companyId/${companyId}`,
      );
      const map = {};
      res.data.data.forEach((emp) => {
        map[emp.id] = `${emp.fullName} (${emp.employeeCode})`;
      });
      setEmployeesMap(map);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchEmployees();
  }, [companyId]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      return (
        (filterStatus ? n.statusId === filterStatus.value : true) &&
        (filterType ? n.requestTypeId === filterType.value : true)
      );
    });
  }, [notifications, filterStatus, filterType]);

  // Prepare react-select options
  const statusOptions = useMemo(() => {
    return Object.entries(statusMap)
      .filter(([id, name]) => !["Paid", "Partial"].includes(name))
      .map(([id, name]) => ({ value: parseInt(id), label: name }));
  }, [statusMap]);

  const requestTypeOptions = useMemo(() => {
    const types = Array.from(
      new Set(notifications.map((n) => n.requestTypeId)),
    );
    return types.map((typeId) => ({
      value: typeId,
      label: notifications.find((n) => n.requestTypeId === typeId)
        ?.requestTypeName,
    }));
  }, [notifications]);

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-xl z-30 max-h-[400px] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300 bg-gray-50 rounded-t-xl">
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
          className="p-1 rounded-full hover:bg-red-600 cursor-pointer hover:text-white transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 p-3 border-b border-gray-300 bg-gray-50">
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          options={statusOptions}
          placeholder="All Statuses"
          isClearable
        />
        <Select
          value={filterType}
          onChange={setFilterType}
          options={requestTypeOptions}
          placeholder="All Request Types"
          isClearable
        />
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          No new notifications.
        </div>
      ) : (
        <ul className="divide-y">
          {filteredNotifications.map((item) => (
            <li
              key={item.approvalId}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer rounded-lg m-2 border border-gray-300 shadow-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                {/* Request Info */}
                <div>
                  <p className="text-sm text-gray-800 font-semibold">
                    {item.requestTypeName} Request
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Applied by:</span>{" "}
                    {employeesMap[item.employeeId] || item.employeeId}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Approved by:</span>{" "}
                    {employeesMap[item.approverId] || item.approverId}
                  </p>
                  {item.comments && (
                    <p className="text-xs text-gray-500 mt-1 italic border-l-2 border-gray-200 pl-2">
                      Comments : “{item.comments}”
                    </p>
                  )}
                </div>

                {/* Status */}
                <div
                  className={`font-medium px-3 py-1 rounded-full text-sm ${
                    statusColorMap[item.statusId]
                  }`}
                >
                  {statusMap[item.statusId] || "Unknown"}
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(parseISO(item.createdOn), {
                  addSuffix: true,
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Custom scrollbar */}
      <style>{`
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
