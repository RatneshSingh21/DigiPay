import React, { useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiClock,
  FiSettings,
  FiBell,
  FiAlertTriangle,
  FiUsers,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import AttendancePolicyForm from "./AttendancePolicyForm";

// services
import { fetchMasterLookups } from "../../Admin/Attendance/masterLookupService";
import { idsToNames } from "../../Admin/Attendance/displayNames";
import assets from "../../../assets/assets";

/* -------------------- Helpers -------------------- */
const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

const badgeColorMap = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  purple: "bg-purple-100 text-purple-700",
  teal: "bg-teal-100 text-teal-700",
  gray: "bg-gray-100 text-gray-700",
};

const Badge = ({ children, color = "gray" }) => (
  <span
    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
      badgeColorMap[color] || badgeColorMap.gray
    }`}
  >
    {children}
  </span>
);

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-2 mt-4">
    <Icon className="w-4 h-4 text-gray-500 shrink-0" />
    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
      {children}
    </h4>
  </div>
);

const ListItem = ({ icon: Icon, children }) => (
  <li className="flex items-start gap-2">
    <Icon className="w-3.5 h-3.5 text-gray-500 mt-[2px] shrink-0" />
    <span>{children}</span>
  </li>
);

const EmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-600">
    <img
      src={assets.NoData}
      alt="No policies"
      className="w-64 mb-2 opacity-90"
    />

    <h3 className="text-lg font-semibold text-gray-800">
      No Attendance Policies Found
    </h3>

    <p className="text-sm text-gray-500 max-w-md mt-2">
      Attendance policies define working hours, payroll rules, and attendance
      behavior. Create one to get started.
    </p>

    <button
      onClick={onCreate}
      className="mt-6 flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg shadow hover:scale-[1.03] transition"
    >
      <FiPlus /> Create Policy
    </button>
  </div>
);

/* -------------------- Component -------------------- */
const AttendancePolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [lookups, setLookups] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchPolicies = async () => {
    const res = await axiosInstance.get("/AttendancePolicy/GetAll");
    setPolicies(res.data?.data || []);
  };

  useEffect(() => {
    fetchPolicies();
    fetchMasterLookups().then(setLookups);
  }, []);

  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="px-6 py-2 bg-white shadow sticky top-14 z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Attendance Policies</h2>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center text-sm cursor-pointer gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:scale-[1.03] transition"
        >
          <FiPlus /> Create Policy
        </button>
      </div>

      {/* ---------- Cards ---------- */}
      <div className="p-4 text-sm">
        {policies.length === 0 ? (
          <EmptyState onCreate={() => setShowModal(true)} />
        ) : (
          <div className="space-y-4">
            {policies.map((p) => (
              <div
                key={p.attendancePolicyId}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-4 py-3 border-b border-gray-400 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">
                      {p.policyName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(p.effectiveFrom).toLocaleDateString("en-GB")} –{" "}
                      {new Date(p.effectiveTo).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge color={p.isActive ? "green" : "red"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>

                    <button
                      onClick={() => {
                        setEditData(p);
                        setShowModal(true);
                      }}
                      className="flex items-center cursor-pointer gap-1 px-2 py-1 text-xs bg-primary text-white rounded shadow-sm hover:scale-[1.02]"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>

                {/* Card Content: TWO COLUMNS */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  {/* LEFT COLUMN */}
                  <div className="space-y-4">
                    <div>
                      <SectionTitle icon={FiUsers}>Applies To</SectionTitle>
                      <ul className="space-y-0.5">
                        <ListItem icon={FiClock}>
                          <strong>Shifts:</strong>{" "}
                          {idsToNames(p.shiftIds, lookups.shiftMap)}
                        </ListItem>
                        <ListItem icon={FiBriefcase}>
                          <strong>Work Types:</strong>{" "}
                          {idsToNames(p.workTypeIds, lookups.workTypeMap)}
                        </ListItem>
                        <ListItem icon={FiUsers}>
                          <strong>Departments:</strong>{" "}
                          {idsToNames(p.departmentIds, lookups.departmentMap)}
                        </ListItem>
                        <ListItem icon={FiMapPin}>
                          <strong>Locations:</strong>{" "}
                          {idsToNames(p.locationIds, lookups.locationMap)}
                        </ListItem>
                      </ul>
                    </div>

                    <div>
                      <SectionTitle icon={FiClock}>
                        Attendance Rules
                      </SectionTitle>
                      <ul className="space-y-0.5">
                        <ListItem icon={FiCheckCircle}>
                          <strong>Full Day:</strong> {p.fullDayHours} hrs
                        </ListItem>
                        <ListItem icon={FiCheckCircle}>
                          <strong>Half Day:</strong> {p.halfDayHours} hrs
                        </ListItem>
                        <ListItem icon={FiCheckCircle}>
                          <strong>Late Policy:</strong>{" "}
                          {safeArray(p.latePolicyIds).length
                            ? "Configured"
                            : "None"}
                        </ListItem>
                        <ListItem icon={FiCheckCircle}>
                          <strong>OT Rate Slabs:</strong>{" "}
                          {safeArray(p.otRateSlabIds).length
                            ? "Applicable"
                            : "Not Applicable"}
                        </ListItem>
                      </ul>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">
                    <div>
                      <SectionTitle icon={FiDollarSign}>
                        Payroll Impact
                      </SectionTitle>
                      <ul className="space-y-0.5">
                        <ListItem icon={FiDollarSign}>
                          <strong>Adjustments:</strong>{" "}
                          {idsToNames(
                            p.paymentAdjustmentIds,
                            lookups.paymentAdjustmentMap
                          )}
                        </ListItem>
                        <ListItem icon={FiDollarSign}>
                          <strong>Leave Types:</strong>{" "}
                          {idsToNames(p.leaveTypeIds, lookups.leaveTypeMap)}
                        </ListItem>
                        <ListItem icon={FiDollarSign}>
                          <strong>Holidays:</strong>{" "}
                          {idsToNames(p.holidayListIds, lookups.holidayMap)}
                        </ListItem>
                      </ul>
                    </div>

                    <div>
                      <SectionTitle icon={FiSettings}>
                        System Behaviour
                      </SectionTitle>
                      <div className="flex flex-wrap gap-1.5">
                        {p.attendanceInputConfig?.enableBiometric && (
                          <Badge color="blue">Biometric</Badge>
                        )}
                        {p.attendanceInputConfig?.enableFaceRecognition && (
                          <Badge color="purple">Face ID</Badge>
                        )}
                        {p.attendanceInputConfig?.allowMobilePunch && (
                          <Badge color="teal">Mobile Punch</Badge>
                        )}
                        {p.attendanceInputConfig?.allowManualCorrection && (
                          <Badge color="yellow">Manual Correction</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <SectionTitle icon={FiBell}>
                        Escalation & Alerts
                      </SectionTitle>
                      <div className="flex flex-wrap gap-1.5">
                        {p.escalationConfig?.notifyManager && (
                          <Badge color="blue">Manager</Badge>
                        )}
                        {p.escalationConfig?.notifyHR && (
                          <Badge color="purple">HR</Badge>
                        )}
                        {p.escalationConfig?.notifyPayroll && (
                          <Badge color="teal">Payroll</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <SectionTitle icon={FiAlertTriangle}>
                        Exceptions
                      </SectionTitle>
                      <div className="flex flex-wrap gap-1.5">
                        {p.exceptionHandling?.allowShiftSwap && (
                          <Badge color="blue">Shift Swap</Badge>
                        )}
                        {p.exceptionHandling?.allowWFHAdjustment && (
                          <Badge color="green">WFH</Badge>
                        )}
                        {p.exceptionHandling?.allowCompOffAdjustment && (
                          <Badge color="purple">Comp Off</Badge>
                        )}
                        {p.exceptionHandling?.auditRequired && (
                          <Badge color="red">Audit Required</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <AttendancePolicyForm
            initialData={editData}
            onClose={() => {
              setShowModal(false);
              setEditData(null);
            }}
            onSuccess={fetchPolicies}
          />
        )}
      </div>
    </>
  );
};

export default AttendancePolicyList;
