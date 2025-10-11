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

  // Fetch Shifts, PunchTypes, Employee Shift Mapping, and Today's Attendance
  useEffect(() => {
    // Inside useEffect for fetching data
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];

        const [shiftRes, punchRes, mappingRes, attendanceRes] =
          await Promise.all([
            axiosInstance.get("/Shift"),
            axiosInstance.get("/PunchType"),
            axiosInstance.get("/ShiftMapping/all"),
            axiosInstance.get(`/Attendance/GetByEmployeeId/${User?.userId}`),
          ]);

        // Filter shifts mapped to logged-in employee
        const empShiftMappings = mappingRes.data?.data?.filter(
          (m) => m.employeeId === User?.userId
        );
        const mappedShiftIds = empShiftMappings.map((m) => m.shiftId);

        // Format Shifts
        const shiftData = shiftRes.data
          .filter((s) => mappedShiftIds.includes(s.id)) // only mapped shifts
          .map((s) => ({
            value: s.id,
            label: `${s.shiftName} (${s.shiftStart} - ${s.shiftEnd})`,
          }));
        setShiftOptions(shiftData);

        // Format Punch Types
        const punchData = punchRes.data.data.map((p) => ({
          value: p.code,
          label: p.name,
        }));
        setPunchOptions(punchData);

        // Auto map shift based on logged-in employee's first mapping
        const empShift = empShiftMappings[0]; // take first mapping
        if (empShift) {
          const foundShift = shiftData.find(
            (s) => s.value === empShift.shiftId
          );
          if (foundShift) {
            setFormData((prev) => ({ ...prev, shift: foundShift }));
          }
        }

        // Find today's attendance
        const todayRecord = attendanceRes.data?.data?.find(
          (att) => att.attendanceDate.split("T")[0] === today
        );
        setTodayAttendance(todayRecord || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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

    const [inHour, inMin] = inTime.split(":").map(Number);
    const [outHour, outMin] = outTime.split(":").map(Number);
    if (inHour * 60 + inMin >= outHour * 60 + outMin) {
      toast.error("In Time must be earlier than Out Time.");
      setIsSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const formatDateTime = (date, time) => `${date}T${time}:00`;
    console.log(todayAttendance);

    // Prevent multiple punch-ins or punch-outs
    if (todayAttendance) {
      if (todayAttendance.inTime && !formData.punchType.value.includes("OUT")) {
        toast.error("You have already punched in today.");
        setIsSubmitting(false);
        return;
      }
      if (todayAttendance.outTime && formData.punchType.value.includes("OUT")) {
        toast.error("You have already punched out today.");
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      employeeId: User?.userId,
      attendanceDate: new Date(today).toISOString(),
      inTime: formatDateTime(today, inTime),
      outTime: formatDateTime(today, outTime),
      status: status.value,
      workType: workType.value,
      shiftId: shift?.value || 0,
      punchTypeCode: punchType.value,
    };

    try {
      await axiosInstance.post("/Attendance/create", payload);
      toast.success("Attendance submitted successfully!");
      setTodayAttendance(payload); // update today's record

      setFormData((prev) => ({
        ...prev,
        outTime: "18:00",
        status: null,
        workType: null,
        shift: prev.shift, // retain mapped shift
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
          {/* In Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              In Time
            </label>
            <input
              type="time"
              value={formData.inTime}
              disabled={!!todayAttendance?.inTime}
              className={`w-full rounded-lg border-gray-300 p-2 shadow-sm bg-gray-100 ${
                todayAttendance?.inTime ? "cursor-not-allowed" : ""
              }`}
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
              disabled={!!todayAttendance?.outTime}
              className={`w-full rounded-lg border-gray-300 p-2 shadow-sm focus:ring-primary focus:border-primary ${
                todayAttendance?.outTime ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
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

          {/* Submit Button */}
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
