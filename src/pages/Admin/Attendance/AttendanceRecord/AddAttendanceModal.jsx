import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ModalWrapper from "./ModalWrapper";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const labelClass = "block text-sm font-medium text-gray-700";

const AddAttendanceModal = ({ show, onClose, employees, onSuccess }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [remarks, setRemarks] = useState("Marked manually");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!selectedEmployee) return toast.error("Select employee");
    if (!attendanceDate) return toast.error("Select date");

    try {
      setLoading(true);

      await axiosInstance.post("/AttendanceRecord/create", {
        employeeId: selectedEmployee.value,
        attendanceDate: new Date(attendanceDate).toISOString(),
        remarks: remarks || "Marked manually",
      });

      toast.success("Attendance created");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={onClose} title="Add Attendance">
      <div className="space-y-4">
        
        {/* Employee */}
        <div>
          <label className={labelClass}>Employee</label>
          <Select
            options={employees}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder="Select employee"
          />
        </div>

        {/* Attendance Date */}
        <div>
          <label className={labelClass}>Attendance Date & Time</label>
          <input
            type="datetime-local"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className={labelClass}>Remarks</label>
          <input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className={inputClass}
            placeholder="Enter remarks"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-primary hover:bg-secondary cursor-pointer text-white py-2 rounded-lg"
        >
          {loading ? "Saving..." : "Submit"}
        </button>

      </div>
    </ModalWrapper>
  );
};

export default AddAttendanceModal;