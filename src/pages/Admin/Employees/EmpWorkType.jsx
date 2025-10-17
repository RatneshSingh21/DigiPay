import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";
import EmpWorkTypeForm from "./EmpWorkTypeForm"; // 👈 new import

const EmpWorkType = () => {
  const User = useAuthStore((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workTypes, setWorkTypes] = useState([]);

  const [dropdowns, setDropdowns] = useState({
    categories: [],
    employmentTypes: [],
    workNatures: [],
    shifts: [],
    otRateSlabs: [],
    weekendPolicies: [],
    paySchedules: [],
    pieceRateFormulas: [],
    complianceGroups: [],
    leavePolicies: [],
  });

  // Fetch all dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [
          catRes,
          empRes,
          wnRes,
          shiftRes,
          otRes,
          wpRes,
          psRes,
          prfRes,
          cgRes,
          lpRes,
        ] = await Promise.all([
          axiosInstance.get("/Category/list"),
          axiosInstance.get("/EmploymentType/list"),
          axiosInstance.get("/WorkNatureMaster/all"),
          axiosInstance.get("/ShiftMaster/list"),
          axiosInstance.get("/OTRateSlab/list"),
          axiosInstance.get("/WeekendPolicy/list"),
          axiosInstance.get("/PaySchedule/all"),
          axiosInstance.get("/PieceRateFormula/list"),
          axiosInstance.get("/ComplianceGroup/list"),
          axiosInstance.get("/LeavePolicy/list"),
        ]);

        setDropdowns({
          categories: catRes.data?.data || [],
          employmentTypes: empRes.data?.data || [],
          workNatures: wnRes.data?.data || [],
          shifts: shiftRes.data?.data || [],
          otRateSlabs: otRes.data?.data || [],
          weekendPolicies: wpRes.data?.data || [],
          paySchedules: psRes.data?.data || [],
          pieceRateFormulas: prfRes.data?.data || [],
          complianceGroups: cgRes.data?.data || [],
          leavePolicies: lpRes.data?.data || [],
        });
      } catch (err) {
        console.error("Failed to fetch dropdowns", err);
      }
    };

    fetchDropdowns();
    fetchWorkTypes();
  }, []);

  // Fetch Work Types list
  const fetchWorkTypes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/WorkTypeMaster/all");
      setWorkTypes(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to fetch Work Types");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Work Types</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center text-sm cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-md mx-4 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : workTypes.length > 0 ? (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Id</th>
                <th className="px-4 py-2 text-left">Work Type Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Work Hours</th>
                <th className="px-4 py-2 text-left">Break Hours</th>
                <th className="px-4 py-2 text-left">Overtime</th>
                <th className="px-4 py-2 text-left">Active</th>
              </tr>
            </thead>
            <tbody>
              {workTypes.map((item) => (
                <tr
                  key={item.workTypeId}
                  className={`border-b hover:bg-gray-50 ${
                    !item.isActive ? "opacity-70" : ""
                  }`}
                >
                  <td className="px-4 py-2">{item.workTypeId}</td>
                  <td className="px-4 py-2">{item.workTypeName}</td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.workHoursPerDay || "-"}</td>
                  <td className="px-4 py-2">{item.breakHours || "-"}</td>
                  <td className="px-4 py-2">
                    {item.overtimeApplicable ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2">
                    {item.isActive ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-500 font-medium">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8 text-sm">
            No Work Types found.
          </p>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <EmpWorkTypeForm
          user={User}
          dropdowns={dropdowns}
          onClose={() => setShowModal(false)}
          onSuccess={fetchWorkTypes}
        />
      )}
    </div>
  );
};

export default EmpWorkType;
