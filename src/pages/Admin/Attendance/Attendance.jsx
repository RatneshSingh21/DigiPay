import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

import AttendanceHeader from "./components/AttendanceHeader";
import AttendanceList from "./components/AttendanceList";
import EditAttendanceModal from "./components/EditAttendanceModal";
import EditHistoryModal from "./components/EditHistoryModal";
import useAuthStore from "../../../store/authStore";
import EmployeeWiseAttendance from "./components/EmployeeWiseAttendance";
import AttendanceVerificationModal from "./AttendanceVerificationModal/AttendanceVerificationModal";
// import ExportMonthlyAttendancePdfModal from "./ExportMonthlyAttendancePdf/ExportMonthlyAttendancePdf";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [companyEmployees, setCompanyEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDates, setOpenDates] = useState({});
  const user = useAuthStore((state) => state.user);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editPunchType, setEditPunchType] = useState("IN");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);

  const [viewMode, setViewMode] = useState("DATE");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const formatTotalHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";

    let start = new Date(inTime);
    let end = new Date(outTime);

    // 👇 HANDLE OVERNIGHT PUNCH
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const diffMs = end - start;
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const formatDecimalHours = (decimalHours) => {
    if (decimalHours === null || decimalHours === undefined) return "-";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    if (minutes === 60) return `${hours + 1}h 0m`;

    return `${hours}h ${minutes}m`;
  };

  // ================= FETCH ATTENDANCE =================
  const fetchAttendance = async (page = 1, date = selectedDate) => {

    try {

      const formattedDate = date.toISOString().split("T")[0];

      const res = await axiosInstance.get(
        `/Attendance/by-date?date=${formattedDate}&pageNumber=${page}&pageSize=${pageSize}`
      );

      const response = res.data;
      const raw = response.data || [];

      setPageNumber(response.pageNumber);
      setTotalPages(response.totalPages);
      setTotalRecords(response.totalRecords);
      const merged = {};

      raw.forEach((item) => {

        const key = `${item.employeeId}-${item.attendanceDate.split("T")[0]}`;

        if (!merged[key]) {
          merged[key] = {
            employeeId: item.employeeId,
            attendanceDate: item.attendanceDate,
            inTime: null,
            outTime: null,
            totalHours: null,
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
        const itemTime = item.createdAt ? new Date(item.createdAt) : new Date();

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

        if (item.totalHours !== null && item.totalHours !== undefined) {
          current.totalHours = item.totalHours;
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
          totalHoursFormatted:
            rest.totalHours !== null
              ? formatDecimalHours(rest.totalHours)
              : formatTotalHours(rest.inTime, rest.outTime),
        })),
      );
    } catch (error) {
      console.error("Fetch attendance error:", error);

      if (error.response) {
        if (error.response.status === 404) {
          toast.warning("No attendance records found for this date.");
          setAttendanceData([]);
          setTotalRecords(0);
          setTotalPages(0);
        } else if (error.response.status === 500) {
          toast.error("Server error while fetching attendance.");
        } else {
          toast.error(error.response.data?.message || "Failed to fetch attendance.");
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  // const fetchAttendance = async () => {
  //   try {
  //     const res = await axiosInstance.get("/Attendance/all");
  //     const raw = res.data || [];
  //     const merged = {};

  //     raw.forEach((item) => {
  //       const dateOnly = new Date(item.attendanceDate);
  //       dateOnly.setHours(0, 0, 0, 0);

  //       const key = `${item.employeeId}-${dateOnly.toISOString().split("T")[0]}`;

  //       if (!merged[key]) {
  //         merged[key] = {
  //           employeeId: item.employeeId,
  //           attendanceDate: item.attendanceDate,
  //           inTime: null,
  //           outTime: null,
  //           totalHours: null,
  //           inRemark: null,
  //           outRemark: null,
  //           inAttendanceId: null,
  //           outAttendanceId: null,
  //           status: item.status,
  //           isManual: false,
  //           verificationMode: null,
  //           _lastUpdated: new Date(item.createdAt),
  //         };
  //       }

  //       const current = merged[key];
  //       const itemTime = new Date(item.createdAt);

  //       if (item.punchType === "IN") {
  //         current.inTime = item.inTime;
  //         current.inAttendanceId = item.attendanceId;
  //         current.inRemark = item.remarks || null;
  //       }

  //       if (item.punchType === "OUT") {
  //         current.outTime = item.outTime;
  //         current.outAttendanceId = item.attendanceId;
  //         current.outRemark = item.remarks || null;
  //       }

  //       if (item.totalHours !== null && item.totalHours !== undefined) {
  //         current.totalHours = item.totalHours;
  //       }

  //       if (item.isManual) current.isManual = true;

  //       const priority = { ADMIN: 4, WEB: 3, EMPLOYEE: 2, SYSTEM: 1, null: 0 };
  //       if (
  //         priority[item.verificationMode] > priority[current.verificationMode]
  //       ) {
  //         current.verificationMode = item.verificationMode;
  //       }

  //       if (itemTime > current._lastUpdated) {
  //         current.status = item.status;
  //         current._lastUpdated = itemTime;
  //       }
  //     });

  //     setAttendanceData(
  //       Object.values(merged).map(({ _lastUpdated, ...rest }) => ({
  //         ...rest,
  //         totalHoursFormatted:
  //           rest.totalHours !== null
  //             ? formatDecimalHours(rest.totalHours)
  //             : formatTotalHours(rest.inTime, rest.outTime),
  //       })),
  //     );
  //   } catch {
  //     toast.error("Failed to fetch attendance");
  //   }
  // };


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
    } catch (error) {
      console.error("Edit history error:", error);

      if (error.response?.status === 404) {
        toast.info("No edit history found.");
        setHistoryData([]);
      } else {
        toast.error("Failed to load edit history.");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/user-auth/all");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Fetch users error:", error);

      if (error.response?.status === 404) {
        setUsers([]);
      } else {
        toast.error("Failed to load users.");
      }
    }
  };

  const fetchCompanyEmployees = async () => {
    try {
      const res = await axiosInstance.get(
        `/user-auth/getEmployee/companyId/${user.companyId}`
      );

      setCompanyEmployees(res.data?.data || []);
    } catch (error) {
      console.error("Fetch company employees error:", error);

      if (error.response?.status === 404) {
        setCompanyEmployees([]);
      } else {
        toast.error("Failed to load company employees.");
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (error) {
      console.error("Fetch employees error:", error);

      if (error.response?.status === 404) {
        setEmployees([]);
      } else {
        toast.error("Failed to load employees.");
      }
    }
  };
  const handleUpdateAttendance = async (payload) => {
    try {
      setSaving(true);
      await axiosInstance.put("/Attendance/update", payload);
      toast.success("Attendance updated");
      setIsEditOpen(false);
      fetchAttendance(pageNumber);
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAttendance(1);
    fetchEmployees();
    fetchUsers();
    fetchCompanyEmployees();
  }, []);

  return (
    <>
      <AttendanceHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={() => fetchAttendance(pageNumber)}
        onOpenHistory={fetchAllEditHistory}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenVerification={() => setIsVerificationModalOpen(true)}
      // onOpenExport={() => setIsExportOpen(true)}
      />

      {/* DATE FILTER */}

      {viewMode === "DATE" && (
        <div className="flex justify-center mb-2">
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              setSelectedDate(newDate);
              setPageNumber(1);
              fetchAttendance(1, newDate);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

        </div>
      )}

      {viewMode === "DATE" ? (
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
      ) : (
        <EmployeeWiseAttendance
          employees={employees}
          searchQuery={searchQuery}
        />
      )}

      {/* PAGINATION */}

      {viewMode === "DATE" && (
        <>

          <div className="flex justify-center items-center gap-4 mt-6">

            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
              disabled={pageNumber === 1}
              onClick={() => fetchAttendance(pageNumber - 1)}
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {pageNumber} of {totalPages}
            </span>

            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
              disabled={pageNumber === totalPages}
              onClick={() => fetchAttendance(pageNumber + 1)}
            >
              Next
            </button>

          </div>

          <div className="text-center text-xs text-gray-500 mt-2">
            {totalRecords} punch records
          </div>

        </>

      )}


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

      <AttendanceVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />

      {/* <ExportMonthlyAttendancePdfModal
      isOpen={isExportOpen}
      onClose={() => setIsExportOpen(false)}
      /> */}
    </>
  );
};

export default Attendance;
