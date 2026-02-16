import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit, Inbox } from "lucide-react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import PFSettingsForm from "./PFSettingsForm";

const Badge = ({ label, color }) => (
  <span
    className={`px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-700`}
  >
    {label}
  </span>
);

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value ?? "—"}</p>
  </div>
);

const PFSettings = () => {
  const [settings, setSettings] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("/PFSettings");
      setSettings(res.data.data || []);
    } catch (error) {
      console.log(error);
      // toast.error("Failed to load PF Settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">PF Rules Configuration</h2>
        <button
          onClick={() => {
            setEditData(null);
            setIsFormOpen(true);
          }}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded flex items-center text-sm"
        >
          <Plus size={16} className="mr-2" /> Create PF Rule
        </button>
      </div>

      {/* Empty State */}
      {settings.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[45vh] text-gray-500">
          <Inbox size={56} className="mb-3 text-gray-400" />
          <p className="text-lg font-semibold">No PF Rules Found</p>
          <p className="text-sm mt-1">
            Create a PF rule to define contribution logic.
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 px-4 pb-10">
        {settings.map((s) => (
          <div
            key={s.pfSettingsId}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  PF Rule #{s.pfSettingsId}
                </h3>
                <div className="mt-1">
                  {s.isActive ? (
                    <Badge label="Active" color="green" />
                  ) : (
                    <Badge label="Inactive" color="red" />
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditData(s);
                  setIsFormOpen(true);
                }}
                className="text-sm px-3 py-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center"
              >
                <Edit size={15} className="mr-1" /> Edit
              </button>
            </div>

            {/* Summary Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge label={s.eligibilityRule} color="blue" />
              <Badge label={s.baseRule} color="purple" />
              <Badge
                label={
                  s.calculationType === "Percentage"
                    ? `${s.percentage}%`
                    : `₹${s.fixedAmount}`
                }
                color="indigo"
              />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Employee Share" value={`${s.employeeShare}%`} />
              <InfoRow label="Employer Share" value={`${s.employerShare}%`} />
              <InfoRow
                label="Wage Limit"
                value={`₹${s.wageLimit?.toLocaleString()}`}
              />
              <InfoRow
                label="Min Service (Months)"
                value={s.minServiceMonths}
              />
              <InfoRow label="Rounding Method" value={s.roundingMethod} />
              <InfoRow
                label="Effective"
                value={`${new Date(s.effectiveFrom).toLocaleDateString("en-GB")} to ${s.effectiveTo ? new Date(s.effectiveTo).toLocaleDateString("en-GB") : "Never"}`}
              />
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-400 text-xs text-gray-500">
              Created on {new Date(s.createdAt).toLocaleDateString("en-GB")}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isFormOpen && (
        <PFSettingsForm
          initialData={editData}
          onClose={() => setIsFormOpen(false)}
          refreshList={fetchSettings}
        />
      )}
    </>
  );
};

export default PFSettings;
