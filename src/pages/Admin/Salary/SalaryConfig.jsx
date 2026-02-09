import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import ConfirmModal from "../../../components/ConfirmModal";
import SalaryConfigForm from "./SalaryConfigForm";
import { FiEdit, FiTrash2, FiInbox } from "react-icons/fi";

const SalaryConfig = () => {
  const user = useAuthStore((state) => state.user);
  console.log(user);

  const orgId = user?.orgId || user?.companyId;

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
        err,
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
        existingComponents={componentConfigs}
      />

      {/* List */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Current Configs</h3>

        <div className="shadow rounded-lg h-[38vh] overflow-y-auto bg-white">
          {componentConfigs.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex h-full flex-col items-center justify-center text-gray-500">
              <FiInbox size={52} className="mb-3 text-gray-400" />
              <p className="text-sm font-semibold">
                No salary components found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Add a salary component to configure payroll
              </p>
            </div>
          ) : (
            /* TABLE */
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-center">
                <thead className="bg-gray-100 sticky top-0 text-gray-600">
                  <tr>
                    <th className="px-4 py-2">S.No</th>
                    <th className="px-4 py-2">Component Name</th>
                    <th className="px-4 py-2">Calculation Type</th>
                    <th className="px-4 py-2">Value</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody className="capitalize border-b border-gray-200">
                  {componentConfigs.map((item, idx) => (
                    <tr
                      key={item.componentConfigId}
                      className="hover:bg-gray-50 border-t border-gray-200 transition"
                    >
                      <td className="px-4 py-2">{idx + 1}</td>

                      <td className="px-4 py-2 font-medium">
                        {item.componentName}
                      </td>

                      <td className="px-4 py-2">
                        {item.calculationType === 1
                          ? "Percentage"
                          : "Fixed Amount"}
                      </td>

                      <td className="px-4 py-2">
                        {item.calculationType === 1
                          ? `${item.percentageValue}%`
                          : `₹${item.fixedAmount}`}
                      </td>

                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                          <FiEdit size={14} /> <span>Edit</span>
                        </button>
                        <button
                          className="flex items-center cursor-pointer gap-1 px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                          onClick={() =>
                            setConfirmDeleteId(item.componentConfigId)
                          }
                        >
                          <FiTrash2 size={14} /> <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
