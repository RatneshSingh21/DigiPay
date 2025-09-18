import React, { useEffect, useState } from "react";
import { MdEmail, MdPhone, MdWork, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmployeeProfile = () => {
  const User = useAuthStore((state) => state.user);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/Employee/${User.userId}`);
        const emp = res.data;

        // fetch related names
        const [deptRes, desigRes, payRes, locRes] = await Promise.all([
          emp.departmentId
            ? axiosInstance.get(`/Department/${emp.departmentId}`)
            : Promise.resolve({ data: null }),
          emp.designationId
            ? axiosInstance.get(`/Designation/${emp.designationId}`)
            : Promise.resolve({ data: null }),
          emp.payScheduleId
            ? axiosInstance.get(`/PaySchedule/${emp.payScheduleId}`)
            : Promise.resolve({ data: null }),
          emp.workLocationId
            ? axiosInstance.get(`/WorkLocation/${emp.workLocationId}`)
            : Promise.resolve({ data: null }),
        ]);

        setEmployee({
          ...emp,
          departmentName: deptRes.data?.name || null,
          designationName: desigRes.data?.title || null,
          payScheduleName: payRes.data?.name || null,
          workLocationName: locRes.data?.name || null,
        });
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      } finally {
        setLoading(false);
      }
    };

    if (User.userId) fetchEmployee();
  }, [User.userId]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!employee)
    return <div className="p-6 text-center">No employee data found.</div>;

  return (
    <div className="flex items-center justify-center bg-gray-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6 sm:p-10 space-y-8 hover:shadow-xl transition-all duration-300">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <img
              src={employee.profileImage || "https://i.pravatar.cc/150?img=13"}
              alt="Profile"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-gray-200 shadow-md mx-auto sm:mx-0"
            />
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {employee.fullName}
                </h2>
                {employee.isDirector && (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Director
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{employee.employeeCode}</p>
            </div>
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
            <span>{employee.designationName || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdCalendarToday className="text-lg text-gray-500" />
            <span>
              Joined:{" "}
              {employee.dateOfJoining
                ? format(new Date(employee.dateOfJoining), "dd MMM yyyy")
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-sm text-gray-700 border-t border-gray-200">
          <div>
            <span className="font-semibold">Gender:</span> {employee.gender}
          </div>
          <div>
            <span className="font-semibold">Department:</span>{" "}
            {employee.departmentName || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Work Location:</span>{" "}
            {employee.workLocationName || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Pay Schedule:</span>{" "}
            {employee.payScheduleName || "N/A"}
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

// import React, { useEffect, useState } from "react";
// import { MdEmail, MdPhone, MdWork, MdCalendarToday } from "react-icons/md";
// import { format } from "date-fns";
// import axiosInstance from "../../../axiosInstance/axiosInstance";
// import useAuthStore from "../../../store/authStore";

// const EmployeeProfile = () => {
//   const User = useAuthStore((state) => state.user);
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);

//   console.log(User.userId);

//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         setLoading(true);
//         const res = await axiosInstance.get(`/Employee/${User.userId}`);
//         console.log(res.data);

//         setEmployee(res.data); // directly from API
//       } catch (error) {
//         console.error("Failed to fetch employee:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (User.userId) fetchEmployee();
//   }, [User.userId]);

//   if (loading) return <div className="p-6 text-center">Loading...</div>;
//   if (!employee)
//     return <div className="p-6 text-center">No employee data found.</div>;

//   return (
//     <div className="flex items-center justify-center bg-gray-50 px-4 py-10 sm:py-16">
//       <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6 sm:p-10 space-y-8 hover:shadow-xl transition-all duration-300">
//         {/* Profile Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
//           <div className="flex flex-col sm:flex-row sm:items-center gap-6">
//             <img
//               src={employee.profileImage || "https://i.pravatar.cc/150?img=13"}
//               alt="Profile"
//               className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-gray-200 shadow-md mx-auto sm:mx-0"
//             />
//             <div className="flex flex-col gap-2 text-center sm:text-left">
//               <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
//                 <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
//                   {employee.fullName}
//                 </h2>
//                 {employee.isDirector && (
//                   <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
//                     Director
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-gray-500">{employee.employeeCode}</p>
//             </div>
//           </div>
//         </div>

//         {/* Contact & Work Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
//           <div className="flex items-center gap-2">
//             <MdEmail className="text-lg text-gray-500" />
//             <span>{employee.workEmail}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <MdPhone className="text-lg text-gray-500" />
//             <span>{employee.mobileNumber}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <MdWork className="text-lg text-gray-500" />
//             <span>
//               {/* API gives designationId (number), replace with designationName if available */}
//               {employee.designationName || `ID: ${employee.designationId}`}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <MdCalendarToday className="text-lg text-gray-500" />
//             <span>
//               Joined:{" "}
//               {employee.dateOfJoining
//                 ? format(new Date(employee.dateOfJoining), "dd MMM yyyy")
//                 : "N/A"}
//             </span>
//           </div>
//         </div>

//         {/* Additional Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-sm text-gray-700 border-t border-gray-200">
//           <div>
//             <span className="font-semibold">Gender:</span> {employee.gender}
//           </div>
//           <div>
//             <span className="font-semibold">Department:</span>{" "}
//             {employee.departmentName || `ID: ${employee.departmentId}`}
//           </div>
//           <div>
//             <span className="font-semibold">Work Location:</span>{" "}
//             {employee.workLocationName || `ID: ${employee.workLocationId}`}
//           </div>
//           <div>
//             <span className="font-semibold">Pay Schedule:</span>{" "}
//             {employee.payScheduleName || `ID: ${employee.payScheduleId}`}
//           </div>
//           <div>
//             <span className="font-semibold">Portal Access:</span>{" "}
//             <span
//               className={`ml-1 font-semibold px-2 py-1 rounded-full text-xs ${
//                 employee.portalAccessEnabled
//                   ? "bg-green-100 text-green-700"
//                   : "bg-red-100 text-red-700"
//               }`}
//             >
//               {employee.portalAccessEnabled ? "Enabled" : "Disabled"}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeProfile;
