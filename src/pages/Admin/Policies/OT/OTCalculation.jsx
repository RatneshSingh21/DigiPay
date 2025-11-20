import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import OTCalculationForm from "./OTCalculationForm";

const OTCalculation = () => {
  const [showModal, setShowModal] = useState(false);
  const [otList, setOtList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeMap, setEmployeeMap] = useState({}); // {id: fullName}

  // Fetch OT List
  const fetchOTList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/OTCalculation");
      const otData = res.data.response || [];
      setOtList(otData);

      // Extract unique employeeIds
      const employeeIds = [...new Set(otData.map((ot) => ot.employeeId))];

      // Fetch employee names
      const employeeData = {};
      await Promise.all(
        employeeIds.map(async (id) => {
          try {
            const empRes = await axiosInstance.get(`/Employee/${id}`);
            employeeData[id] = `${empRes.data.fullName} (${empRes.data.employeeCode})`;
          } catch (err) {
            employeeData[id] = "Unknown";
          }
        })
      );
      setEmployeeMap(employeeData);
    } catch (error) {
      toast.error("Failed to fetch OT Calculations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOTList();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="sticky top-14 bg-white shadow-sm px-4 py-2 mb-2 flex justify-between items-center z-10">
        <h2 className="text-xl font-semibold text-gray-800">OT Calculation</h2>
        <button
          className="flex items-center gap-2 text-sm cursor-pointer bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md"
          onClick={() => setShowModal(true)}
        >
          <FiPlus size={14} /> Add OT Entry
        </button>
      </div>

      {/* OT List */}
      <div className="overflow-x-auto bg-white rounded-xl shadow p-2 mx-3">
        {loading ? (
          <p>Loading...</p>
        ) : otList.length === 0 ? (
          <p>No OT entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-100 text-gray-600 text-center">
                <tr>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Attendance Date</th>
                  <th className="p-3">Attendance Record ID</th>
                  {/* <th className="p-3">Shift ID</th>
                  <th className="p-3">Policy ID</th> */}
                  <th className="p-3">OT Minutes</th>
                  <th className="p-3">OT Hours</th>
                  <th className="p-3">Rate/Hour</th>
                  <th className="p-3">Multiplier</th>
                  <th className="p-3">OT Amount</th>
                  <th className="p-3">Holiday OT</th>
                  <th className="p-3">Weekend OT</th>
                  <th className="p-3">Approved</th>
                  <th className="p-3">Processed to Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 text-center">
                {otList.map((ot) => (
                  <tr
                    key={ot.otCalculationId}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-3">
                      {employeeMap[ot.employeeId] || "Loading..."}
                    </td>
                    <td className="p-3">
                      {new Date(ot.attendanceDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{ot.attendanceRecordId}</td>
                    {/* <td className="p-3">{ot.shiftId}</td>
                    <td className="p-3">{ot.policyId}</td> */}
                    <td className="p-3">{ot.otMinutes}</td>
                    <td className="p-3">{ot.otHours}</td>
                    <td className="p-3">{ot.otRatePerHour}</td>
                    <td className="p-3">{ot.otMultiplier}</td>
                    <td className="p-3">{ot.otAmount}</td>
                    <td className="p-3">{ot.isHolidayOT ? "Yes" : "No"}</td>
                    <td className="p-3">{ot.isWeekendOT ? "Yes" : "No"}</td>
                    <td className="p-3">{ot.isApproved ? "Yes" : "No"}</td>
                    <td className="p-3">
                      {ot.isProcessedToSalary ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <OTCalculationForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchOTList}
        />
      )}
    </div>
  );
};

export default OTCalculation;
