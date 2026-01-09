import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import Select from "react-select";
import { FiUsers } from "react-icons/fi";

const CreateAdminFromEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [roleMappings, setRoleMappings] = useState([]);
  const [departments, setDepartments] = useState({});
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const roles = ["Admin", "User", "Hod", "Manager", "SuperAdmin"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, roleRes] = await Promise.all([
        axiosInstance.get("/Employee"),
        axiosInstance.get("/EmployeeRoleMapping"),
      ]);
      console.log("Employee Data ", empRes.data);
      console.log("Role Data ", roleRes.data);

      setEmployees(empRes.data || []);
      setRoleMappings(roleRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return [];
    const s = search.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(s) &&
        emp.portalAccessEnabled === true
    );
  }, [search, employees]);

  const employeeOptions = useMemo(() => {
    return employees
      .filter((emp) => emp.portalAccessEnabled === true)
      .map((emp) => ({
        value: emp.id,
        label: `${emp.fullName} (${emp.employeeCode})`,
        emp,
      }));
  }, [employees]);

  const getDepartmentName = async (deptId) => {
    if (!deptId) return "N/A";
    if (departments[deptId]) return departments[deptId];

    try {
      const res = await axiosInstance.get(`/Department/${deptId}`);
      const name = res.data?.name || "N/A";
      setDepartments((prev) => ({ ...prev, [deptId]: name }));
      return name;
    } catch (err) {
      console.error(err);
      return "N/A";
    }
  };

  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp.id);
    setSearch(emp.fullName);

    const mapping = roleMappings.find((r) => r.employeeId === emp.id);
    setRole(mapping ? mapping.roleName : "");

    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return toast.error("Pick an employee");
    if (!role) return toast.error("Select a role");

    setSubmitting(true);
    try {
      const res = await axiosInstance.post(
        "/user-auth/add-user-from-employee",
        {
          employeeId: Number(selectedEmployee),
          role,
        }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "User created successfully");
        fetchData();
        setSelectedEmployee("");
        setSearch("");
        setRole("");
      } else {
        toast.warning(res.data?.message || "Unexpected response");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error while creating user");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEmployeeDetails = employees.find(
    (e) => e.id === Number(selectedEmployee)
  );
  const [selectedDeptName, setSelectedDeptName] = useState("");

  useEffect(() => {
    if (selectedEmployeeDetails?.departmentId) {
      getDepartmentName(selectedEmployeeDetails.departmentId).then((name) =>
        setSelectedDeptName(name)
      );
    }
  }, [selectedEmployeeDetails]);

  const employeesWithRoles = useMemo(() => {
    return employees.filter((emp) =>
      roleMappings.some((r) => r.employeeId === emp.id)
    );
  }, [employees, roleMappings]);

  const [tableDeptNames, setTableDeptNames] = useState({});

  useEffect(() => {
    employeesWithRoles.forEach((emp) => {
      if (emp.departmentId && !tableDeptNames[emp.departmentId]) {
        getDepartmentName(emp.departmentId).then((name) =>
          setTableDeptNames((prev) => ({ ...prev, [emp.departmentId]: name }))
        );
      }
    });
  }, [employeesWithRoles]);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl"> Create Admin from Employee</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="p-5">
          {/* Search Box + Form Card */}
          <div className="bg-white shadow-xl p-6 rounded-2xl border border-gray-100 mb-4 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Assign Role to Employee
            </h3>

            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Employee
              </label>

              <Select
                options={employeeOptions}
                placeholder="Search & select employee..."
                isClearable
                isSearchable
                value={
                  selectedEmployee
                    ? employeeOptions.find(
                        (opt) => opt.value === selectedEmployee
                      )
                    : null
                }
                onChange={(selected) => {
                  if (!selected) {
                    setSelectedEmployee("");
                    setRole("");
                    return;
                  }

                  setSelectedEmployee(selected.value);

                  const mapping = roleMappings.find(
                    (r) => r.employeeId === selected.value
                  );

                  setRole(mapping ? mapping.roleName : "");
                }}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            {/* Role Form */}
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <Select
                  value={role ? { label: role, value: role } : null}
                  onChange={(selected) => setRole(selected?.value || "")}
                  isDisabled={!selectedEmployee}
                  options={roles.map((r) => ({ label: r, value: r }))}
                  placeholder="Select Role..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <button
                className="bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600
             hover:from-indigo-600 hover:to-blue-600
             text-white px-4 py-2 rounded-xl shadow-md
             transition disabled:opacity-50"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>

          {/* Selected Employee Card */}
          {selectedEmployeeDetails && (
            <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border rounded-xl shadow-md mb-10 max-w-lg">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                Employee Details
              </h3>
              <p>
                <strong>Name:</strong> {selectedEmployeeDetails.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedEmployeeDetails.workEmail}
              </p>
              <p>
                <strong>Department:</strong> {selectedDeptName || "N/A"}
              </p>
              <p>
                <strong>Code:</strong> {selectedEmployeeDetails.employeeCode}
              </p>
              <p className="mt-2">
                <strong>Current Role:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                  ${
                    role
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
                >
                  {role || "Not Assigned"}
                </span>
              </p>
            </div>
          )}

          <div className="shadow rounded-lg h-[40vh] overflow-y-auto mt-6">
            {employeesWithRoles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiUsers size={52} className="mb-3 text-gray-400" />
                <p className="text-sm font-semibold">
                  No employees assigned as admins
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Assign a role to an employee to see them here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100 text-gray-700 text-center sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Dept</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-center">
                    {employeesWithRoles.map((emp) => {
                      const mapping = roleMappings.find(
                        (r) => r.employeeId === emp.id
                      );
                      const deptName =
                        tableDeptNames[emp.departmentId] || "N/A";

                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-blue-50 transition cursor-pointer"
                        >
                          <td className="px-4 py-3">{emp.fullName}</td>
                          <td className="px-4 py-3">{emp.workEmail}</td>
                          <td className="px-4 py-3">{deptName}</td>
                          <td className="px-4 py-3 text-blue-700 font-semibold">
                            {mapping?.roleName}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAdminFromEmployee;
