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

    const formatDateTime = (dateStr, timeStr) => {
      if (!timeStr) return null;
      // keep exact local date + time (no timezone conversion)
      return `${dateStr}T${timeStr}:00`;
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

    try {
      // ✅ Step 1: Get high-accuracy GPS location
      const getPreciseLocation = () =>
        new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject("Geolocation not supported");
          } else {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos.coords),
              (err) => reject(err),
              {
                enableHighAccuracy: true, // force GPS accuracy
                timeout: 15000, // wait up to 15s for precision
                maximumAge: 0,
              }
            );
          }
        });

      const coords = await getPreciseLocation();
      const { latitude, longitude, accuracy } = coords;

      console.log("📍 Precise GPS Location:", {
        latitude,
        longitude,
        accuracy,
      });

      // ✅ Step 2: Reverse geocode using OpenStreetMap for detailed address
      let addressData = {
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      };

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const data = await geoRes.json();

        addressData = {
          address: data.display_name || "",
          city:
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.suburb ||
            "",
          state: data.address?.state || "",
          country: data.address?.country || "",
          postalCode: data.address?.postcode || "",
        };

        console.log("🏠 Detailed Address:", addressData);
      } catch (err) {
        console.warn(
          "Reverse geocoding failed, proceeding with coordinates only."
        );
      }

      // ✅ Step 3: Build final payload for backend
      const payload = {
        attendance: {
          employeeId: User?.userId,
          attendanceDate: new Date(today).toISOString(),
          inTime: showInTime ? formatDateTime(today, inTime) : null,
          outTime: showOutTime ? formatDateTime(today, outTime) : null,
          status: status.value,
          workType: workType.value,
          shiftId: shift?.value || 0,
          punchTypeCode: punchType.value,
        },
        latitude,
        longitude,
        accuracyMeters: accuracy || 0,
        source: "Web App",
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postalCode: addressData.postalCode,
        locationType: accuracy <= 20 ? "GPS" : "Network",
        deviceInfo: navigator.userAgent,
        ipAddress: "",
        capturedAt: `${today}T${new Date().toTimeString().split(" ")[0]}`, // local capture time
        remarks: `Marked via ${accuracy <= 20 ? "precise" : "approximate"} GPS`,
      };

      console.log("✅ Final Payload:", payload);

      // ✅ Step 4: Submit to Attendance API
      await axiosInstance.post("/Attendance/create", payload);
      toast.success("Attendance marked successfully with precise location!");

      setTodayAttendance(payload);
      setFormData((prev) => ({
        ...prev,
        outTime: "18:00",
        status: null,
        workType: null,
        punchType: null,
      }));
    } catch (err) {
      console.error("❌ Attendance submission error:", err);
      toast.error(
        err?.message ||
          "Failed to submit attendance. Please allow location access."
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
