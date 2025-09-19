import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { format, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import Pagination from "../../../components/Pagination";

const statusColors = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-yellow-100 text-yellow-800",
  Absent: "bg-red-100 text-red-700",
  active: "bg-blue-100 text-blue-700",
};

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("Today");
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(true);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageData, setPerPageData] = useState(3);
  const [pageGroup, setPageGroup] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axiosInstance.get("/Attendance/all");
        setAttendanceData(res.data);
        console.log(res.data);

        // fetch employees
        const employeeIds = [...new Set(res.data.map((a) => a.employeeId))];
        const employeeResponses = await Promise.all(
          employeeIds.map((id) =>
            axiosInstance.get(`/Employee/${id}`).then((r) => r.data)
          )
        );
        const map = {};
        employeeResponses.forEach((emp) => {
          map[emp.id] = emp.fullName;
        });
        setEmployeeMap(map);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const formatTime = (time) => {
    if (!time) return "-";
    return format(new Date(time), "hh:mma");
  };

  // filter attendance by active tab
  const filterByTab = (data) => {
    const today = new Date();
    if (activeTab === "Today") {
      return data.filter(
        (att) => att.inTime && isSameDay(new Date(att.inTime), today)
      );
    }
    if (activeTab === "Week") {
      return data.filter(
        (att) =>
          att.inTime &&
          isSameWeek(new Date(att.inTime), today, { weekStartsOn: 1 })
      );
    }
    if (activeTab === "Month") {
      return data.filter(
        (att) => att.inTime && isSameMonth(new Date(att.inTime), today)
      );
    }
    return data;
  };

  const filteredData = filterByTab(attendanceData);

  // pagination calculations
  const totalDataLength = filteredData.length;
  const totalPages = Math.ceil(totalDataLength / perPageData);
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
          <p className="text-sm text-gray-500">
            Showing {totalDataLength} records
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg">
          {["Today", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1.5 cursor-pointer text-sm rounded-md transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1); // reset to first page on tab change
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-500 py-4">Loading...</p>
        ) : (
          <>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 font-medium">Employee Name</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium">In Time</th>
                  <th className="font-medium">Out Time</th>
                  <th className="font-medium">T. Hours</th>
                  <th className="font-medium">Lat.</th>
                  <th className="font-medium">Long.</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((att) => (
                    <tr
                      key={att.attendanceId}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 text-gray-800">
                        {employeeMap[att.employeeId] || `ID: ${att.employeeId}`}
                      </td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[att.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="text-gray-700">
                        {formatTime(att.inTime)}
                      </td>
                      <td className="text-gray-700">
                        {formatTime(att.outTime)}
                      </td>
                      <td className="text-gray-700">
                        {att.totalHours !== null
                          ? att.totalHours.toFixed(2)
                          : "-"}
                      </td>
                      <td className="text-gray-700">
                        {att.latitude != null ? att.latitude.toFixed(4) : "-"}
                      </td>
                      <td className="text-gray-700">
                        {att.longitude != null ? att.longitude.toFixed(4) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              pageGroup={pageGroup}
              setPageGroup={setPageGroup}
              perPageData={perPageData}
              setPerPageData={setPerPageData}
              filteredData={filteredData}
              totalDataLength={totalDataLength}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
