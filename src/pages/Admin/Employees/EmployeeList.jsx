import React, { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import { toast } from "react-toastify";


const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/Employee");
        setEmployees(response.data);
        // console.log(response.data);
        
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast.error(error?.response?.data?.message || "Error fetching employee data:");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <FiUsers className="text-primary" />
        Employee List
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Mobile</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Gender</th>
                <th className="px-4 py-2 text-left">Joining Date</th>
                <th className="px-4 py-2 text-left">Director</th>
                <th className="px-4 py-2 text-left">Portal Access</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium">{emp.fullName}</td>
                  <td className="px-4 py-2">{emp.workEmail}</td>
                  <td className="px-4 py-2">{emp.mobileNumber}</td>
                  <td className="px-4 py-2">{emp.employeeCode}</td>
                  <td className="px-4 py-2">{emp.gender}</td>
                  <td className="px-4 py-2">
                    {new Date(emp.dateOfJoining).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {emp.isDirector ? (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <FaCheckCircle /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1">
                        <FaTimesCircle /> No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {emp.portalAccessEnabled ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                        Enabled
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                        Disabled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <div className="text-center text-gray-500 py-4">No employees found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
