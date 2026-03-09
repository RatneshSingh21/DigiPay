import React, { useEffect, useRef, useState, useMemo } from "react";
import Spinner from "../../../../components/Spinner";
import LeaveFilterCards from "./components/LeaveFilterCards";
import LeaveTable from "./components/LeaveTable";
import { useEmployeeLeave } from "./components/useEmployeeLeave";
import EmployeeLeaveForm from "./EmployeeLeaveForm";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FiUpload, FiDownload, FiRefreshCw, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import useAuthStore from "../../../../store/authStore";

const EmployeeLeave = () => {
  const user = useAuthStore((state) => state.user);

  const { leaves, loading, filters, setFilters, refresh } = useEmployeeLeave();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fileInputRef = useRef(null);

  // ================= FETCH MASTER DATA =================
  useEffect(() => {
    if (!user?.companyId) return;

    const fetchMasterData = async () => {
      try {
        const [leaveRes, empRes, statusRes] = await Promise.all([
          axiosInstance.get("/LeaveType"),
          axiosInstance.get(
            `/user-auth/getEmployee/companyId/${user.companyId}`,
          ),
          axiosInstance.get("/StatusMaster"),
        ]);

        setLeaveTypes(leaveRes.data?.data || leaveRes.data || []);
        setEmployees(empRes.data?.data || empRes.data || []);
        setStatuses(statusRes.data?.data || statusRes.data || []);
      } catch (err) {
        toast.error("Failed to fetch master data");
      }
    };

    fetchMasterData();
  }, [user?.companyId]);

  // ================= MAP LEAVES =================
  const mappedLeaves = useMemo(() => {
    return leaves.map((l) => {
      const emp = employees.find((e) => e.id === l.employeeId);
      const statusObj = statuses.find((s) => s.statusId === l.status);

      return {
        ...l,
        employeeDisplay: emp
          ? `${emp.fullName} (${emp.employeeCode})`
          : `Employee #${l.employeeId}`,
        statusDisplay: statusObj?.statusName ?? "Unknown",
        leaveDuration: l.isHalfDay
          ? `Half Day (${l.halfDayType})`
          : `${l.leaveDays} Day(s)`,
      };
    });
  }, [leaves, employees, statuses]);

  // ================= FILTERING =================
  const filteredLeaves = useMemo(() => {
    return mappedLeaves.filter((l) => {
      if (filters.leaveTypeId && l.leaveTypeId !== filters.leaveTypeId)
        return false;
      if (filters.statusId && l.status !== filters.statusId) return false;
      if (filters.employeeId && l.employeeId !== filters.employeeId)
        return false;

      // FROM DATE: compare only dates, ignore time
      if (filters.fromDate) {
        const leaveFrom = new Date(l.fromDate);
        const filterFrom = new Date(filters.fromDate);

        leaveFrom.setHours(0, 0, 0, 0);
        filterFrom.setHours(0, 0, 0, 0);

        if (leaveFrom < filterFrom) return false;
      }

      return true;
    });
  }, [mappedLeaves, filters]);

  // ================= EXPORT =================
  const handleExport = async () => {
    try {
      const res = await axiosInstance.get("/EmployeeLeave/export", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Employee_Leaves_${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Leave data exported successfully");
    } catch {
      toast.error("Failed to export leave data");
    }
  };

  // ================= IMPORT =================
  const handleImport = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosInstance.post("/EmployeeLeave/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Leave data imported successfully");
      refresh();
    } catch {
      toast.error("Failed to import leave data");
    } finally {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* ================= ACTION BAR ================= */}
      <div className="bg-white rounded-2xl shadow px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Employee Leave Management
        </h2>

        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleImport(e.target.files[0])}
          />

          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer bg-primary text-white hover:bg-secondary"
          >
            <FiPlus /> Apply Leave
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
          >
            <FiUpload /> Import
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer bg-green-600 text-white hover:bg-green-700"
          >
            <FiDownload /> Export
          </button>

          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <LeaveFilterCards
        filters={filters}
        setFilters={setFilters}
        leaveTypes={leaveTypes}
        statuses={statuses}
        employees={employees}
      />

      {/* ================= TABLE ================= */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <LeaveTable leaves={filteredLeaves} />
      )}

      {/* ================= APPLY MODAL ================= */}
      {showApplyModal && (
        <EmployeeLeaveForm
          onClose={() => {
            setShowApplyModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeLeave;
