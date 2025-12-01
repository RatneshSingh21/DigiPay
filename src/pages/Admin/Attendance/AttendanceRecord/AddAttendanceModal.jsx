import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import ModalWrapper from "./ModalWrapper";

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
      onSuccess(); // reload list
      onClose();   // close modal
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={onClose} title="Add Attendance">
      <div className="space-y-4">
        <Select
          options={employees}
          value={selectedEmployee}
          onChange={setSelectedEmployee}
        />

        <input
          type="datetime-local"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Remarks"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg"
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default AddAttendanceModal;
