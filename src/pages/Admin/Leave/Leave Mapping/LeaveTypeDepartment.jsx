import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ConfirmModal from "../../../../components/ConfirmModal";

const LeaveTypeDepartment = () => {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [leaveOptions, setLeaveOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  // Fetch mapping data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/LeaveType/leave-type-department/get");
      setData(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Leave options
  const fetchLeaves = async () => {
    try {
      const res = await axiosInstance.get("/LeaveType/active");
      const options = res.data.map((leave) => ({
        value: leave.leaveTypeId,
        label: leave.leaveName,
      }));
      setLeaveOptions(options);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching leave types");
      console.error("Error fetching leaves:", err);
    }
  };

  // Fetch Department options
  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/Department");
      const options = res.data.map((dept) => ({
        value: dept.id,
        label: dept.name,
      }));
      setDepartmentOptions(options);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching departments");
      console.error("Error fetching departments:", err);
    }
  };

  // Delete mapping
  const handleDelete = async (mappingId) => {
    try {
      await axiosInstance.delete(`/LeaveType/leave-type-department/delete/${mappingId}`);
      toast.success("Mapping deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(err?.response?.data?.message || "Failed to delete mapping");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchData(); 
    fetchLeaves();
    fetchDepartments();
  }, []);

  // Insert/Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`/LeaveType/leave-type-department/${editId}`, {
          mappingId: editId,
          leaveTypeId: Number(leaveTypeId),
          departmentId: Number(departmentId),
        });
        toast.success("Mapping updated successfully!");
      } else {
        await axiosInstance.post(`/LeaveType/leave-type-department`, {
          leaveTypeId: Number(leaveTypeId),
          departmentId: Number(departmentId),
        });
        toast.success("Mapping added successfully!");
      }
      setLeaveTypeId("");
      setDepartmentId("");
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to save mapping");
      console.error("Error saving data:", err);
    }
  };

  // Edit mapping
  const handleEdit = (item) => {
    setEditId(item.mappingId);
    setLeaveTypeId(item.leaveTypeId);
    setDepartmentId(item.departmentId);
  };

  return (
    <div className="flex flex-col items-center py-2">
      {/* Form */}
      <div className="bg-white shadow-lg rounded-2xl px-6 py-4 w-full max-w-lg mb-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {editId ? "Edit Leave Type Department" : "Add Leave Type Department"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Dropdown */}
          <div>
            <label className="block text-gray-600 mb-1">Leave Name</label>
            <Select
              options={leaveOptions}
              value={leaveOptions.find((opt) => opt.value === leaveTypeId) || null}
              onChange={(selected) => setLeaveTypeId(selected.value)}
              placeholder="Select Leave"
              isSearchable
              className="basic-single"
              classNamePrefix="select"
            />
          </div>

          {/* Department Dropdown */}
          <div>
            <label className="block text-gray-600 mb-1">Department</label>
            <Select
              options={departmentOptions}
              value={departmentOptions.find((opt) => opt.value === departmentId) || null}
              onChange={(selected) => setDepartmentId(selected.value)}
              placeholder="Select Department"
              isSearchable
              className="basic-single"
              classNamePrefix="select"
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
          Leave Type Department List
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
           <div className="rounded-lg border">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 border text-center">Leave Name</th>
                  <th className="p-3 border text-center">Department</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.mappingId} className="hover:bg-gray-100 transition">
                      <td className="p-3 border text-center">
                        {leaveOptions.find((opt) => opt.value === item.leaveTypeId)?.label || item.leaveTypeId}
                      </td>
                      <td className="p-3 border text-center">
                        {departmentOptions.find((opt) => opt.value === item.departmentId)?.label || item.departmentId}
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
                    <td colSpan="3" className="text-center text-gray-500 p-4 border">
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
          message="Are you sure you want to delete this mapping? This action cannot be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

export default LeaveTypeDepartment;
