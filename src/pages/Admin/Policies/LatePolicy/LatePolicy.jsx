import React, { useEffect, useState } from "react";
import { Plus, Edit, Calendar, Clock, ListChecks } from "lucide-react";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AddLatePolicy from "./AddLatePolicy";
import assets from "../../../../assets/assets";
import { Switch } from "@headlessui/react";
import {
  fetchMasterLookups,
  idsToNames,
} from "../../../../services/masterLookupService";
import ConfirmModal from "../../../../components/ConfirmModal";

const formatRule = (r) => {
  const range =
    r.toLateMinutes != null
      ? `${r.fromLateMinutes}–${r.toLateMinutes} mins`
      : `${r.fromLateMinutes}+ mins`;
  switch (r.resolutionType) {
    case "Ignore":
      return `${range} → Ignore`;
    case "ApplyFine":
      return `${range} → Fine ₹${r.amount} (${r.amountType})`;
    case "DeductHalfDay":
      return `${range} → Half Day`;
    case "DeductFullDay":
      return `${range} → Full Day`;
    case "RequireMakeUpHours":
      return `${range} → Make-up ${r.requiredMakeUpHours} hrs`;
    case "AdjustLeave":
      return `${range} → Leave (${r.leaveType})`;
    default:
      return `${range} → ${r.resolutionType}`;
  }
};

const badgeColors = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
];

const LatePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [lookupMaps, setLookupMaps] = useState({
    shiftMap: {},
    departmentMap: {},
    locationMap: {},
    workTypeMap: {},
    leaveTypeMap: {},
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    policyId: null,
  });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/LatePolicy/all");
      setPolicies(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch late policies");
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const maps = await fetchMasterLookups();
      setLookupMaps({
        shiftMap: maps.shiftMap,
        departmentMap: maps.departmentMap,
        locationMap: maps.locationMap,
        workTypeMap: maps.workTypeMap,
        leaveTypeMap: maps.leaveTypeMap,
      });
    } catch {
      toast.error("Failed to fetch lookup data");
    }
  };

  useEffect(() => {
    fetchLookups();
    fetchPolicies();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };
  const handleEdit = (data) => {
    setEditData(data);
    setShowForm(true);
  };

  const handleDelete = async (policyId) => {
    try {
      await axiosInstance.delete(`/LatePolicy/delete/${policyId}`);
      toast.success("Policy deleted successfully");
      fetchPolicies();
    } catch {
      toast.error("Failed to delete policy");
    } finally {
      setConfirmDelete({ open: false, policyId: null });
    }
  };

  const handleToggleStatus = async (policyId, currentStatus) => {
    try {
      await axiosInstance.patch(
        `/LatePolicy/toggle-status/${policyId}?isActive=${!currentStatus}`
      );
      toast.success(
        `Policy ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      fetchPolicies();
    } catch (err) {
      toast.error("Failed to update policy status");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-900">Late Policies</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary hover:bg-secondary text-white rounded-lg"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-secondary text-white rounded-lg text-sm"
          >
            <Plus size={16} /> Add Policy
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-6 flex flex-col gap-4">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm">
            <img
              src={assets.NoData}
              alt="No Late Policies"
              className="w-52 mb-4 opacity-90"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Late Policies Found
            </h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md text-center leading-relaxed">
              Create late policies to automatically handle employee late
              arrivals, apply grace time, fines, leave deductions, or make-up
              hours.
            </p>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2 rounded-full text-sm font-medium shadow hover:shadow-md transition-all duration-200"
            >
              <Plus size={16} /> Create Late Policy
            </button>
          </div>
        ) : (
          policies.map((p) => (
            <div
              key={p.latePolicyId}
              className="rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-4 flex flex-col gap-2"
            >
              {/* Title */}
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-gray-900">
                  {p.policyName}
                </h3>
                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>

                  {/* Toggle */}
                  <Switch
                    checked={p.isActive}
                    onChange={() =>
                      handleToggleStatus(p.latePolicyId, p.isActive)
                    }
                    className={`${
                      p.isActive ? "bg-green-500" : "bg-gray-300"
                    } relative cursor-pointer inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span
                      className={`${
                        p.isActive ? "translate-x-5" : "translate-x-0"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
              {p.description && (
                <p className="text-sm text-gray-600">{p.description}</p>
              )}

              {/* Core Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />{" "}
                  <span className="font-medium">Effective:</span>{" "}
                  {new Date(p.effectiveFrom).toLocaleDateString("en-GB")} →{" "}
                  {p.effectiveTo
                    ? new Date(p.effectiveTo).toLocaleDateString("en-GB")
                    : "Open"}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />{" "}
                  <span className="font-medium">Grace:</span>{" "}
                  {p.graceMinutesPerDay} mins/day ({p.maxGraceOccurrences}{" "}
                  times)
                </div>
                <div className="flex items-center gap-1">
                  <ListChecks size={14} />{" "}
                  <span className="font-medium">Late Threshold:</span>{" "}
                  {p.lateThresholdMinutes} mins
                </div>
                <div className="flex items-center gap-1">
                  <ListChecks size={14} />{" "}
                  <span className="font-medium">Max Late / Month:</span>{" "}
                  {p.maxLateAllowedPerMonth}
                </div>
              </div>

              {/* Resolution Rules */}
              <div>
                <p className="font-semibold text-sm mb-1 text-gray-800">
                  Resolution Rules:
                </p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {p.resolutionRules
                    ?.sort((a, b) => a.priority - b.priority)
                    .map((r, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 items-center bg-white/80 rounded-md px-2 py-1"
                      >
                        <span className="w-2 h-2 mt-1 rounded-full bg-primary" />
                        {formatRule(r)}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Work Types / Shifts / Departments / Locations */}
              <div className="flex flex-wrap gap-1 text-xs">
                {["Work Types", "Shifts", "Departments", "Locations"].map(
                  (label, i) => {
                    let names = [];
                    if (label === "Work Types")
                      names = idsToNames(
                        p.workTypeIds,
                        lookupMaps.workTypeMap
                      ).split(", ");
                    if (label === "Shifts")
                      names = idsToNames(p.shiftIds, lookupMaps.shiftMap).split(
                        ", "
                      );
                    if (label === "Departments")
                      names = idsToNames(
                        p.departmentIds,
                        lookupMaps.departmentMap
                      ).split(", ");
                    if (label === "Locations")
                      names = idsToNames(
                        p.locationIds,
                        lookupMaps.locationMap
                      ).split(", ");
                    return (
                      <div key={i} className="flex gap-1 flex-wrap w-full">
                        <span className="font-medium">{label}:</span>
                        {names.length > 0 ? (
                          names.map((n, j) => (
                            <span
                              key={j}
                              className={`px-2 py-0.5 rounded-full ${
                                badgeColors[j % badgeColors.length]
                              }`}
                            >
                              {n}
                            </span>
                          ))
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end mt-1">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary hover:text-white transition cursor-pointer"
                >
                  <Edit size={12} /> Edit
                </button>
                <button
                  onClick={() =>
                    setConfirmDelete({ open: true, policyId: p.latePolicyId })
                  }
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <AddLatePolicy
          onClose={() => setShowForm(false)}
          isEdit={!!editData}
          initialData={editData}
          onSuccess={fetchPolicies}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete.open && (
        <ConfirmModal
          title="Delete Policy"
          message="Are you sure you want to delete this late policy?"
          onCancel={() => setConfirmDelete({ open: false, policyId: null })}
          onConfirm={() => handleDelete(confirmDelete.policyId)}
        />
      )}
    </>
  );
};

export default LatePolicy;
