import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiPlus, FiRefreshCw } from "react-icons/fi";
import AddOTRateSlabMaster from "./AddOTRateSlabMaster";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import assets from "../../../../../assets/assets";

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value ?? "—"}</p>
  </div>
);

const OTSlabMaster = () => {
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlab, setSelectedSlab] = useState(null);

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/OTRateSlabMaster/all");
      setSlabs(res.data?.data || []);
    } catch (err) {
      console.log("Error", err);
      // toast.error("Failed to load OT slabs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/OTRateSlabMaster/${id}`);
      toast.success("OT slab deleted");
      fetchSlabs();
    } catch {
      toast.error("Failed to delete OT slab");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, []);

  return (
    <>
      {/* HEADER */}
      <div className="sticky top-14 bg-white shadow-sm px-6 py-3 mb-6 flex justify-between items-center z-10">
        <h2 className="text-xl font-semibold text-gray-800">
          Overtime Rate Slabs
        </h2>

        <div className="flex gap-3 text-sm">
          <button
            onClick={fetchSlabs}
            className="flex items-center gap-2 border cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <FiRefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => {
              setSelectedSlab(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
          >
            <FiPlus size={16} /> New OT Slab
          </button>
        </div>
      </div>

      {/* EMPTY / LOADING */}
      {loading ? (
        <div className="flex justify-center items-center h-60 text-gray-500">
          Loading OT slabs…
        </div>
      ) : slabs.length === 0 ? (
        <div className="flex flex-col items-center py-12 bg-white rounded-xl shadow-lg">
          <img
            src={assets.ComplianceIllustration}
            alt="No OT Slabs"
            className="w-52 mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">No OT slabs configured</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-md text-center">
            Create overtime slabs to control how extra working hours are paid
            during payroll.
          </p>
          <button
            className="bg-primary text-white cursor-pointer px-5 py-2 rounded-lg text-sm hover:bg-secondary transition"
            onClick={() => setShowAddModal(true)}
          >
            + Create OT Slab
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-6 pb-10">
          {slabs.map((slab) => {
            const today = new Date();
            const from = slab.effectiveFrom
              ? new Date(slab.effectiveFrom)
              : null;
            const to = slab.effectiveTo ? new Date(slab.effectiveTo) : null;

            let status = "Disabled";
            if (slab.isEnabled) {
              if (from && today < from) status = "Scheduled";
              else if (to && today > to) status = "Expired";
              else status = "Active";
            }

            const statusColor = {
              Active: "bg-green-100 text-green-800",
              Scheduled: "bg-blue-100 text-blue-800",
              Expired: "bg-red-100 text-red-800",
              Disabled: "bg-gray-200 text-gray-700",
            }[status];

            return (
              <div
                key={slab.otRateSlabId}
                className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      OT {slab.fromHours} – {slab.toHours} Hours
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Slab ID #{slab.otRateSlabId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-3 py-1 rounded-full font-semibold ${statusColor}`}
                    >
                      {status}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedSlab(slab);
                        setShowAddModal(true);
                      }}
                      className="p-2 bg-primary/10 cursor-pointer text-primary rounded-md hover:bg-primary/20 transition"
                    >
                      <FiEdit size={16} />
                    </button>

                    <button
                      onClick={() => setConfirmDeleteId(slab.otRateSlabId)}
                      className="p-2 bg-red-50 cursor-pointer text-red-600 rounded-md hover:bg-red-100 transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* MAIN INFO */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem
                    label="Rate Per Hour"
                    value={`₹ ${slab.ratePerHour}`}
                  />
                  <InfoItem label="Rate Type" value={slab.rateType} />
                  <InfoItem
                    label="Max OT Hours"
                    value={slab.maxOTHours || "No Limit"}
                  />
                  <InfoItem
                    label="Grace Minutes"
                    value={slab.graceMinutesBeforeOT}
                  />
                  <InfoItem
                    label="Include Overflow"
                    value={slab.includeOverflowInPayroll ? "Yes" : "No"}
                  />
                  <InfoItem
                    label="Payment Component"
                    value={`Adjustment ID ${slab.paymentAdjustmentId}`}
                  />
                </div>

                {/* FORMULA */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-gray-500">
                    Calculation Rule
                  </p>
                  <div className="bg-gray-50 shadow-inner rounded-md p-2 text-[11px] font-mono">
                    {slab.calculationFormula || "Fixed calculation"}
                  </div>
                </div>

                {/* DATES */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <InfoItem
                    label="Effective From"
                    value={
                      slab.effectiveFrom
                        ? new Date(slab.effectiveFrom).toLocaleDateString(
                            "en-GB"
                          )
                        : "—"
                    }
                  />
                  <InfoItem
                    label="Effective To"
                    value={
                      slab.effectiveTo
                        ? new Date(slab.effectiveTo).toLocaleDateString("en-GB")
                        : "—"
                    }
                  />
                </div>

                {/* NOTES */}
                {slab.notes && (
                  <div className="mt-3 text-[11px] text-gray-600 border-t pt-2">
                    <strong>Notes:</strong> {slab.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[360px] text-sm shadow-lg">
            <h3 className="font-semibold mb-2 text-gray-800">
              Delete OT Slab?
            </h3>
            <p className="text-gray-600 mb-5">
              This OT slab will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <AddOTRateSlabMaster
          isEdit={!!selectedSlab}
          initialData={selectedSlab}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSlabs}
        />
      )}
    </>
  );
};

export default OTSlabMaster;
