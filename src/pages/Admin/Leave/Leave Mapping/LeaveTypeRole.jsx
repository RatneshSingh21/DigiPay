import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ConfirmModal from "../../../../components/ConfirmModal";

const LeaveTypeRole = () => {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [roleId, setRoleId] = useState(null);
  const [leaveOptions, setLeaveOptions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editId, setEditId] = useState(null); 

  // Role options constant
  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get("/RoleList/getall");
      if (Array.isArray(res.data)) {
        setRoles(res.data);
        console.log("Fetched roles:", res.data);
      } else {
        toast.error("Unexpected API response");
      }
    } catch {
      toast.error("Failed to fetch roles.");
    }
  };
  const roleOptions = roles.map((role) => ({
    value: role.roleID,
    label: role.roleName,
  }));

  // Fetch Data (List)
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("LeaveType/leave-type-role");
      setData(res.data);
    } catch (err) {
      // toast.error(err?.response?.data?.message || "Error fetching data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Active Leaves for Dropdown
  const fetchLeaves = async () => {
    try {
      const res = await axiosInstance.get("LeaveType/active");
      const options = res.data.map((leave) => ({
        value: leave.leaveTypeId,
        label: leave.leaveName,
      }));
      setLeaveOptions(options);
    } catch (err) {
      // toast.error(err?.response?.data?.message ||"Error fetching leave names");
      console.error("Error fetching leaves:", err);
    }
  };

  const handleDelete = async (mappingId) => {
    try {
      await axiosInstance.delete(`/LeaveType/leave-type-role/${mappingId}`);
      toast.success("Leave type role deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete leave type role");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchData();
    fetchLeaves();
  }, []);

  // Insert/Update Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Update
        await axiosInstance.put(`LeaveType/leave-type-role/${editId}`, {
          mappingId: editId,
          leaveTypeId: Number(leaveTypeId),
          roleId: Number(roleId),
        });
        toast.success("Leave type role updated successfully!");
      } else {
        // Add
        await axiosInstance.post(`LeaveType/leave-type-role`, {
          leaveTypeId: Number(leaveTypeId),
          roleId: Number(roleId),
        });
        toast.success("Leave type role added successfully!");
      }
      setLeaveTypeId("");
      setRoleId("");
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to save leave type role");
      console.error("Error saving data:", err);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.mappingId);
    setLeaveTypeId(item.leaveTypeId);
    setRoleId(item.roleId);
  };

  return (
    <div className="flex flex-col items-center py-2">
      {/* Form */}
      <div className="bg-white shadow-lg rounded-2xl px-6 py-4 w-full max-w-lg mb-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {editId ? "Edit Leave Type Role" : "Add Leave Type Role"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Name Dropdown */}
          <div>
            <label className="block text-gray-600 mb-1">Leave Name</label>
            <Select
              options={leaveOptions}
              value={
                leaveOptions.find((opt) => opt.value === leaveTypeId) || null
              }
              onChange={(selected) => setLeaveTypeId(selected.value)}
              placeholder="Select Leave"
              isSearchable
              className="basic-single"
              classNamePrefix="select"
            />
          </div>

          {/* Role ID Dropdown */}
          <div>
            <label className="block text-gray-600 mb-1">Role</label>
            <Select
              options={roleOptions}
              value={roleOptions.find((opt) => opt.value === roleId) || null}
              onChange={(selected) => setRoleId(selected?.value ?? null)}
              placeholder="Select Role"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition cursor-pointer"
          >
            {editId ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-lg rounded-2xl px-6 py-2 w-full max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Leave Type Role List
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 border text-center">Leave Name</th>
                  <th className="p-3 border text-center">Role</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr
                      key={item.mappingId}
                      className="hover:bg-gray-100 transition"
                    >
                      <td className="p-3 border text-center">
                        {leaveOptions.find(
                          (opt) => opt.value === item.leaveTypeId
                        )?.label || item.leaveTypeId}
                      </td>

                      <td className="p-3 border text-center">
                        {roleOptions.find((opt) => opt.value === item.roleId)
                          ?.label || item.roleId}
                      </td>

                      <td className="p-3 space-x-1.5 border text-center">
                        <div className="flex gap-3 items-center justify-center">
                          <button
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                            onClick={() => handleEdit(item)}
                          >
                            <FiEdit size={14} />
                            <span>Edit</span>
                          </button>

                          <button
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                            onClick={() => setConfirmDeleteId(item.mappingId)}
                          >
                            <FiTrash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center text-gray-500 p-4 border"
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete?"
          message="Are you sure you want to delete this leave type? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default LeaveTypeRole;
