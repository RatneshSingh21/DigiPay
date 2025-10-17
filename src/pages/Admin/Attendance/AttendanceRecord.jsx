import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const AttendanceRecord = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/Employee");
        const empOptions = res.data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
        }));
        setEmployees(empOptions);
      } catch (err) {
        toast.error("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // 🔹 Submit Attendance Record
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) return toast.error("Select an employee");
    if (!attendanceDate) return toast.error("Select attendance date");

    const payload = {
      employeeId: selectedEmployee.value,
      attendanceDate: new Date(attendanceDate).toISOString(),
      remarks: remarks || "Marked manually",
    };

    try {
      setSubmitting(true);
      const res = await axiosInstance.post("/AttendanceRecord/create", payload);
      toast.success("Attendance record created successfully");
      console.log("Response:", res.data);
      // reset form
      setSelectedEmployee(null);
      setAttendanceDate("");
      setRemarks("");
    } catch (err) {
      toast.error(err?.response?.data?.message ||"Failed to create attendance record");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 shadow-md sticky top-14 bg-white z-10 flex justify-between items-center rounded-b-lg border-b border-gray-100">
        <h2 className="font-semibold text-xl text-gray-800 tracking-wide">
          Attendance Record
        </h2>
      </div>

      <div className="max-w-lg mx-auto bg-white shadow-md rounded-2xl p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Add Attendance Record
        </h2>

        {loading ? (
          <Spinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <Select
                options={employees}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                placeholder="Select Employee"
              />
            </div>

            {/* Attendance Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendance Date
              </label>
              <input
                type="datetime-local"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary disabled:bg-gray-400"
            >
              {submitting ? "Submitting..." : "Submit Record"}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default AttendanceRecord;
