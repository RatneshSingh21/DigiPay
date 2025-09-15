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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const User = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    employeeId: User?.userId,
    inTime: "", // initially empty, will be set in useEffect
    outTime: "18:00",
    status: null,
    workType: null,
    shift: null,
  });

  // Set default inTime to current time
  useEffect(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;
    setFormData((prev) => ({ ...prev, inTime: currentTime }));
  }, []);

  // Fetch Shifts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await axiosInstance.get("/Shift");
        setShiftOptions(
          res.data.map((shift) => ({
            label: shift.shiftName,
            value: shift.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching shifts:", error);
        toast.error("Failed to load Shifts");
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { inTime, outTime, status, workType, shift } = formData;

    if (!status || !workType) {
      toast.error("Please select status and work type.");
      setIsSubmitting(false);
      return;
    }

    // Validate time
    const [inHour, inMin] = inTime.split(":").map(Number);
    const [outHour, outMin] = outTime.split(":").map(Number);
    if (inHour * 60 + inMin >= outHour * 60 + outMin) {
      toast.error("In Time must be earlier than Out Time.");
      setIsSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const formatDateTime = (date, time) => `${date}T${time}:00`;

    const payload = {
      employeeId: User?.userId,
      attendanceDate: new Date(today).toISOString(),
      inTime: formatDateTime(today, inTime),
      outTime: formatDateTime(today, outTime),
      status: status.value,
      workType: workType.value,
      shiftId: shift?.value || 0,
    };

    try {
      await axiosInstance.post("/Attendance/create", payload);
      toast.success("Attendance submitted successfully");

      setFormData({
        employeeId: User?.userId,
        inTime, // keep the same captured current time
        outTime: "18:00",
        status: null,
        workType: null,
        shift: null,
      });
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit attendance");
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
              disabled
              className="w-full rounded-lg border-gray-300 p-2 shadow-sm bg-gray-100 cursor-not-allowed"
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
              className="w-full rounded-lg border-gray-300 p-2 shadow-sm focus:ring-primary focus:border-primary"
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
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
            <Select
              options={shiftOptions}
              value={formData.shift}
              onChange={(option) => handleChange("shift", option)}
              placeholder={loading ? "Loading shifts..." : "Select Shift"}
              isLoading={loading}
              classNamePrefix="react-select"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-secondary transition-colors duration-200 text-white px-8 py-2 rounded-lg flex items-center justify-center min-w-[140px] shadow-md"
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
