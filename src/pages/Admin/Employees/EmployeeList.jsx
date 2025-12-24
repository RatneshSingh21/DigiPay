import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import { toast } from "react-toastify";
import { format } from "date-fns";
import assets from "../../../assets/assets";

/* 🔹 Status Pill */
const StatusPill = ({ enabled }) => (
  <span
    className={`text-xs font-semibold px-2 py-1 rounded-full ${
      enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {enabled ? "Enabled" : "Disabled"}
  </span>
);

/* 🔹 Helper for Select */
const createSelectValue = (id, dataArray, labelKey = "name") => {
  const matched = dataArray.find((item) => item.id === Number(id));
  return matched
    ? { label: matched[labelKey], value: matched.id }
    : { label: "Deleted", value: Number(id) };
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    location: "",
    department: "",
    designation: "",
  });

  /* 🔹 Fetch Lookups */
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [deptRes, desigRes, locRes] = await Promise.all([
          axiosInstance.get("/Department"),
          axiosInstance.get("/Designation"),
          axiosInstance.get("/WorkLocation"),
        ]);
        setDepartments(deptRes.data || []);
        setDesignations(desigRes.data || []);
        setLocations(locRes.data || []);
      } catch (err) {
        console.error("Error fetching lookup data", err);
      }
    };
    fetchLookups();
  }, []);

  /* 🔹 Fetch Employees */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/Employee");
        setEmployees(response.data?.data || response.data || []);
        console.log(response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error("You don’t have permission to view employees.");
        } else {
          toast.error(
            error?.response?.data?.message || "Error fetching employee data"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Sort Employee by EmpCode
  const sortedEmployees = [...employees].sort((a, b) =>
    a.employeeCode.localeCompare(b.employeeCode, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

  /* 🔹 Filter Employees */
  const filteredEmployees = sortedEmployees.filter((emp) => {
    const matchesLocation =
      !filters.location || emp.workLocationId === Number(filters.location);
    const matchesDepartment =
      !filters.department || emp.departmentId === Number(filters.department);
    const matchesDesignation =
      !filters.designation || emp.designationId === Number(filters.designation);
    const matchesSearch =
      !searchQuery ||
      emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesLocation &&
      matchesDepartment &&
      matchesDesignation &&
      matchesSearch
    );
  });

  const getDepartmentName = (id) =>
    departments.find((d) => d.id === id)?.name || "Deleted";
  const getDesignationTitle = (id) =>
    designations.find((d) => d.id === id)?.title || "Deleted";
  const getLocationName = (id) =>
    locations.find((l) => l.id === id)?.name || "Deleted";

  return (
    <div className="bg-white shadow rounded-xl">
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl flex items-center gap-2">
          <FiUsers className="text-primary" />
          Employees List
          <span className="text-sm font-medium text-gray-500">
            ({filteredEmployees.length} / {employees.length})
          </span>
        </h2>

        {employees.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary text-sm hover:bg-secondary cursor-pointer text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => navigate("/admin-dashboard/employees/add")}
            >
              Add Employee
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : employees.length > 0 ? (
        <div className="px-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4 justify-center">
            <div className="min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Name
              </label>
              <input
                type="text"
                placeholder="Enter employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Location
              </label>
              <Select
                options={locations.map((l) => ({ label: l.name, value: l.id }))}
                value={
                  filters.location
                    ? createSelectValue(filters.location, locations)
                    : null
                }
                onChange={(selected) =>
                  setFilters((prev) => ({
                    ...prev,
                    location: selected?.value || "",
                  }))
                }
                isClearable
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                autoFocus
              />
            </div>

            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <Select
                options={departments.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                value={
                  filters.department
                    ? createSelectValue(filters.department, departments)
                    : null
                }
                onChange={(selected) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: selected?.value || "",
                  }))
                }
                isClearable
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <Select
                options={designations.map((d) => ({
                  label: d.title,
                  value: d.id,
                }))}
                value={
                  filters.designation
                    ? createSelectValue(
                        filters.designation,
                        designations,
                        "title"
                      )
                    : null
                }
                onChange={(selected) =>
                  setFilters((prev) => ({
                    ...prev,
                    designation: selected?.value || "",
                  }))
                }
                isClearable
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
            {Object.values(filters).some((val) => val) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      location: "",
                      department: "",
                      designation: "",
                    });
                    setSearchQuery("");
                  }}
                  className="text-sm px-4 py-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Employee Table */}
          {filteredEmployees.length > 0 ? (
            <div className="border mx-auto max-w-xl md:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl overflow-auto border-gray-200 rounded-lg max-h-[70vh]">
              <table className="text-xs">
                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                  <tr className="text-center">
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      S.No
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      EmpCode
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      EmpName
                    </th>
                    <th scope="col" className="px-2 py-2  bg-gray-100">
                      WorkEmail
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Department
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Designation
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Work Location
                    </th>

                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Gender
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Mobile
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Joining Date
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Aadhar
                    </th>
                    <th scope="col" className="px-2 py-2 bg-gray-100">
                      Portal Access
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => (
                    <tr
                      key={emp.id}
                      className={`border-b border-gray-300 text-center ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-all`}
                    >
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">{emp.employeeCode}</td>
                      <td className="py-2 px-2 flex items-center gap-1">
                        <img
                          src={
                            emp.profilePic
                              ? emp.profilePic
                              : `https://i.pravatar.cc/150?u=${
                                  emp.id || emp.workEmail
                                }`
                          }
                          alt={emp.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />

                        <div className="font-medium text-gray-800">
                          {emp.fullName}
                        </div>
                      </td>
                      <td className="px-2 py-2 truncate">{emp.workEmail}</td>
                      <td>{getDepartmentName(emp.departmentId)}</td>
                      <td>{getDesignationTitle(emp.designationId)}</td>
                      <td>{getLocationName(emp.workLocationId)}</td>
                      <td className="px-2 py-2">{emp.gender}</td>
                      <td className="px-2 py-2">{emp.mobileNumber}</td>
                      <td className="px-2 py-2">
                        {emp.dateOfJoining
                          ? format(new Date(emp.dateOfJoining), "dd MMM yyyy")
                          : "N/A"}
                      </td>
                      <td className="px-2 py-2">
                        {emp.aadhaarCardNumber ? emp.aadhaarCardNumber : "-"}
                      </td>
                      <td className="px-2 py-2">
                        <StatusPill enabled={emp.portalAccessEnabled} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-4">
              No employees match the filters.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14">
          <img
            src={assets.EmployeeIllustration}
            alt="Employee Onboarding"
            className="w-64 h-auto mb-6"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
            Get your employees onboard
          </h1>
          <p className="text-center text-gray-600 pb-6">
            Easily onboard employees and manage payroll, benefits, and
            reimbursements—all in one place.
          </p>
          <div className="flex">
            <button
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition duration-200"
              onClick={() => navigate("/admin-dashboard/employees/add")}
            >
              Add Employee
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
