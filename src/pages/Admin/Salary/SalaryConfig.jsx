import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import ConfirmModal from "../../../components/ConfirmModal";
import SalaryConfigForm from "./SalaryConfigForm";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const SalaryConfig = () => {
  const user = useAuthStore((state) => state.user);
  const orgId = user?.orgId || user?.userId;

  const [componentConfigs, setComponentConfigs] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);

  const fetchConfigs = async () => {
    try {
      const res = await axiosInstance.get("/OrgComponentConfig/by-org", {
        params: { orgId },
      });
      setComponentConfigs(res.data?.data || []);
    } catch (err) {
      console.error(
        err?.response?.data?.message || "Error fetching configs",
        err
      );
    }
  };

  useEffect(() => {
    if (orgId) fetchConfigs();
  }, [orgId]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/OrgComponentConfig/${id}`);
      toast.success("Component deleted successfully.");
      fetchConfigs();
    } catch (err) {
      console.error("Delete error", err);
      toast.error(err?.response?.data?.message || "Error deleting component.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-8">
      {/* Form for Add/Edit */}
      <SalaryConfigForm
        orgId={orgId}
        fetchConfigs={fetchConfigs}
        editData={editData}
        clearEdit={() => setEditData(null)}
      />

      {/* List */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Current Configs</h3>
        <table className="min-w-full border border-gray-200 rounded-lg text-sm text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">S NO.</th>
              <th className="px-4 py-2">Component Name</th>
              <th className="px-4 py-2">Calculation Type</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="capitalize">
            {componentConfigs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No components found.
                </td>
              </tr>
            ) : (
              componentConfigs.map((item, idx) => (
                <tr
                  key={item.componentConfigId}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-left">{idx + 1}.</td>
                  <td className="px-4 py-2">{item.componentName}</td>
                  <td className="px-4 py-2">
                    {item.calculationType === 1 ? "Percentage" : "Fixed Amount"}
                  </td>
                  <td className="px-4 py-2">
                    {item.calculationType === 1
                      ? `${item.percentageValue}%`
                      : `₹${item.fixedAmount}`}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        item.isEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isEnabled ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button
                      className="flex items-center cursor-pointer gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      onClick={() => setEditData(item)}
                    >
                      <FiEdit size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      className="flex items-center cursor-pointer gap-1 px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                      onClick={() => setConfirmDeleteId(item)}
                    >
                      <FiTrash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete?"
          message="Are you sure you want to delete? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default SalaryConfig;
