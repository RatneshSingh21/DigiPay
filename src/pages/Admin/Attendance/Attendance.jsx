import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

import AttendanceHeader from "./components/AttendanceHeader";
import AttendanceList from "./components/AttendanceList";
import EditAttendanceModal from "./components/EditAttendanceModal";
import EditHistoryModal from "./components/EditHistoryModal";
import useAuthStore from "../../../store/authStore";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [companyEmployees, setCompanyEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDates, setOpenDates] = useState({});
  const user = useAuthStore((state) => state.user);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editPunchType, setEditPunchType] = useState("IN");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);

  const formatTotalHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";

    const diffMs = new Date(outTime) - new Date(inTime);
    if (diffMs <= 0) return "-";

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  // ================= FETCH ATTENDANCE =================
  const fetchAttendance = async () => {
    try {
      const res = await axiosInstance.get("/Attendance/all");
      const raw = res.data || [];
      const merged = {};

      raw.forEach((item) => {
        const dateOnly = new Date(item.attendanceDate);
        dateOnly.setHours(0, 0, 0, 0);

        const key = `${item.employeeId}-${dateOnly.toISOString().split("T")[0]}`;

        if (!merged[key]) {
          merged[key] = {
            employeeId: item.employeeId,
            attendanceDate: item.attendanceDate,
            inTime: null,
            outTime: null,
            inRemark: null,
            outRemark: null,
            inAttendanceId: null,
            outAttendanceId: null,
            status: item.status,
            isManual: false,
            verificationMode: null,
            _lastUpdated: new Date(item.createdAt),
          };
        }

        const current = merged[key];
        const itemTime = new Date(item.createdAt);

        if (item.punchType === "IN") {
          current.inTime = item.inTime;
          current.inAttendanceId = item.attendanceId;
          current.inRemark = item.remarks || null;
        }

        if (item.punchType === "OUT") {
          current.outTime = item.outTime;
          current.outAttendanceId = item.attendanceId;
          current.outRemark = item.remarks || null;
        }

        if (item.isManual) current.isManual = true;

        const priority = { ADMIN: 4, WEB: 3, EMPLOYEE: 2, SYSTEM: 1, null: 0 };
        if (
          priority[item.verificationMode] > priority[current.verificationMode]
        ) {
          current.verificationMode = item.verificationMode;
        }

        if (itemTime > current._lastUpdated) {
          current.status = item.status;
          current._lastUpdated = itemTime;
        }
      });

      setAttendanceData(
        Object.values(merged).map(({ _lastUpdated, ...rest }) => ({
          ...rest,
          totalHoursFormatted: formatTotalHours(rest.inTime, rest.outTime),
        })),
      );
    } catch {
      toast.error("Failed to fetch attendance");
    }
  };

  // ================= EDIT HISTORY =================
  const fetchAllEditHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await axiosInstance.get("/Attendance/edit-history");
      setHistoryData(
        (res.data?.data || []).sort(
          (a, b) => new Date(b.editedAt) - new Date(a.editedAt),
        ),
      );
      setIsHistoryOpen(true);
    } catch {
      toast.error("Failed to load edit history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await axiosInstance.get("/user-auth/all");
    setUsers(res.data || []);
  };

  const fetchCompanyEmployees = async () => {
    const res = await axiosInstance.get(
      `/user-auth/getEmployee/companyId/${user.companyId}`,
    );
    setCompanyEmployees(res.data?.data || []);
  };

  const fetchEmployees = async () => {
    const res = await axiosInstance.get("/Employee");
    setEmployees(res.data || []);
  };

  const handleUpdateAttendance = async (payload) => {
    try {
      setSaving(true);
      await axiosInstance.put("/Attendance/update", payload);
      toast.success("Attendance updated");
      setIsEditOpen(false);
      fetchAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
    fetchUsers();
    fetchCompanyEmployees();
  }, []);

  return (
    <>
      <AttendanceHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={fetchAttendance}
        onOpenHistory={fetchAllEditHistory}
      />

      <AttendanceList
        attendanceData={attendanceData}
        employees={employees}
        searchQuery={searchQuery}
        openDates={openDates}
        setOpenDates={setOpenDates}
        onEdit={(item) => {
          setEditData(item);
          setEditPunchType("IN");
          setRemark("");
          setIsEditOpen(true);
        }}
      />

      <EditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyData={historyData}
        users={users}
        companyEmployees={companyEmployees}
        loading={historyLoading}
        page={historyPage}
        pageSize={historyPageSize}
        setPage={setHistoryPage}
        setPageSize={setHistoryPageSize}
      />

      <EditAttendanceModal
        isOpen={isEditOpen}
        editData={editData}
        editPunchType={editPunchType}
        setEditPunchType={setEditPunchType}
        remark={remark}
        setRemark={setRemark}
        saving={saving}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdateAttendance}
      />
    </>
  );
};

export default Attendance;
