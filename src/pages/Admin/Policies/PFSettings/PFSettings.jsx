import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit } from "lucide-react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import PFSettingsForm from "./PFSettingsForm";

const PFSettings = () => {
  const [settings, setSettings] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeTabs, setActiveTabs] = useState({}); // track active tab for each card

  // Fetch PF Settings
  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("/PFSettings");
      console.log(res.data);

      setSettings(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load PF Settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleTab = (id, tab) => {
    setActiveTabs((prev) => ({ ...prev, [id]: tab }));
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">PF Settings</h2>
        <button
          onClick={() => {
            setEditData(null);
            setIsFormOpen(true);
          }}
          className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2" size={16} /> Add PF Setting
        </button>
      </div>

      {/* Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {settings.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No PF settings found. Click{" "}
            <span className="font-medium text-primary">Add PF Setting</span> to
            create one.
          </div>
        )}

        {settings.map((s) => {
          const activeTab = activeTabs[s.pfSettingsId] || "overview";

          return (
            <div
              key={s.pfSettingsId}
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">
                  PF #{s.pfSettingsId}{" "}
                  {s.isActive ? (
                    <span className="ml-2 text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="ml-2 text-red-600 text-xs font-medium bg-red-100 px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </h3>
                <button
                  className="flex items-center cursor-pointer gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium rounded-md transition duration-200"
                  title="Edit"
                  onClick={() => {
                    setEditData(s);
                    setActiveTabs((prev) => ({
                      ...prev,
                      [s.pfSettingsId]: "advanced", // auto-open Advanced tab when editing
                    }));
                    setIsFormOpen(true);
                  }}
                >
                  <Edit size={16} /> Edit
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b mb-3 text-sm font-medium">
                {["overview", "advanced"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1 cursor-pointer ${
                      activeTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500"
                    }`}
                    onClick={() => toggleTab(s.pfSettingsId, tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="text-sm space-y-2 transition-all duration-300">
                {activeTab === "overview" && (
                  <>
                    <p>
                      <span className="font-medium">Calculation:</span>{" "}
                      {s.calculationType}
                    </p>
                    {s.calculationType === "Percentage" ? (
                      <p>
                        <span className="font-medium">Percentage:</span>{" "}
                        {s.percentage}%
                      </p>
                    ) : (
                      <p>
                        <span className="font-medium">Fixed Amount:</span> ₹
                        {s.fixedAmount}
                      </p>
                    )}

                    <p>
                      <span className="font-medium">Employee Share:</span>{" "}
                      {s.calculationType === "Fixed"
                        ? `₹${s.employeeShare}`
                        : `${s.employeeShare}%`}
                    </p>
                    <p>
                      <span className="font-medium">Employer Share:</span>{" "}
                      {s.calculationType === "Fixed"
                        ? `₹${s.employerShare}`
                        : `${s.employerShare}%`}
                    </p>
                    <p>
                      <span className="font-medium">Applies On:</span>{" "}
                      {s.appliesOn}
                    </p>
                    <p>
                      <span className="font-medium">Wage Limit:</span> ₹
                      {s.wageLimit?.toLocaleString() || "-"}
                    </p>
                  </>
                )}

                {activeTab === "advanced" && (
                  <>
                    {s.appliesOn === "CustomFormula" && (
                      <p>
                        <span className="font-medium">Custom Formula:</span>{" "}
                        {s.customFormula || "-"}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">
                        Restricted to Wage Limit:
                      </span>{" "}
                      {s.isRestrictedToWageLimit ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Min. Service Months:</span>{" "}
                      {s.minServiceMonths || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Rounding:</span>{" "}
                      {s.roundingMethod || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Effective From:</span>{" "}
                      {new Date(s.effectiveFrom).toLocaleDateString("en-GB")}
                    </p>
                    <p>
                      <span className="font-medium">Effective To:</span>{" "}
                      {new Date(s.effectiveTo).toLocaleDateString("en-GB")}
                    </p>
                    <p>
                      <span className="font-medium">Created At:</span>{" "}
                      {new Date(s.createdAt).toLocaleString("en-GB")}
                    </p>
                  </>
                )}
              </div>

              {/* Footer (Always Visible) */}
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                Valid: {new Date(s.effectiveFrom).toLocaleDateString("en-GB")} →{" "}
                {new Date(s.effectiveTo).toLocaleDateString("en-GB")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Screen Form */}
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
