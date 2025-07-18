import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import Select from "react-select";
import assets from "../../../assets/assets";
import AddEmployeeForm from "./AddEmployeeForm";

const AddEmployee = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    department: "",
    designation: "",
  });

  const [isAdding, setIsAdding] = useState(false); // toggle between list and form

  const dummyEmployees = [
    {
      id: 1,
      name: "Akrit Ujjainiya",
      employeeCode: "07",
      email: "aakritujjainiya@gmail.com",
      department: "Software Developer",
      designation: "Frontend Developer",
      status: "Active",
      profilePic: "https://i.pravatar.cc/100",
      location: "Noida",
    },
    {
      id: 2,
      name: "Riya Mehra",
      employeeCode: "12",
      email: "riya.mehra@example.com",
      department: "Human Resources",
      designation: "HR Manager",
      status: "Active",
      profilePic: "https://i.pravatar.cc/300",
      location: "Gurgaon",
    },
    {
      id: 3,
      name: "Arjun Singh",
      employeeCode: "25",
      email: "arjun.singh@example.com",
      department: "Finance",
      designation: "Account Executive",
      status: "Inactive",
      profilePic: "https://i.pravatar.cc/30",
      location: "Mumbai",
    },
    {
      id: 4,
      name: "Neha Sharma",
      employeeCode: "33",
      email: "neha.sharma@example.com",
      department: "Marketing",
      designation: "Content Strategist",
      status: "Active",
      profilePic: "https://i.pravatar.cc/50",
      location: "Bangalore",
    },
  ];

  const [employees] = useState(dummyEmployees);

  const openImport = () => setShowImportModal(true);
  const closeImport = () => setShowImportModal(false);

  const filteredEmployees = employees.filter((emp) => {
    const { location, department, designation } = filters;
    return (
      (location ? emp.location === location : true) &&
      (department ? emp.department === department : true) &&
      (designation ? emp.designation === designation : true)
    );
  });

  const uniqueValues = (field) => [
    ...new Set(employees.map((emp) => emp[field])),
  ];

  // --------------------------------------------
  // 🔁 Conditional View: Add Form vs Employee List
  // --------------------------------------------
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

      {employees.length > 0 ? (
        <div className="px-6 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="min-w-[200px]">
              <Select
                options={uniqueValues("location").map((loc) => ({
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
                options={uniqueValues("department").map((dept) => ({
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
                options={uniqueValues("designation").map((des) => ({
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
                    <th className="py-2 px-4">DEPARTMENT</th>
                    <th className="py-2 px-4">EMPLOYEE STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <input type="checkbox" />
                        <img
                          src={emp.profilePic}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-800">
                            {emp.name} - {emp.employeeCode}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {emp.designation}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{emp.email}</td>
                      <td className="py-3 px-4">{emp.department}</td>
                      <td
                        className={`py-3 px-4 font-semibold ${
                          emp.status === "Active"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {emp.status}
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
        // Empty State
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
