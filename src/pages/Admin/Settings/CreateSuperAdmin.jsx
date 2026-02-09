import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import CreateAdminForm from "../CreateAdmin/CreateAdminForm";
import { FiInbox } from "react-icons/fi";

const CreateSuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [userCompanyStatus, setUserCompanyStatus] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /* -------------------- API CALLS -------------------- */

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/user-auth/all");
      setUsers(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get("/Company/my");
      setCompanies(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch companies");
    }
  };

  const fetchUserCompanyStatus = async () => {
    try {
      const res = await axiosInstance.get("/user-auth");
      setUserCompanyStatus(res.data || []);
    } catch {
      toast.error("Failed to fetch user access status");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
    fetchUserCompanyStatus();
  }, []);

  /* -------------------- HELPERS -------------------- */

  const getUserCompanyStatus = (userId, companyId) => {
    return userCompanyStatus.find(
      (u) => u.userId === userId && u.companyId === Number(companyId),
    );
  };

  const toggleUserAccess = async (userId, companyId, isActive) => {
    setActionLoading(`${userId}-${companyId}`);

    try {
      const url = isActive ? "/user-auth/disable" : "/user-auth/enable";

      await axiosInstance.put(url, null, {
        params: { userId, companyId },
      });

      toast.success(
        isActive
          ? "User disabled for selected company"
          : "User enabled for selected company",
      );

      fetchUserCompanyStatus();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <>
      {/* Header */}
      <div className="px-6 py-3 sticky top-14 z-10 bg-white border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Admins</h2>
          <p className="text-xs text-gray-500">
            Manage admin access across companies
          </p>
        </div>

        <button
          className="bg-primary hover:bg-secondary transition text-white px-5 py-2 rounded-lg text-sm font-medium shadow"
          onClick={() => setShowForm(true)}
        >
          + Add Admin
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FiInbox size={54} className="mb-3 text-gray-300" />
              <p className="text-sm font-semibold">No admins found</p>
              <p className="text-xs text-gray-400 mt-1">
                Click “Add Admin” to create the first admin
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">S.No</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => {
                    const companyId = selectedCompany[user.userId];
                    const status = companyId
                      ? getUserCompanyStatus(user.userId, companyId)
                      : null;

                    const isActive = status?.isActive;

                    return (
                      <tr
                        key={user.userId}
                        className="border-t border-gray-400 hover:bg-gray-50 transition text-center
                        "
                      >
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {index + 1}.
                        </td>

                        <td className="px-4 py-3 text-left">
                          <div className="font-medium text-gray-800">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.emailOrPhone}
                          </div>
                        </td>

                        <td className="px-4 py-3">{user.role}</td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.isVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {user.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString("en-GB")}
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3">
                          <div className="relative w-[150px] mx-auto">
                            <select
                              value={companyId || ""}
                              onChange={(e) =>
                                setSelectedCompany({
                                  ...selectedCompany,
                                  [user.userId]: e.target.value,
                                })
                              }
                              className={`w-full appearance-none rounded-full border px-4 py-2 pr-9 text-xs font-medium transition
                              ${
                                companyId
                                  ? "bg-white border-gray-300 text-gray-800"
                                  : "bg-gray-50 border-gray-200 text-gray-400"
                              }
                              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                              hover:border-gray-400`}
                            >
                              <option value="">Select company</option>
                              {companies.map((c) => (
                                <option key={c.companyId} value={c.companyId}>
                                  {c.companyName}
                                </option>
                              ))}
                            </select>

                            {/* Custom dropdown arrow */}
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              ▼
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {status ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {isActive ? "Active" : "Disabled"}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              Not Assigned
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-center">
                          <button
                            disabled={
                              !companyId ||
                              actionLoading === `${user.userId}-${companyId}`
                            }
                            onClick={() =>
                              toggleUserAccess(user.userId, companyId, isActive)
                            }
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                              isActive
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            } disabled:opacity-50`}
                          >
                            {actionLoading === `${user.userId}-${companyId}`
                              ? "Processing..."
                              : isActive
                                ? "Disable"
                                : "Enable"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <CreateAdminForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchUsers();
            fetchUserCompanyStatus();
          }}
        />
      )}
    </>
  );
};

export default CreateSuperAdmin;
