import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MdEmail, MdPhone, MdWork, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";

const EmployeeProfile = () => {
  const { id } = useParams(); // Can be hardcoded or dynamic
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummyData = {
      id: 7,
      employeeCode: "EMP101",
      fullName: "Raju Punjabi",
      dateOfJoining: "2023-07-15T00:00:00",
      workEmail: "raju.punjabi@gmail.com",
      mobileNumber: "9876543210",
      isDirector: true,
      gender: "Male",
      departmentName: "Production",
      designationName: "Manager",
      workLocationName: "Noida Office",
      payScheduleName: "Monthly",
      portalAccessEnabled: true,
      profileImage: null,
    };

    setEmployee(dummyData);
    setLoading(false);

    /*
    const fetchEmployee = async () => {
      try {
        const res = await axiosInstance.get(`/api/Employee/${id}`);
        setEmployee(res.data);
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
    */
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!employee)
    return <div className="p-6 text-center">No employee data found.</div>;

  return (
    <div className="flex items-center justify-center bg-gray-50 px-4 py-14">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <img
            src={employee.profileImage || "https://i.pravatar.cc/150?img=13"}
            alt="Profile"
            className="w-24 h-24 bg-cover bg-no-repeat bg-center rounded-full border-2 border-gray-300 shadow-md"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800">
                {employee.fullName}
              </h2>
              {employee.isDirector && (
                <div
                  className="inline-block px-2 border-2 text-sm rounded-md shadow-md bg-black text-yellow-300 font-bold border-yellow-300"
                  style={{ transform: "rotate(-5deg)" }}
                >
                  DIRECTOR
                </div>
                // <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                //   🌟 Director Badge
                // </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{employee.employeeCode}</p>
          </div>
        </div>

        {/* Contact & Work Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <MdEmail className="text-lg text-gray-500" />
            <span>{employee.workEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdPhone className="text-lg text-gray-500" />
            <span>{employee.mobileNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdWork className="text-lg text-gray-500" />
            <span>{employee.designationName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdCalendarToday className="text-lg text-gray-500" />
            <span>
              Joined: {format(new Date(employee.dateOfJoining), "dd MMM yyyy")}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-sm text-gray-700 border-t border-gray-200">
          <div>
            <span className="font-semibold">Gender:</span> {employee.gender}
          </div>
          <div>
            <span className="font-semibold">Department:</span>{" "}
            {employee.departmentName}
          </div>
          <div>
            <span className="font-semibold">Work Location:</span>{" "}
            {employee.workLocationName}
          </div>
          <div>
            <span className="font-semibold">Pay Schedule:</span>{" "}
            {employee.payScheduleName}
          </div>
          <div>
            <span className="font-semibold">Portal Access:</span>{" "}
            <span
              className={`ml-1 font-semibold px-2 py-1 rounded-full text-xs ${
                employee.portalAccessEnabled
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {employee.portalAccessEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
