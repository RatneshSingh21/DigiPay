import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import CreateAdminForm from "../CreateAdmin/CreateAdminForm";

const CreateSuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/user-auth/all");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Admins</h2>

        <button
          className="bg-primary hover:bg-secondary text-sm text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => setShowForm(true)}
        >
          Add Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase text-center">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3">Email / Phone</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Verified</th>
                  <th className="px-6 py-3">Created At</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {users.map((user, index) => (
                  <tr
                    key={user.userId}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="px-6 py-3 font-medium">{index + 1}</td>
                    <td className="px-6 py-3">{user.name}</td>
                    <td className="px-6 py-3 text-center">
                      {user.emailOrPhone}
                    </td>
                    <td className="px-6 py-3 text-center">{user.role}</td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.isVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {new Date(user.createdAt).toLocaleDateString()}{" "}
                      {new Date(user.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <CreateAdminForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}
    </>
  );
};

export default CreateSuperAdmin;
