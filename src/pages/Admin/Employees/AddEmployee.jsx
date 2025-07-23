import { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import Select from "react-select";
import assets from "../../../assets/assets";
import AddEmployeeForm from "./AddEmployeeForm";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";
import { format } from "date-fns";

// Reusable Status Pill
const StatusPill = ({ enabled }) => (
  <span
    className={`text-xs font-semibold px-2 py-1 rounded-full ${
      enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {enabled ? "Enabled" : "Disabled"}
  </span>
);

const AddEmployee = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    department: "",
    designation: "",
  });

  const [isAdding, setIsAdding] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/Employee");
        setEmployees(response.data?.data || response.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Error fetching employees."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const { location, department, designation } = filters;
    return (
      (location ? emp.workLocationName === location : true) &&
      (department ? emp.departmentName === department : true) &&
      (designation ? emp.designationName === designation : true)
    );
  });

  const uniqueValues = (field) => [
    ...new Set(employees.map((emp) => emp[field]).filter(Boolean)),
  ];

  if (isAdding) {
    return <AddEmployeeForm />;
  }

  return (
    <div className="bg-white mb-3">
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Employees</h2>
        {employees.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => setIsAdding(true)}
            >
              Add Employee
            </button>
            <button
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              onClick={openImport}
            >
              <FiDownload />
              Import
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : employees.length > 0 ? (
        <div className="px-6 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="min-w-[200px]">
              <Select
                options={uniqueValues("workLocationName").map((loc) => ({
                  label: loc,
                  value: loc,
                }))}
                placeholder="Select Work Location"
                value={
                  filters.location
                    ? { label: filters.location, value: filters.location }
                    : null
                }
                onChange={(selected) =>
                  setFilters({ ...filters, location: selected?.value || "" })
                }
                isClearable
              />
            </div>

            <div className="min-w-[200px]">
              <Select
                options={uniqueValues("departmentName").map((dept) => ({
                  label: dept,
                  value: dept,
                }))}
                placeholder="Select Department"
                value={
                  filters.department
                    ? { label: filters.department, value: filters.department }
                    : null
                }
                onChange={(selected) =>
                  setFilters({ ...filters, department: selected?.value || "" })
                }
                isClearable
              />
            </div>

            <div className="min-w-[200px]">
              <Select
                options={uniqueValues("designationName").map((des) => ({
                  label: des,
                  value: des,
                }))}
                placeholder="Select Designation"
                value={
                  filters.designation
                    ? { label: filters.designation, value: filters.designation }
                    : null
                }
                onChange={(selected) =>
                  setFilters({ ...filters, designation: selected?.value || "" })
                }
                isClearable
              />
            </div>
          </div>

          {/* Employee Table */}
          {filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr>
                    <th className="py-2 px-4">EMPLOYEE NAME</th>
                    <th className="py-2 px-4">WORK EMAIL</th>
                    <th className="py-2 px-4">DATE OF JOINING</th>
                  <th className="py-2 px-4">PORTAL ACCESS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <input type="checkbox" />
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
                        <div>
                          <div className="font-medium text-gray-800">
                            {emp.fullName} - {emp.employeeCode}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {emp.designationName}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{emp.workEmail}</td>
                      <td className="py-3 px-4">{emp.dateOfJoining ? format(new Date(emp.dateOfJoining), "dd MMM yyyy") : "N/A"}</td>
                     <td className="px-4 py-3">
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
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition duration-200"
              onClick={() => setIsAdding(true)}
            >
              Add Employee
            </button>
            <button
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition duration-200"
              onClick={openImport}
            >
              Import Employees
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
