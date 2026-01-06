import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import OTCalculationForm from "./OTCalculationForm";
import Select from "react-select";
import assets from "../../../../../assets/assets"; // Make sure illustration is imported

const OTCalculation = () => {
  const [showModal, setShowModal] = useState(false);
  const [otList, setOtList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeMap, setEmployeeMap] = useState({}); // {id: fullName}
  const [viewMode, setViewMode] = useState("employee"); // "date" or "employee"
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchOTList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/OTCalculation");
      const otData = res.data?.data ?? res.data?.response ?? [];
      setOtList(otData);

      const employeeIds = [...new Set(otData.map((ot) => ot.employeeId))];
      const employeeData = {};
      await Promise.all(
        employeeIds.map(async (id) => {
          try {
            const empRes = await axiosInstance.get(`/Employee/${id}`);
            const emp = empRes.data?.data;
            employeeData[id] = `${emp.fullName} (${emp.employeeCode})`;
          } catch {
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

  const groupByDate = otList.reduce((acc, item) => {
    const date = item.attendanceDate.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const groupByEmployee = otList.reduce((acc, item) => {
    const emp = employeeMap[item.employeeId] || "Unknown Employee";
    if (!acc[emp]) acc[emp] = [];
    acc[emp].push(item);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="sticky top-14 bg-white shadow-sm px-4 py-2 mb-2 flex justify-between items-center z-10">
        <h2 className="text-xl font-semibold text-gray-800">OT Calculation</h2>
        <div className="flex gap-5">
          <div className="w-50">
            <Select
              options={[
                { value: "employee", label: "Group by Employee" },
                { value: "date", label: "Group by Date" },
              ]}
              value={
                viewMode === "date"
                  ? { value: "date", label: "Group by Date" }
                  : { value: "employee", label: "Group by Employee" }
              }
              onChange={(option) => setViewMode(option.value)}
              isSearchable={false}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "30px",
                  height: "30px",
                  fontSize: "12px",
                }),
                dropdownIndicator: (base) => ({ ...base, padding: 2 }),
                clearIndicator: (base) => ({ ...base, padding: 2 }),
                valueContainer: (base) => ({ ...base, padding: "0 6px" }),
                singleValue: (base) => ({ ...base, fontSize: "12px" }),
              }}
            />
          </div>

          <button
            className="flex items-center gap-2 text-sm cursor-pointer bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md"
            onClick={() => setShowModal(true)}
          >
            <FiPlus size={14} /> Add OT Entry
          </button>
        </div>
      </div>

      {/* OT List */}
      <div className="overflow-x-auto bg-white rounded-xl shadow p-2 mx-3">
        {loading ? (
          <p className="text-gray-500 text-center py-6">Loading OT entries…</p>
        ) : otList.length === 0 ? (
          <div className="flex flex-col items-center py-12 rounded-xl shadow-lg">
            <img
              src={assets.NoData}
              alt="No OT Entries"
              className="w-52 mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">No OT entries found</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md text-center">
              Add OT entries here to calculate and manage overtime for
              employees.
            </p>
            <button
              className="bg-primary text-white px-5 py-2 cursor-pointer rounded-lg text-sm hover:bg-secondary transition"
              onClick={() => setShowModal(true)}
            >
              + Add OT Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-100 text-gray-600 text-center">
                <tr>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Attendance Date</th>
                  <th className="p-3">Attendance Record ID</th>
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
              <tbody className="text-gray-700 text-center">
                {/* GROUP BY DATE OR EMPLOYEE */}
                {viewMode === "date" &&
                  Object.keys(groupByDate)
                    .sort()
                    .map((date) => {
                      const isOpen = openGroups[date];
                      return (
                        <React.Fragment key={date}>
                          <tr
                            className="bg-gray-200 font-semibold cursor-pointer"
                            onClick={() => toggleGroup(date)}
                          >
                            <td colSpan={12} className="p-2 text-left">
                              <div className="flex items-center w-full">
                                <span
                                  className={`transition-transform ${
                                    isOpen ? "rotate-90" : ""
                                  }`}
                                >
                                  ►
                                </span>
                                <span>{date}</span>
                              </div>
                            </td>
                          </tr>
                          {isOpen &&
                            groupByDate[date].map((ot) => (
                              <tr
                                key={ot.otCalculationId}
                                className="hover:bg-gray-50"
                              >
                                <td className="p-3">
                                  {employeeMap[ot.employeeId]}
                                </td>
                                <td className="p-3">
                                  {new Date(
                                    ot.attendanceDate
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td className="p-3">{ot.attendanceRecordId}</td>
                                <td className="p-3">{ot.otMinutes}</td>
                                <td className="p-3">
                                  {(ot.otMinutes / 60).toFixed(2)}
                                </td>
                                <td className="p-3">{ot.otRatePerHour}</td>
                                <td className="p-3">{ot.otMultiplier}</td>
                                <td className="p-3">{ot.otAmount}</td>
                                <td className="p-3">
                                  {ot.isHolidayOT ? "Yes" : "No"}
                                </td>
                                <td className="p-3">
                                  {ot.isWeekendOT ? "Yes" : "No"}
                                </td>
                                <td className="p-3">
                                  {ot.isApproved ? "Yes" : "No"}
                                </td>
                                <td className="p-3">
                                  {ot.isProcessedToSalary ? "Yes" : "No"}
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}

                {viewMode === "employee" &&
                  Object.keys(groupByEmployee).map((emp) => {
                    const isOpen = openGroups[emp];
                    return (
                      <React.Fragment key={emp}>
                        <tr
                          className="bg-gray-200 font-semibold cursor-pointer"
                          onClick={() => toggleGroup(emp)}
                        >
                          <td colSpan={12} className="p-2 text-left">
                            <div className="flex items-center w-full">
                              <span
                                className={`transition-transform ${
                                  isOpen ? "rotate-90" : ""
                                }`}
                              >
                                ►
                              </span>
                              <span>{emp}</span>
                            </div>
                          </td>
                        </tr>
                        {isOpen &&
                          groupByEmployee[emp].map((ot) => (
                            <tr
                              key={ot.otCalculationId}
                              className="hover:bg-gray-50"
                            >
                              <td className="p-3">{emp}</td>
                              <td className="p-3">
                                {new Date(ot.attendanceDate).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                              <td className="p-3">{ot.attendanceRecordId}</td>
                              <td className="p-3">{ot.otMinutes}</td>
                              <td className="p-3">
                                {(ot.otMinutes / 60).toFixed(2)}
                              </td>
                              <td className="p-3">{ot.otRatePerHour}</td>
                              <td className="p-3">{ot.otMultiplier}</td>
                              <td className="p-3">{ot.otAmount}</td>
                              <td className="p-3">
                                {ot.isHolidayOT ? "Yes" : "No"}
                              </td>
                              <td className="p-3">
                                {ot.isWeekendOT ? "Yes" : "No"}
                              </td>
                              <td className="p-3">
                                {ot.isApproved ? "Yes" : "No"}
                              </td>
                              <td className="p-3">
                                {ot.isProcessedToSalary ? "Yes" : "No"}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
