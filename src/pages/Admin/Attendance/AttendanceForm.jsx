import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";
import ImportExportAttendance from "./ImportExportAttendance";

const statusOptions = [
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Half Day", label: "Half Day" },
  { value: "Leave", label: "Leave" },
];

const workTypeOptions = [
  { value: "Remote", label: "Remote" },
  { value: "Onsite", label: "Onsite" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Work From Home", label: "Work From Home" },
];

const AttendanceForm = () => {
  const [shiftOptions, setShiftOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [punchTypeOptions, setPunchTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, shiftRes, punchRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/Shift"),
          axiosInstance.get("/PunchType"),
        ]);

        setEmployeeOptions(
          empRes.data.map((emp) => ({
            label: emp.fullName,
            value: emp.id,
          }))
        );

        setShiftOptions(
          shiftRes.data.map((shift) => ({
            label: shift.shiftName,
            value: shift.id,
          }))
        );

        setPunchTypeOptions(
          punchRes.data.data?.map((p) => ({
            label: p.name,
            value: p.code,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      employee,
      status,
      workType,
      inTime,
      outTime,
      attendanceDate,
      shift,
      punchType,
    } = formData;

    if (!employee || !status || !workType || !punchType) {
      toast.error("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    const [inHour, inMin] = inTime.split(":").map(Number);
    const [outHour, outMin] = outTime.split(":").map(Number);
    const inTotal = inHour * 60 + inMin;
    const outTotal = outHour * 60 + outMin;

    if (inTotal >= outTotal) {
      toast.error("In Time must be earlier than Out Time.");
      setIsSubmitting(false);
      return;
    }

    const formatLocalDateTime = (dateStr, timeStr) => {
      return `${dateStr}T${timeStr}:00`;
    };

    const payload = {
      employeeId: employee.value,
      attendanceDate: new Date(attendanceDate).toISOString(),
      inTime: formatLocalDateTime(attendanceDate, inTime),
      outTime: formatLocalDateTime(attendanceDate, outTime),
      status: status.value,
      workType: workType.value,
      shiftId: shift?.value || 0,
      punchTypeCode: punchType.value,
    };

    try {
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
        err?.response?.data?.message || "Failed to submit attendance."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="px-4 py-3 shadow sticky top-14 bg-white flex items-center justify-between z-10">
        <h2 className="font-semibold text-xl">Attendance</h2>

        <button
          type="button"
          className="bg-primary cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium"
          onClick={() => setShowImportModal(true)}
        >
          Import / Export
        </button>
      </div>

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
              className="w-full rounded-md border-gray-300 p-2"
            />
          </div>

          {/* In Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              In Time
            </label>
            <input
              type="time"
              value={formData.inTime}
              onChange={(e) => handleChange("inTime", e.target.value)}
              className="w-full rounded-md border-gray-300 p-2"
            />
          </div>

          {/* Out Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Out Time
            </label>
            <input
              type="time"
              value={formData.outTime}
              onChange={(e) => handleChange("outTime", e.target.value)}
              className="w-full rounded-md border-gray-300 p-2"
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

          {/* Shift */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
            <Select
              options={shiftOptions}
              value={formData.shift}
              onChange={(option) => handleChange("shift", option)}
              placeholder="Select Shift"
              classNamePrefix="react-select"
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

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-primary cursor-pointer hover:bg-secondary text-white px-6 py-2 rounded-md flex items-center justify-center min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* 🔹 Import / Export Modal */}
      {showImportModal && (
        <ImportExportAttendance
          onClose={() => setShowImportModal(false)}
          fetchAttendance={() => {}} // optional refresh function
        />
      )}
    </div>
  );
};

export default AttendanceForm;
