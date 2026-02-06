import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import AttendanceLockForm from "./AttendanceLockForm";
import { FiEdit } from "react-icons/fi";

const AttendanceLock = () => {
  const [locks, setLocks] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [locksRes, usersRes] = await Promise.all([
        axiosInstance.get("/component-locks/component", {
          params: { component: "attendance" },
        }),
        axiosInstance.get("/user-auth/all"),
      ]);

      setLocks(locksRes.data?.data || []);

      // 🔹 Create lookup map: { userId: name }
      const map = {};
      usersRes.data?.forEach((u) => {
        map[u.userId] = u.name;
      });
      setUsersMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Attendance Locks</h2>

        <button
          className="bg-primary hover:bg-secondary text-sm cursor-pointer text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => {
            setEditData(null);
            setIsModalOpen(true);
          }}
        >
          Create Lock
        </button>
      </div>

      {/* TABLE */}
      {/* TABLE / EMPTY STATE */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        {locks.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <p className="text-sm font-medium">No Attendance Locks Found</p>

            <p className="text-xs text-gray-400 mt-1 text-center max-w-sm">
              Attendance has not been locked for any month yet.
            </p>

            <button
              className="mt-4 bg-primary hover:bg-secondary cursor-pointer
                   text-sm text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
            >
              Create Lock
            </button>
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-xs text-center">
              <thead className="bg-gray-100 uppercase text-gray-700">
                <tr>
                  <th className="px-3 py-2">S.No</th>
                  <th className="px-3 py-2">Component</th>
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Locked Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Locked By</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {locks.map((lock, idx) => (
                  <tr key={lock.componentLockId} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{lock.component}</td>
                    <td className="px-3 py-2">{lock.month}</td>
                    <td className="px-3 py-2">{lock.year}</td>
                    <td className="px-3 py-2">
                      {new Date(lock.lockedDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lock.isLocked
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {lock.isLocked ? "Locked" : "Unlocked"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{lock.reason || "-"}</td>
                    <td className="px-3 py-2">{lock.source || "-"}</td>
                    <td className="px-3 py-2 font-medium">
                      {usersMap[lock.lockedBy] || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="flex items-center gap-1 px-2.5 py-1 cursor-pointer rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                        onClick={() => {
                          setEditData({
                            componentLockId: lock.componentLockId,
                            isLocked: lock.isLocked,
                            reason: lock.reason,
                            source: lock.source,
                          });
                          setIsModalOpen(true);
                        }}
                      >
                        <FiEdit size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <AttendanceLockForm
          editData={editData}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditData(null);
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
};

export default AttendanceLock;
