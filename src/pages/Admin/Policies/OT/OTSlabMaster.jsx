import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import AddOTRateSlabMaster from "./AddOTRateSlabMaster";
import useAuthStore from "../../../../store/authStore";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import assets from "../../../../assets/assets";

const OTSlabMaster = () => {
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState("Create");
  const [selectedSlab, setSelectedSlab] = useState(null);

  const { user } = useAuthStore();

  const openModal = () => setShowAddModal(true);
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedSlab(null);
  };

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/OTRateSlabMaster/all");
      setSlabs(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch OT Rate Slabs!");
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
      <div className="sticky top-14 bg-white shadow-sm rounded-xl px-4 py-2 mb-6 flex justify-between items-center">
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
        <div className="border mx-4 max-w-xl md:max-w-5xl 2xl:max-w-full overflow-auto border-gray-200 rounded-lg max-h-[60vh]">
          <table className="text-xs text-gray-700 text-center">
            <thead className="bg-gray-100 border-b">
              <tr>
                {[
                  "Slab ID",
                  "Compliance ID",
                  "From Hours",
                  "To Hours",
                  "Rate/Hour",
                  "Rate Type",
                  "Multiplier",
                  "Grace Minutes",
                  "Effective From",
                  "Effective To",
                  "Enabled",
                  "Notes",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className={`px-3 py-2 text-center font-semibold whitespace-nowrap ${
                      head === "Notes" ? "min-w-[250px]" : ""
                    }`}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slabs.map((slab) => (
                <tr
                  key={slab.otRateSlabId}
                  className="hover:bg-gray-50 border-b transition"
                >
                  <td className="px-3 py-2">{slab.otRateSlabId}</td>
                  <td className="px-3 py-2">{slab.complianceId}</td>
                  <td className="px-3 py-2">{slab.fromHours}</td>
                  <td className="px-3 py-2">{slab.toHours}</td>
                  <td className="px-3 py-2">{slab.ratePerHour}</td>
                  <td className="px-3 py-2">{slab.rateType}</td>
                  <td className="px-3 py-2">{slab.multiplierValue}</td>
                  <td className="px-3 py-2">{slab.graceMinutesBeforeOT}</td>
                  <td className="px-3 py-2">
                    {slab.effectiveFrom?.split("T")[0] || "-"}
                  </td>
                  <td className="px-3 py-2">
                    {slab.effectiveTo?.split("T")[0] || "-"}
                  </td>
                  <td className="px-3 py-2">
                    {slab.isEnabled ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-500 font-medium">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 min-w-[250px] break-words">
                    {slab.notes || "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedSlab(slab);
                          openModal();
                        }}
                        className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md transition"
                      >
                        <FiEdit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(slab.otRateSlabId)}
                        className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-md transition"
                      >
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              onClose={closeModal}
              isEdit={isEdit}
              initialData={selectedSlab}
              onSuccess={fetchSlabs}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OTSlabMaster;
