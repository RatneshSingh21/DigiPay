import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import PerDayAttendanceCalendar from "./PerDayAttendanceCalendar";
import ModalOverlay from "../../../../components/ModalOverlay";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const AttendanceResultTable = ({ results, highlightText, getEmployeeName }) => {
  const [selectedDetails, setSelectedDetails] = useState(null);

  if (results.length === 0)
    return <p className="text-center text-gray-500">No data available.</p>;

  return (
    <>
      <div className="max-h-[70vh] overflow-y-auto p-2 pt-0">
        <table className="min-w-full divide-y text-xs text-center divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 sticky top-0">
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">S.No</th>
              <th className="p-2">Employee</th>
              {/* <th className="p-2">Company ID</th> */}
              <th className="p-2">Total Late (min)</th>
              <th className="p-2">Early Leave (min)</th>
              <th className="p-2">OT (min)</th>
              <th className="p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => {
              const employeeName = getEmployeeName
                ? getEmployeeName(item.employeeId)
                : item.employeeId;

              return (
                <tr
                  key={item.attendanceCalculationResultID}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 text-center">
                    {highlightText ? highlightText(employeeName) : employeeName}
                  </td>
                  {/* <td className="p-2">{item.companyId}</td> */}
                  <td className="p-2">{item.totalLateMinutes}</td>
                  <td className="p-2">{item.totalEarlyLeaveMinutes}</td>
                  <td className="p-2">{item.totalOTMinutes}</td>
                  <td className="p-2 text-center">
                    <button
                      className="flex items-center justify-center cursor-pointer mx-auto px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full shadow-sm hover:bg-blue-100 hover:shadow-md transition-all duration-200 focus:outline-none"
                      onClick={() => setSelectedDetails(item)}
                    >
                      <FiChevronDown className="mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      <ModalOverlay
        isOpen={!!selectedDetails}
        onClose={() => setSelectedDetails(null)}
        title={
          selectedDetails
            ? `Attendance Details - ${getEmployeeName(
                selectedDetails.employeeId
              )}`
            : ""
        }
      >
        {selectedDetails && (
          <PerDayAttendanceCalendar
            perDayDetails={selectedDetails.perDayDetails}
          />
        )}
      </ModalOverlay>
    </>
  );
};

export default AttendanceResultTable;
