import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import SalaryCalculationTypeModal from "./SalaryCalculationTypeModal";
import AttendanceBased from "./AttendanceBased";
import DynamicComponentBased from "./DynamicComponentBased";

const SalaryCalculationType = () => {
  const [currentType, setCurrentType] = useState(null);
  const [loading, setLoading] = useState(false);

  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [dynamicOpen, setDynamicOpen] = useState(false);

  // 🔹 GET current calculation type
  const fetchCalculationType = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        "/SalaryCalculationTypeConfig/company"
      );
      setCurrentType(res.data?.data?.[0]?.calculationType || null);
    } catch {
      toast.error("Failed to fetch calculation type");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculationType();
  }, []);

  // 🔹 Save / Update Calculation Type
  const handleSaveType = async (type) => {
    try {
      await axiosInstance.post("/SalaryCalculationTypeConfig/save", {
        calculationType: type,
      });
      toast.success("Salary calculation type updated successfully");
      setTypeModalOpen(false);
      fetchCalculationType();
    } catch {
      toast.error("Failed to update calculation type");
    }
  };

  // 🔹 Button visibility
  const showAttendanceBtn = !currentType || currentType === "AttendanceBased";

  const showDynamicBtn =
    !currentType || currentType === "DynamicComponentBased";

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">
          Salary Calculation Configuration
        </h2>

        {/* ===== TYPE-RELATED ACTION BUTTONS ===== */}
        <div className="flex gap-4">
          {showAttendanceBtn && (
            <button
              onClick={() => setAttendanceOpen(true)}
              className="bg-primary hover:bg-secondary text-sm cursor-pointer text-white px-4 py-2 rounded-lg font-medium"
            >
              Attendance Based Settings
            </button>
          )}

          {showDynamicBtn && (
            <button
              onClick={() => {
                setDynamicOpen(true);
              }}
              className="bg-primary hover:bg-secondary text-sm cursor-pointer text-white px-4 py-2 rounded-lg font-medium"
            >
              Dynamic Component Settings
            </button>
          )}
        </div>
      </div>

      {/* ===== CURRENT TYPE CARD ===== */}
      <div className="bg-white rounded-lg shadow p-4 m-5 max-w-md flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Current Calculation Type</p>
          <p className="text-lg font-medium mt-1">
            {loading ? "Loading..." : currentType || "Not Configured"}
          </p>
        </div>

        <button
          onClick={() => setTypeModalOpen(true)}
          className="px-4 py-2 rounded-md text-xs bg-primary cursor-pointer hover:bg-secondary text-white"
        >
          {currentType ? "Update Calculation Type" : "Configure"}
        </button>
      </div>

      {/* ===== CALCULATION TYPE MODAL ===== */}
      <SalaryCalculationTypeModal
        open={typeModalOpen}
        defaultType={currentType}
        onClose={() => setTypeModalOpen(false)}
        onSubmit={handleSaveType}
      />

      {/* ===== ATTENDANCE BASED POPUP ===== */}
      <AttendanceBased
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
      />

      {/* ===== DYNAMIC COMPONENT POPUP ===== */}

      <DynamicComponentBased
        open={dynamicOpen}
        onClose={() => setDynamicOpen(false)}
      />
    </>
  );
};

export default SalaryCalculationType;
