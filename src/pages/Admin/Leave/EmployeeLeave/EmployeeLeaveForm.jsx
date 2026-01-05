import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { isBefore } from "date-fns";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";

const EmployeeLeaveForm = ({ onClose }) => {
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    employee: null,
    leaveType: null,
    fromDate: "",
    toDate: "",
    reason: "",
    approvers: [],
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
          `/EmployeeLeaveAllocation/${formData.employee.value}`
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
              (l) => l.leaveTypeId === a.leaveTypeId
            );

            if (!lt) return null;

            return {
              value: lt.leaveTypeId,
              label: `${lt.leaveName} (Remaining: ${a.leavesRemaining})`,
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

  // Fetch Approvers
  useEffect(() => {
    axiosInstance
      .get("/EmployeeRoleMapping/approvers/all")
      .then((res) => {
        const leaveRule = res.data?.find(
          (r) => r.requestType?.toLowerCase() === "leave"
        );
        if (leaveRule?.approvers) {
          const formatted = leaveRule.approvers.map((a) => ({
            value: a.employeeId,
            label: `${a.employeeName} (${a.roleName})`,
          }));
          setFormData((prev) => ({ ...prev, approvers: formatted }));
        }
      })
      .catch(() => toast.error("Unable to load approvers."));
  }, []);

  // Handle Form Changes
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit Leave API
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employee, leaveType, fromDate, toDate, reason, approvers } =
      formData;

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
        leaveName: leaveType.label,
        leaveCode: leaveType.code,
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
        reason,
        customApproverIds: approvers.map((a) => a.value),
      });

      toast.success("Leave successfully applied for the selected employee.");
      setFormData({
        employee: null,
        leaveType: null,
        fromDate: "",
        toDate: "",
        reason: "",
        approvers: [],
      });
    } catch (err) {
      console.error(err?.response?.data);
      setError(err?.response?.data?.error || "Failed to apply leave.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Apply Employee Leave (Admin)
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 cursor-pointer hover:text-gray-800"
        >
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 max-h-[65vh] overflow-y-auto pr-2"
      >
        {/* Employee Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Employee
          </label>
          <Select
            options={employeeOptions}
            value={formData.employee}
            onChange={(selected) =>
              setFormData({
                ...formData,
                employee: selected,
                leaveType: null, // reset leave type
              })
            }
            placeholder="Choose employee"
          />
        </div>

        {/* Leave Type Select */}
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
            placeholder="Choose leave type"
          />
        </div>

        {/* From / To Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            required
            placeholder="Enter reason for leave"
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-400"
          />
        </div>

        {/* Approvers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approvers
          </label>
          <Select
            options={formData.approvers}
            value={formData.approvers}
            onChange={(selected) =>
              setFormData({ ...formData, approvers: selected })
            }
            isMulti
            placeholder="Select approvers"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded
             hover:bg-secondary transition disabled:opacity-50
             flex items-center justify-center
             h-10 leading-none"
        >
          {loading ? <Spinner /> : "Submit Leave"}
        </button>
      </form>
    </div>
  );
};

export default EmployeeLeaveForm;
