import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";

const AddEmpRoleMappingModal = ({ onClose, onSuccess }) => {
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Employees & Roles on modal open
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, roleRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/RoleList/getall"),
        ]);

        setEmployeeOptions(
          empRes.data.map((emp) => ({
            value: emp.id,
            label: `${emp.fullName} (${emp.employeeCode})`,
            name: emp.fullName,
          }))
        );

        setRoleOptions(
          roleRes.data.map((role) => ({
            value: role.roleID,
            label: role.roleName,
            name: role.roleName,
          }))
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load employees or roles");
      }
    };

    fetchData();
  }, []);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedRole) {
      toast.error("Please select both Employee and Role.");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/EmployeeRoleMapping", {
        employeeId: selectedEmployee.value,
        employeeName: selectedEmployee.name,
        roleId: selectedRole.value,
        roleName: selectedRole.name,
        assignedAt: new Date().toISOString(),
      });

      toast.success("Role mapping added successfully!");
      onSuccess(); // Refresh list
      onClose(); // Close modal
    } catch (error) {
      console.error("Error adding role mapping:", error);
      toast.error("Failed to add role mapping.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg w-[420px] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Role Mapping</h2>
          <button
            type="button"
            className="text-gray-600 hover:text-red-500 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Select */}
          <div>
            <label className="block text-sm mb-1">Employee</label>
            <Select
              options={employeeOptions}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder="Select Employee..."
              isSearchable
            />
          </div>

          {/* Role Select */}
          <div>
            <label className="block text-sm mb-1">Role</label>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
              placeholder="Select Role..."
              isSearchable
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border text-sm cursor-pointer hover:bg-gray-200 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-sm text-white rounded cursor-pointer hover:bg-secondary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmpRoleMappingModal;
