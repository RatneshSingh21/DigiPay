import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const CreateAdminFromEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [roleMappings, setRoleMappings] = useState([]);
  const [departments, setDepartments] = useState({}); // cache { deptId: deptName }
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const roles = ["Admin", "User", "Hod", "Manager", "SuperAdmin"];

  // ----------------------------
  // FETCH EMPLOYEES + ROLE MAPPINGS
  // ----------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, roleRes] = await Promise.all([
        axiosInstance.get("/Employee"),
        axiosInstance.get("/EmployeeRoleMapping"),
      ]);

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

  // ----------------------------
  // FILTERED EMPLOYEES FOR AUTOCOMPLETE
  // ----------------------------
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return [];
    const s = search.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(s) && emp.portalAccessEnabled === true
    );
  }, [search, employees]);

  // ----------------------------
  // GET DEPARTMENT NAME (with caching)
  // ----------------------------
  const getDepartmentName = async (deptId) => {
    if (!deptId) return "N/A";
    if (departments[deptId]) return departments[deptId]; // cached

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

  // ----------------------------
  // EMPLOYEE SELECTION HANDLER
  // ----------------------------
  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp.id);
    setSearch(emp.fullName);

    const mapping = roleMappings.find((r) => r.employeeId === emp.id);
    setRole(mapping ? mapping.roleName : "");

    setShowDropdown(false);
  };

  // ----------------------------
  // SUBMIT
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return toast.error("Pick an employee");
    if (!role) return toast.error("Select a role");

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/user-auth/add-user-from-employee", {
        employeeId: Number(selectedEmployee),
        role,
      });

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

  // ----------------------------
  // SELECTED EMPLOYEE DETAILS
  // ----------------------------
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

  // ----------------------------
  // EMPLOYEES WITH ROLES (TABLE)
  // ----------------------------
  const employeesWithRoles = useMemo(() => {
    return employees.filter((emp) =>
      roleMappings.some((r) => r.employeeId === emp.id)
    );
  }, [employees, roleMappings]);

  const [tableDeptNames, setTableDeptNames] = useState({}); // caching for table

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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create Admin from Employee</h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          {/* EMPLOYEE AUTOCOMPLETE SEARCH */}
          <div className="mb-6 w-96 relative">
            <label className="text-sm font-medium">Search Employee</label>
            <input
              type="text"
              className="border p-2 rounded w-full mt-1"
              placeholder="Type employee name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedEmployee("");
                setShowDropdown(true);
              }}
            />

            {showDropdown && search.trim() !== "" && filteredEmployees.length > 0 && (
              <div className="absolute z-30 w-full bg-white shadow-lg border rounded mt-1 max-h-60 overflow-y-auto">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleEmployeeSelect(emp)}
                  >
                    {emp.fullName} ({emp.employeeCode})
                  </div>
                ))}
              </div>
            )}

            {showDropdown && search.trim() !== "" && filteredEmployees.length === 0 && (
              <div className="absolute z-30 w-full bg-white shadow-lg border rounded mt-1 p-2 text-sm text-gray-500">
                No employees found
              </div>
            )}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="grid gap-4 w-96 mb-8">
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                className="w-full border p-2 rounded mt-1"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!selectedEmployee}
              >
                <option value="">-- Select Role --</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded disabled:opacity-50"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create User"}
            </button>
          </form>

          {/* EMPLOYEE DETAILS CARD */}
          {selectedEmployeeDetails && (
            <div className="p-4 border rounded bg-gray-50 mb-8 w-96">
              <h3 className="font-semibold text-lg mb-2">Employee Details</h3>
              <p>
                <strong>Name:</strong> {selectedEmployeeDetails.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedEmployeeDetails.workEmail}
              </p>
              <p>
                <strong>Dept:</strong> {selectedDeptName || "N/A"}
              </p>
              <p>
                <strong>Code:</strong> {selectedEmployeeDetails.employeeCode}
              </p>
              <p>
                <strong>Current Role:</strong>{" "}
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {role || "Not Assigned"}
                </span>
              </p>
            </div>
          )}

          {/* TABLE */}
          <h3 className="text-lg font-semibold mb-3">
            Employees With Assigned Roles
          </h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Dept</th>
                <th className="border p-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {employeesWithRoles.map((emp) => {
                const mapping = roleMappings.find((r) => r.employeeId === emp.id);
                const deptName = tableDeptNames[emp.departmentId] || "N/A";

                return (
                  <tr key={emp.id}>
                    <td className="border p-2">{emp.fullName}</td>
                    <td className="border p-2">{emp.workEmail}</td>
                    <td className="border p-2">{deptName}</td>
                    <td className="border p-2 text-green-700 font-semibold">
                      {mapping?.roleName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CreateAdminFromEmployee;
