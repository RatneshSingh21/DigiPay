import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { isBefore } from "date-fns";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const EmployeeLeaveForm = ({ onClose }) => {
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [formData, setFormData] = useState({
    employee: null,
    leaveType: null,
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch Employees for Select
  useEffect(() => {
    axiosInstance
      .get("/Employee")
      .then((res) => {
        const options = res.data.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`,
        }));
        setEmployeeOptions(options);
        console.log("Filtered Leave Types:", options);
      })
      .catch(() => toast.error("Failed to load employees."));
  }, []);

  // Fetch Leave Types
  useEffect(() => {
    if (!formData.employee) {
      setLeaveTypes([]);
      setFormData((prev) => ({ ...prev, leaveType: null }));
      return;
    }

    const fetchAllocatedLeaveTypes = async () => {
      try {
        // 1️⃣ Fetch employee allocations
        const allocationRes = await axiosInstance.get(
          `/EmployeeLeaveAllocation/${formData.employee.value}`,
        );

        const allocations = allocationRes.data?.data || [];

        if (!allocations.length) {
          setLeaveTypes([]);
          return;
        }

        // 2️⃣ Fetch active leave types (master)
        const leaveTypeRes = await axiosInstance.get("/LeaveType/active");
        const leaveTypesMaster = leaveTypeRes.data || [];

        // 3️⃣ JOIN allocation + leave type master
        const options = allocations
          .filter((a) => a.isActive && a.leavesRemaining > 0)
          .map((a) => {
            const lt = leaveTypesMaster.find(
              (l) => l.leaveTypeId === a.leaveTypeId,
            );

            if (!lt) return null;

            return {
              value: lt.leaveTypeId,
              label: `${lt.leaveName} (Remaining: ${a.leavesRemaining})`,
              leaveName: lt.leaveName,
              leaveCode: lt.leaveCode,
              leavesRemaining: a.leavesRemaining,
            };
          })
          .filter(Boolean); // remove nulls

        setLeaveTypes(options);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load employee leave types");
      }
    };

    fetchAllocatedLeaveTypes();
  }, [formData.employee]);

  // Handle Form Changes
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit Leave API
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employee, leaveType, fromDate, toDate, reason } = formData;

    if (!employee || !leaveType || !fromDate || !toDate || !reason) {
      setError("All fields are required.");
      return;
    }

    if (isBefore(new Date(toDate), new Date(fromDate))) {
      setError("To date cannot be before From date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/EmployeeLeave", {
        employeeId: employee.value,
        leaveTypeId: leaveType.value,
        leaveName: leaveType.leaveName,
        leaveCode: leaveType.leaveCode,
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
        reason,
        customApproverIds: [],
      });

      toast.success("Leave successfully applied for the selected employee.");
      setFormData({
        employee: null,
        leaveType: null,
        fromDate: "",
        toDate: "",
        reason: "",
      });
      onClose();
    } catch (err) {
      console.error(err?.response?.data);
      setError(err?.response?.data?.error || "Failed to apply leave.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Apply Employee Leave
            </h2>
            <p className="text-xs text-gray-500">
              Submit leave request on behalf of employee
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-2 max-h-[65vh] overflow-y-auto"
        >
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <Select
              options={employeeOptions}
              value={formData.employee}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  employee: selected,
                  leaveType: null,
                })
              }
              placeholder="Select employee"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <Select
              key={formData.employee?.value || "no-employee"}
              options={leaveTypes}
              value={formData.leaveType}
              onChange={(selected) =>
                setFormData({ ...formData, leaveType: selected })
              }
              placeholder="Select leave type"
              isDisabled={!formData.employee}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <textarea
              name="reason"
              rows={3}
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Enter reason for leave"
              className={inputClass}
              required
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg border cursor-pointer border-gray-300
                     text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 text-sm rounded-lg bg-primary cursor-pointer text-white
                     hover:bg-secondary transition disabled:opacity-50
                     flex items-center gap-2"
          >
            {loading && <Spinner />}
            Submit Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaveForm;
