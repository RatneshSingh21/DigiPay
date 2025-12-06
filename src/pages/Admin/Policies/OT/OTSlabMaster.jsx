import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import AddOTRateSlabMaster from "./AddOTRateSlabMaster";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import assets from "../../../../assets/assets";

const CardItem = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-[10px]">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

const OTSlabMaster = () => {
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState("Create");
  const [selectedSlab, setSelectedSlab] = useState(null);

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedSlab(null);
  };

  const fetchComplianceName = async (id) => {
    try {
      const res = await axiosInstance.get(`/Compliance/get-by-id/${id}`);
      return res.data?.complianceName || "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/OTRateSlabMaster/all");
      const slabData = res.data.data || [];

      // Fetch Compliance Names
      const slabsWithCompliance = await Promise.all(
        slabData.map(async (slab) => {
          const complianceName = await fetchComplianceName(slab.complianceId);
          return { ...slab, complianceName };
        })
      );

      setSlabs(slabsWithCompliance);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/OTRateSlabMaster/${id}`);
      toast.success("Deleted successfully");
      fetchSlabs();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="sticky top-14 bg-white shadow-sm px-4 py-2 mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          OT Rate Slab Master
        </h2>
        <div className="flex gap-2 text-sm">
          <button
            onClick={fetchSlabs}
            className="flex items-center cursor-pointer gap-2 border px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700"
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button
            className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-secondary text-white px-3 py-1.5 rounded-md"
            onClick={() => {
              setIsEdit(false);
              setSelectedSlab(null);
              openModal();
            }}
          >
            <FiPlus size={14} /> Add OT Rate Slab
          </button>
        </div>
      </div>

      {/* Empty / Loading / Table */}
      {loading ? (
        <div className="flex items-center justify-center h-60 text-gray-500 text-sm">
          Loading OT Rate Slabs...
        </div>
      ) : slabs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl shadow">
          <img
            src={assets.ComplianceIllustration}
            alt="No data"
            className="w-56 h-auto mb-4"
          />
          <h1 className="text-lg font-semibold text-gray-800 mb-2">
            Manage OT Rate Slabs
          </h1>
          <p className="text-gray-600 mb-5 max-w-md text-sm">
            Define and manage overtime rate slabs to ensure accurate payroll
            processing.
          </p>
          <button
            className="bg-primary hover:bg-secondary text-white px-5 py-2 rounded-lg text-xs font-medium"
            onClick={() => {
              setIsEdit("Add");
              setSelectedSlab(null);
              openModal();
            }}
          >
            + New OT Rate Slab
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-10">
          {slabs.map((slab) => {
            const status = (() => {
              const today = new Date();
              const from = new Date(slab.effectiveFrom);
              const to = new Date(slab.effectiveTo);

              if (!slab.isEnabled) return "Disabled";
              if (today < from) return "Scheduled";
              if (today > to) return "Expired";
              return "Active";
            })();

            const statusClass =
              status === "Active"
                ? "bg-green-100 text-green-700 border-green-300"
                : status === "Scheduled"
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : status === "Expired"
                ? "bg-red-100 text-red-700 border-red-300"
                : "bg-gray-200 text-gray-700 border-gray-300";

            return (
              <div
                key={slab.otRateSlabId}
                className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition"
              >
                {/* Title + Actions */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      {slab.complianceName}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Slab #{slab.otRateSlabId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full border ${statusClass}`}
                    >
                      {status}
                    </span>

                    {/* Edit Btn */}
                    <button
                      onClick={() => {
                        setIsEdit(true);
                        setSelectedSlab(slab);
                        openModal();
                      }}
                      className="p-1.5 bg-blue-50 cursor-pointer text-blue-600 rounded-md hover:bg-blue-100"
                    >
                      <FiEdit size={14} />
                    </button>

                    {/* Delete Btn */}
                    <button
                      onClick={() => setConfirmDeleteId(slab.otRateSlabId)}
                      className="p-1.5 bg-red-50 cursor-pointer text-red-600 rounded-md hover:bg-red-100"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-800">
                  <CardItem
                    label="Compliance"
                    value={`${slab.complianceName} (ID ${slab.complianceId})`}
                  />
                  <CardItem
                    label="Enabled"
                    value={
                      slab.isEnabled ? (
                        <span className="text-green-600 font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">No</span>
                      )
                    }
                  />

                  <CardItem label="From Hours" value={slab.fromHours} />
                  <CardItem label="To Hours" value={slab.toHours} />
                  <CardItem label="Rate / Hr" value={slab.ratePerHour} />
                  <CardItem label="Rate Type" value={slab.rateType} />
                  <CardItem label="Multiplier" value={slab.multiplierValue} />
                  <CardItem
                    label="Grace Minutes"
                    value={slab.graceMinutesBeforeOT}
                  />

                  <CardItem
                    label="Overflow Handling"
                    value={slab.overflowHandlingType || "—"}
                  />
                  <CardItem
                    label="Overflow Policy ID"
                    value={slab.overflowPolicyId || "—"}
                  />
                  <div className="col-span-2">
                    <div className="text-[10px] font-semibold text-gray-500">
                      Calculation Formula
                    </div>
                    <div className="text-[11px] bg-gray-50 border border-gray-200 rounded-md p-2 mt-1 font-mono text-gray-800">
                      {slab.calculationFormula || "—"}
                    </div>
                  </div>
                  <CardItem
                    label="Effective From"
                    value={slab.effectiveFrom?.split("T")[0]}
                  />
                  <CardItem
                    label="Effective To"
                    value={slab.effectiveTo?.split("T")[0]}
                  />
                </div>

                {/* Notes */}
                {slab.notes && (
                  <div className="mt-3 border-t pt-2 text-[11px] text-gray-600">
                    <span className="font-semibold">Notes: </span>
                    {slab.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[360px] text-xs">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this OT Rate Slab? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="border px-4 py-1.5 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[640px] p-6 relative max-h-[85vh] overflow-y-auto text-xs">
            <button
              className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-red-600 transition"
              onClick={closeModal}
            >
              <FiX size={16} />
            </button>
            <AddOTRateSlabMaster
              isEdit={!!selectedSlab}
              initialData={selectedSlab}
              onClose={closeModal}
              onSuccess={() => {
                fetchSlabs();
                closeModal();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OTSlabMaster;
