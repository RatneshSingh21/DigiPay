import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


const OTCalculationForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    attendanceDate: "",
    attendanceRecordId: "",
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/Employee");
        const options = res.data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
        }));
        setEmployees(options);
      } catch (error) {
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const res = await axiosInstance.get(
          "/AttendanceRecord/getAttendancerecord/all"
        );
        setAllRecords(res.data.data || []);
      } catch (error) {
        console.log(error)
        // toast.error("Failed to fetch attendance records");
      }
    };

    fetchAllAttendance();
  }, []);

  // Fetch Attendance Records and Employee Details
  useEffect(() => {
    if (!formData.employeeId) {
      setAttendanceRecords([]);
      return;
    }

    const filtered = allRecords.filter(
      (rec) => rec.employeeId === formData.employeeId
    );

    const mapped = filtered.map((rec) => ({
      value: rec.attendanceRecordId,
      label: `Record #${rec.attendanceRecordId} | Date: ${new Date(
        rec.attendanceDate
      ).toLocaleDateString("en-Gb")} | Hours: ${rec.totalHoursWorked}`,
    }));

    setAttendanceRecords(mapped);
  }, [formData.employeeId, allRecords]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmployeeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: selectedOption ? selectedOption.value : "",
      attendanceRecordId: "", // RESET
    }));
  };

  const handleAttendanceRecordChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      attendanceRecordId: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.attendanceRecordId) {
      toast.warning("Please select both Employee and Attendance Record");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/OTCalculation", formData);
      toast.success(res.data.message || "OT Calculation added successfully!");
      setFormData({
        employeeId: "",
        attendanceDate: "",
        attendanceRecordId: "",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Add OT Calculation
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Employee
            </label>
            <Select
              options={employees}
              value={employees.find((emp) => emp.value === formData.employeeId)}
              onChange={handleEmployeeChange}
              placeholder="Select Employee"
              isClearable
            />
          </div>

          {/* Attendance Record Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Attendance Record
            </label>
            <Select
              options={attendanceRecords}
              value={attendanceRecords.find(
                (rec) => rec.value === formData.attendanceRecordId
              )}
              onChange={handleAttendanceRecordChange}
              placeholder="Select Attendance Record"
              isClearable
            />
          </div>

          {/* Attendance Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Attendance Date
            </label>
            <input
              type="date"
              name="attendanceDate"
              value={formData.attendanceDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary cursor-pointer hover:bg-secondary text-white py-2 rounded-md transition-colors duration-200"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTCalculationForm;
