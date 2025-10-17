import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";

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

const EmpMarkAttendance = () => {
  const [shiftOptions, setShiftOptions] = useState([]);
  const [punchOptions, setPunchOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  const User = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    employeeId: User?.userId,
    inTime: "",
    outTime: "18:00",
    status: null,
    workType: null,
    shift: null,
    punchType: null,
  });

  // Set default inTime to current system time
  useEffect(() => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5); // HH:mm
    setFormData((prev) => ({ ...prev, inTime: time }));
  }, []);

  // Fetch data
  // Remove attendance API from fetchAllData
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [shiftRes, punchRes, mappingRes] = await Promise.all([
          axiosInstance.get("/Shift"),
          axiosInstance.get("/PunchType"),
          axiosInstance.get("/ShiftMapping/all"),
        ]);

        // Employee's mapped shifts
        const empShiftMappings = mappingRes.data?.data?.filter(
          (m) => m.employeeId === User?.userId
        );
        const mappedShiftIds = empShiftMappings.map((m) => m.shiftId);

        const shiftData = shiftRes.data
          .filter((s) => mappedShiftIds.includes(s.id))
          .map((s) => ({
            value: s.id,
            label: `${s.shiftName} (${s.shiftStart} - ${s.shiftEnd})`,
          }));
        setShiftOptions(shiftData);

        const punchData = punchRes.data.data.map((p) => ({
          value: p.code,
          label: p.name,
        }));
        setPunchOptions(punchData);

        // Default shift
        const empShift = empShiftMappings[0];
        if (empShift) {
          const foundShift = shiftData.find(
            (s) => s.value === empShift.shiftId
          );
          if (foundShift)
            setFormData((prev) => ({ ...prev, shift: foundShift }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [User]);

  // Separate API call for today's attendance only
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await axiosInstance.get(
          `/Attendance/GetByEmployeeId/${User?.userId}`
        );
        const todayRecords =
          res.data?.filter(
            (att) => att.attendanceDate.split("T")[0] === today
          ) || [];
        setTodayAttendance(todayRecords);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    fetchTodayAttendance();
  }, [User]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { inTime, outTime, status, workType, shift, punchType } = formData;

    if (!status || !workType || !punchType) {
      toast.error("Please select Status, Work Type, and Punch Type.");
      setIsSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    // Combine today's date with given time and convert to full ISO string
    const formatDateTime = (dateStr, timeStr) => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date(dateStr);
      date.setHours(hours, minutes, 0, 0);
      // Convert to local ISO format without timezone shift
      const localISO = date.toLocaleString("sv-SE").replace(" ", "T"); // e.g. "2025-10-13T18:00:00"
      return localISO;
    };

    if (todayAttendance && Array.isArray(todayAttendance)) {
      const hasIn = todayAttendance.some(
        (rec) => rec.punchType?.toUpperCase() === "IN"
      );
      const hasOut = todayAttendance.some(
        (rec) => rec.punchType?.toUpperCase() === "OUT"
      );

      if (punchType.value.includes("IN") && hasIn) {
        toast.error("You have already punched in today.");
        setIsSubmitting(false);
        return;
      }

      if (punchType.value.includes("OUT") && hasOut) {
        toast.error("You have already punched out today.");
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      employeeId: User?.userId,
      attendanceDate: new Date(today).toISOString(),
      inTime: showInTime ? formatDateTime(today, inTime) : null,
      outTime: showOutTime ? formatDateTime(today, outTime) : null,
      status: status.value,
      workType: workType.value,
      shiftId: shift?.value || 0,
      punchTypeCode: punchType.value,
    };

    console.log("Submitting attendance:", payload);

    try {
      await axiosInstance.post("/Attendance/create", payload);
      toast.success("Attendance submitted successfully!");
      setTodayAttendance(payload);
      setFormData((prev) => ({
        ...prev,
        outTime: "18:00",
        status: null,
        workType: null,
        punchType: null,
      }));
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit attendance"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine whether to show InTime or OutTime based on PunchType
  const showInTime = formData.punchType?.value?.includes("IN");
  const showOutTime = formData.punchType?.value?.includes("OUT");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-2xl p-6 mt-6 md:p-10 max-w-3xl mx-auto">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
          Mark Your Attendance
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Punch Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Punch Type
            </label>
            <Select
              options={punchOptions}
              value={formData.punchType}
              onChange={(option) => handleChange("punchType", option)}
              placeholder={
                loading ? "Loading Punch Types..." : "Select Punch Type"
              }
              isLoading={loading}
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
              placeholder={loading ? "Loading Shifts..." : "Select Shift"}
              isLoading={loading}
              classNamePrefix="react-select"
            />
          </div>

          {/* In Time (only when Punch Type = IN) */}
          {showInTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                In Time
              </label>
              <input
                type="time"
                value={formData.inTime}
                onChange={(e) => handleChange("inTime", e.target.value)}
                className="w-full rounded-lg border-gray-300 p-2 shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
          )}

          {/* Out Time (only when Punch Type = OUT) */}
          {showOutTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Out Time
              </label>
              <input
                type="time"
                value={formData.outTime}
                onChange={(e) => handleChange("outTime", e.target.value)}
                className="w-full rounded-lg border-gray-300 p-2 shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
          )}

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
          <div className="sm:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-secondary cursor-pointer transition-colors duration-200 text-white px-8 py-2 rounded-lg flex items-center justify-center min-w-[140px] shadow-md"
            >
              {isSubmitting ? <Spinner /> : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmpMarkAttendance;
