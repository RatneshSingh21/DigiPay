import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const OTCalculationForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    attendanceDate: "",
    attendanceRecordId: "",
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
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

  // Fetch Attendance Records and Employee Details
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const res = await axiosInstance.get(
          "/AttendanceRecord/getAttendancerecord/all"
        );
        const records = res.data.data || [];

        // For each attendance record, fetch corresponding employee details
        const updatedRecords = await Promise.all(
          records.map(async (rec) => {
            try {
              const empRes = await axiosInstance.get(
                `/Employee/${rec.employeeId}`
              );
              const emp = empRes.data.data;
              return {
                value: rec.attendanceRecordId,
                label: `Record #${rec.attendanceRecordId} | ${emp.fullName} (${
                  emp.employeeCode
                }) | Date: ${new Date(
                  rec.attendanceDate
                ).toLocaleDateString()} | Hours: ${rec.totalHoursWorked.toFixed(4)}`,
              };
            } catch {
              // fallback if employee fetch fails
              return {
                value: rec.attendanceRecordId,
                label: `Record #${rec.attendanceRecordId} | Emp ID: ${
                  rec.employeeId
                } | Date: ${new Date(
                  rec.attendanceDate
                ).toLocaleDateString()} | Hours: ${rec.totalHoursWorked}`,
              };
            }
          })
        );

        setAttendanceRecords(updatedRecords);
      } catch (error) {
        toast.error("Failed to fetch attendance records");
      }
    };

    fetchAttendanceRecords();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmployeeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: selectedOption ? selectedOption.value : "",
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
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
              className="w-full border rounded-md px-3 py-2 text-sm"
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
