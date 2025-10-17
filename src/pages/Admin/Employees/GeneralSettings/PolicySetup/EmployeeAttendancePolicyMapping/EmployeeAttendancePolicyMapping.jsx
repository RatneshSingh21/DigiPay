import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";

const EmployeeAttendancePolicyMapping = () => {
  const [employees, setEmployees] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/Employee");
        const empOptions = res.data.map(emp => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.employeeCode})`
        }));
        setEmployees(empOptions);
      } catch (error) {
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, []);

  // Fetch policies
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axiosInstance.get("/AttendancePolicy/GetAll");
        const policyOptions = res.data.data.map(policy => ({
          value: policy.attendancePolicyId,
          label: `ID ${policy.attendancePolicyId} || ${policy.policyName}`
        }));
        setPolicies(policyOptions);
      } catch (error) {
        toast.error("Failed to fetch attendance policies");
      }
    };
    fetchPolicies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedPolicy || !effectiveFrom || !effectiveTo) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/EmployeeAttendancePolicyMapping/assign-policy", {
        employeeId: selectedEmployee.value,
        policyId: selectedPolicy.value,
        effectiveFrom,
        effectiveTo
      });
      toast.success("Policy assigned successfully");
      // Reset form
      setSelectedEmployee(null);
      setSelectedPolicy(null);
      setEffectiveFrom("");
      setEffectiveTo("");
    } catch (error) {
      toast.error("Failed to assign policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Assign Attendance Policy</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Employee</label>
          <Select
            options={employees}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder="Select Employee"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Attendance Policy</label>
          <Select
            options={policies}
            value={selectedPolicy}
            onChange={setSelectedPolicy}
            placeholder="Select Policy"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Effective From</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Effective To</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={effectiveTo}
            onChange={(e) => setEffectiveTo(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
          disabled={loading}
        >
          {loading ? "Assigning..." : "Assign Policy"}
        </button>
      </form>
    </div>
  );
};

export default EmployeeAttendancePolicyMapping;
