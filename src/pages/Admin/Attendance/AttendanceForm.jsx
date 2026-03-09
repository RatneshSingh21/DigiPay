import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import ImportExportAttendance from "./ImportExportAttendance";
import ExportAttendanceModal from "./ExportAttendanceModal";
import BulkUpdateAttendance from "./BulkUpdateAttendance";

const statusOptions = [
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Half Day", label: "Half Day" },
  { value: "Leave", label: "Leave" },
];

const workTypeOptions = [
  { value: "Remote", label: "Remote" },
  { value: "Office", label: "Office" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Work From Home", label: "Work From Home" },
];

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const AttendanceForm = () => {
  const [shiftOptions, setShiftOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [punchTypeOptions, setPunchTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false); // Modal toggle state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);

  const [formData, setFormData] = useState({
    employee: null,
    attendanceDate: new Date().toISOString().split("T")[0],
    inTime: "09:00",
    outTime: "18:00",
    status: null,
    workType: null,
    shift: null,
    punchType: null,
  });

  // Fetch initial dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empRes, shiftRes, punchRes, mappingRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/Shift"),
          axiosInstance.get("/PunchType"),
          axiosInstance.get("/ShiftMapping/all"),
        ]);

        const employees = empRes.data.map((emp) => ({
          label: emp.fullName + ` (${emp.employeeCode})`,
          value: emp.id,
        }));
        setEmployeeOptions(employees);

        const punches =
          punchRes.data.data?.map((p) => ({
            label: p.name,
            value: p.code,
          })) || [];
        setPunchTypeOptions(punches);

        setShiftOptions({
          allShifts: shiftRes.data,
          allMappings: mappingRes.data?.data || [],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dynamic shift list update
  useEffect(() => {
    if (!formData.employee || !shiftOptions.allShifts) return;

    const empMappings = shiftOptions.allMappings?.filter(
      (m) => m.employeeId === formData.employee.value,
    );
    const mappedIds = empMappings.map((m) => m.shiftId);

    const filteredShifts = shiftOptions.allShifts
      .filter((s) => mappedIds.includes(s.id))
      .map((s) => ({
        value: s.id,
        label: `${s.shiftName} (${s.shiftStart} - ${s.shiftEnd})`,
      }));

    setFormData((prev) => ({ ...prev, shift: null }));
    setShiftOptions((prev) => ({ ...prev, filtered: filteredShifts }));
  }, [formData.employee]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showInTime = formData.punchType?.value?.includes("IN");
  const showOutTime = formData.punchType?.value?.includes("OUT");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      employee,
      attendanceDate,
      inTime,
      outTime,
      status,
      workType,
      shift,
      punchType,
    } = formData;

    if (!employee || !status || !workType || !punchType) {
      toast.error("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    // Build local ISO-like strings without timezone conversion
    const buildLocalDateTime = (dateStr, timeStr) => {
      if (!timeStr) return null;
      return `${dateStr}T${timeStr}:00`; // e.g., "2025-11-06T09:00:00"
    };

    const payload = {
      attendance: {
        employeeId: employee.value,
        attendanceDate: new Date(attendanceDate).toISOString(),
        inTime: showInTime ? buildLocalDateTime(attendanceDate, inTime) : null,
        outTime: showOutTime
          ? buildLocalDateTime(attendanceDate, outTime)
          : null,
        status: status.value,
        workType: workType.value,
        shiftId: shift?.value || 0,
        punchTypeCode: punchType.value,

        // REQUIRED FOR MANUAL ENTRY
        isManual: true,
        verificationMode: "ADMIN",
      },
      
      source: "ADMIN_PANEL",
      deviceInfo: navigator.userAgent,
      capturedAt: `${attendanceDate}T${
        new Date().toTimeString().split(" ")[0]
      }`,
      remarks: "Marked manually by Admin",
    };

    try {
      console.log("Submitting payload:", payload);
      await axiosInstance.post("/Attendance/create", payload);
      toast.success("Attendance submitted successfully!");

      setFormData({
        employee: null,
        attendanceDate: new Date().toISOString().split("T")[0],
        inTime: "09:00",
        outTime: "18:00",
        status: null,
        workType: null,
        shift: null,
        punchType: null,
      });
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit attendance.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dummy function to refresh attendance list (optional)
  const fetchAttendance = async () => {
    console.log("Refreshing attendance list after import...");
  };

  return (
    <div className="bg-white">
      {/* HEADER */}
      <div className="px-4 py-3 shadow sticky top-14 bg-white flex items-center justify-between z-10">
        <h2 className="font-semibold text-xl">Attendance</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpdateModal(true)}
            className="bg-orange-600 text-white cursor-pointer px-4 py-2 text-sm rounded-md hover:bg-orange-700 transition"
          >
            Bulk Update (Excel)
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-600 text-white cursor-pointer px-4 py-2 text-sm rounded-md hover:bg-green-700 transition"
          >
            Export Datewise
          </button>

          <button
            onClick={() => setShowImportExportModal(true)}
            className="bg-primary text-white cursor-pointer px-4 py-2 text-sm rounded-md hover:bg-secondary transition"
          >
            Import / Export
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="p-8">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <Select
              isLoading={loading}
              options={employeeOptions}
              value={formData.employee}
              onChange={(option) => handleChange("employee", option)}
              placeholder="Select Employee"
              classNamePrefix="react-select"
            />
          </div>

          {/* Attendance Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={formData.attendanceDate}
              onChange={(e) => handleChange("attendanceDate", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Punch Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Punch Type
            </label>
            <Select
              options={punchTypeOptions}
              value={formData.punchType}
              onChange={(option) => handleChange("punchType", option)}
              placeholder="Select Punch Type"
              classNamePrefix="react-select"
            />
          </div>

          {/* In/Out Time */}
          {showInTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                In Time
              </label>
              <input
                type="time"
                value={formData.inTime}
                onChange={(e) => handleChange("inTime", e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {showOutTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Out Time
              </label>
              <input
                type="time"
                value={formData.outTime}
                onChange={(e) => handleChange("outTime", e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* Shift */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
            <Select
              options={shiftOptions.filtered || []}
              value={formData.shift}
              onChange={(option) => handleChange("shift", option)}
              placeholder="Select Shift"
              classNamePrefix="react-select"
              isLoading={loading}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              options={statusOptions}
              value={formData.status}
              onChange={(option) => handleChange("status", option)}
              placeholder="Select Status"
              classNamePrefix="react-select"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Type
            </label>
            <Select
              options={workTypeOptions}
              value={formData.workType}
              onChange={(option) => handleChange("workType", option)}
              placeholder="Select Work Type"
              classNamePrefix="react-select"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-primary hover:bg-secondary cursor-pointer text-white px-6 py-2 rounded-md flex items-center justify-center min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Import/Export Modal */}
      {showImportExportModal && (
        <ImportExportAttendance
          onClose={() => setShowImportExportModal(false)}
          fetchAttendance={fetchAttendance}
        />
      )}

      {showExportModal && (
        <ExportAttendanceModal onClose={() => setShowExportModal(false)} />
      )}

      {showBulkUpdateModal && (
        <BulkUpdateAttendance onClose={() => setShowBulkUpdateModal(false)} />
      )}
    </div>
  );
};

export default AttendanceForm;
